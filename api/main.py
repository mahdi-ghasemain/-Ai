import hashlib
import json
import os
import random
import re
import sqlite3
import time
from contextlib import closing
from pathlib import Path

import httpx
import jwt
from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

ROOT = Path(__file__).parent
DB_PATH = os.getenv("DATABASE_PATH", str(ROOT / "parsai.db"))
APP_ENV = os.getenv("APP_ENV", "development")
JWT_SECRET = os.getenv("JWT_SECRET", "") or ("parsai-development-only-secret" if APP_ENV != "production" else "")
KAVENEGAR_API_KEY = os.getenv("KAVENEGAR_API_KEY", "")
KAVENEGAR_TEMPLATE = os.getenv("KAVENEGAR_TEMPLATE", "parsai")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")
OPENAI_SEARCH_MODEL = os.getenv("OPENAI_SEARCH_MODEL", "gpt-5.5")
OPENAI_IMAGE_MODEL = os.getenv("OPENAI_IMAGE_MODEL", "gpt-image-1")
FREE_MONTHLY_QUOTA = int(os.getenv("FREE_MONTHLY_QUOTA", "5"))
OTP_TTL_SECONDS = 120
RECOMMENDATION_CACHE_SECONDS = int(os.getenv("RECOMMENDATION_CACHE_SECONDS", "43200"))
RECOMMENDATION_CACHE: dict[str, tuple[int, dict]] = {}

if APP_ENV == "production" and len(JWT_SECRET) < 32:
    raise RuntimeError("Production requires a JWT_SECRET of at least 32 characters")

app = FastAPI(title="Pars AI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:8082,http://localhost:8081").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with closing(db()) as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            language TEXT NOT NULL DEFAULT 'fa',
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS otp_codes (
            phone TEXT PRIMARY KEY,
            code_hash TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS favorites (
            user_id INTEGER NOT NULL,
            tool_id TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            PRIMARY KEY(user_id, tool_id)
        );
        CREATE TABLE IF NOT EXISTS subscriptions (
            user_id INTEGER PRIMARY KEY,
            plan TEXT NOT NULL DEFAULT 'free',
            period TEXT NOT NULL DEFAULT '',
            used INTEGER NOT NULL DEFAULT 0,
            updated_at INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS generations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            kind TEXT NOT NULL,
            prompt TEXT NOT NULL,
            result TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        """)
        conn.commit()


init_db()


TOOLS = [
    {"id": "nano-banana", "name": "Nano Banana", "category": "image", "rating": 4.8, "free": True, "api": True, "description_fa": "تولید و ویرایش سریع تصویر با کیفیت بالا.", "description_en": "Fast, high-quality AI image generation and editing.", "website": "https://gemini.google.com/"},
    {"id": "midjourney", "name": "Midjourney", "category": "image", "rating": 4.7, "free": False, "api": False, "description_fa": "تصاویر هنری و مفهومی با جزئیات بالا.", "description_en": "Highly detailed artistic and conceptual images.", "website": "https://www.midjourney.com/"},
    {"id": "dall-e", "name": "DALL·E", "category": "image", "rating": 4.6, "free": False, "api": True, "description_fa": "تصاویر متنوع و واقع‌گرایانه.", "description_en": "Versatile, realistic image generation.", "website": "https://openai.com/"},
    {"id": "github-copilot", "name": "GitHub Copilot", "category": "code", "rating": 4.7, "free": False, "api": False, "description_fa": "دستیار حرفه‌ای برنامه‌نویسی.", "description_en": "Professional coding assistant.", "website": "https://github.com/features/copilot"},
    {"id": "claude", "name": "Claude", "category": "content", "rating": 4.8, "free": True, "api": True, "description_fa": "نوشتن، تحلیل و خلاصه‌سازی محتوا.", "description_en": "Writing, analysis and summarization.", "website": "https://claude.ai/"},
]


class OTPRequest(BaseModel):
    phone: str
    language: str = Field(default="fa", pattern="^(fa|en)$")


class OTPVerify(BaseModel):
    phone: str
    code: str = Field(min_length=4, max_length=6)
    language: str = Field(default="fa", pattern="^(fa|en)$")


class PromptRequest(BaseModel):
    idea: str = Field(min_length=3, max_length=1000)
    style: str = "cinematic"
    ratio: str = "16:9"
    language: str = Field(default="fa", pattern="^(fa|en)$")


class ChatRequest(BaseModel):
    message: str = Field(min_length=2, max_length=2000)
    language: str = Field(default="fa", pattern="^(fa|en)$")


class ToolRecommendRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    language: str = Field(default="fa", pattern="^(fa|en)$")
    limit: int = Field(default=5, ge=1, le=8)


class ImageRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=1000)
    size: str = Field(default="1024x1024", pattern="^(1024x1024|1536x1024|1024x1536)$")


class VideoBriefRequest(BaseModel):
    idea: str = Field(min_length=3, max_length=1000)
    duration: int = Field(default=6, ge=3, le=30)
    language: str = Field(default="fa", pattern="^(fa|en)$")


class CodeAssistRequest(BaseModel):
    code: str = Field(min_length=2, max_length=8000)
    task: str = Field(default="review", pattern="^(review|fix|explain)$")
    language: str = Field(default="fa", pattern="^(fa|en)$")


def month_key() -> str:
    return time.strftime("%Y-%m", time.gmtime())


def get_subscription(user_id: int) -> dict:
    period = month_key()
    with closing(db()) as conn:
        row = conn.execute("SELECT * FROM subscriptions WHERE user_id=?", (user_id,)).fetchone()
        if not row or row["period"] != period:
            conn.execute(
                "INSERT OR REPLACE INTO subscriptions(user_id,plan,period,used,updated_at) VALUES(?,?,?,0,?)",
                (user_id, row["plan"] if row else "free", period, int(time.time())),
            )
            conn.commit()
            return {"plan": row["plan"] if row else "free", "period": period, "used": 0, "quota": FREE_MONTHLY_QUOTA}
        return {"plan": row["plan"], "period": row["period"], "used": row["used"], "quota": FREE_MONTHLY_QUOTA}


def consume_quota(user_id: int) -> dict:
    sub = get_subscription(user_id)
    if sub["plan"] != "free" or sub["used"] < sub["quota"]:
        with closing(db()) as conn:
            conn.execute("UPDATE subscriptions SET used=used+1, updated_at=? WHERE user_id=?", (int(time.time()), user_id))
            conn.commit()
        sub["used"] += 1
        return sub
    raise HTTPException(402, "Free monthly quota finished. Upgrade to a paid plan to continue.")


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("0098"):
        digits = "0" + digits[4:]
    elif digits.startswith("98"):
        digits = "0" + digits[2:]
    elif len(digits) == 10 and digits.startswith("9"):
        digits = "0" + digits
    if not re.fullmatch(r"09\d{9}", digits):
        raise HTTPException(422, "Invalid Iranian mobile number")
    return digits


def otp_hash(phone: str, code: str) -> str:
    return hashlib.sha256(f"{phone}:{code}:{JWT_SECRET}".encode()).hexdigest()


def create_token(user_id: int, phone: str) -> str:
    if not JWT_SECRET:
        raise HTTPException(503, "JWT_SECRET is not configured")
    now = int(time.time())
    return jwt.encode({"sub": str(user_id), "phone": phone, "iat": now, "exp": now + 30 * 86400}, JWT_SECRET, algorithm="HS256")


def current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing access token")
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=["HS256"])
        return {"id": int(payload["sub"]), "phone": payload["phone"]}
    except Exception as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired access token") from exc


async def send_sms(phone: str, code: str):
    if not KAVENEGAR_API_KEY:
        if APP_ENV == "production":
            raise HTTPException(503, "KAVENEGAR_API_KEY is not configured")
        return
    url = f"https://api.kavenegar.com/v1/{KAVENEGAR_API_KEY}/verify/lookup.json"
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(url, data={"receptor": phone, "token": code, "template": KAVENEGAR_TEMPLATE})
    if response.status_code != 200 or response.json().get("return", {}).get("status") != 200:
        raise HTTPException(502, "SMS provider rejected the request")


def ai_client() -> OpenAI:
    if not OPENAI_API_KEY:
        raise HTTPException(503, "OPENAI_API_KEY is not configured")
    return OpenAI(api_key=OPENAI_API_KEY)


def response_sources(response) -> list[dict]:
    """Collect URL citations returned by the Responses web-search tool."""
    data = response.model_dump() if hasattr(response, "model_dump") else {}
    found: dict[str, dict] = {}

    def visit(value):
        if isinstance(value, dict):
            url = value.get("url")
            if isinstance(url, str) and url.startswith("http"):
                found[url] = {"url": url, "title": value.get("title") or url}
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(data.get("output", []))
    return list(found.values())[:12]


def parse_json_object(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE)
    start, end = cleaned.find("{"), cleaned.rfind("}")
    if start < 0 or end <= start:
        raise ValueError("AI response did not contain JSON")
    return json.loads(cleaned[start:end + 1])


@app.get("/health")
def health():
    return {"status": "ok", "sms": bool(KAVENEGAR_API_KEY), "ai": bool(OPENAI_API_KEY), "environment": APP_ENV}


@app.post("/v1/auth/request-otp")
async def request_otp(body: OTPRequest):
    phone = normalize_phone(body.phone)
    code = f"{random.SystemRandom().randint(1000, 9999)}"
    now = int(time.time())
    with closing(db()) as conn:
        conn.execute("INSERT OR REPLACE INTO otp_codes(phone,code_hash,expires_at,attempts) VALUES(?,?,?,0)", (phone, otp_hash(phone, code), now + OTP_TTL_SECONDS))
        conn.commit()
    await send_sms(phone, code)
    result = {"sent": True, "expires_in": OTP_TTL_SECONDS}
    if APP_ENV != "production" and not KAVENEGAR_API_KEY:
        result["development_code"] = code
    return result


@app.post("/v1/auth/verify-otp")
def verify_otp(body: OTPVerify):
    phone = normalize_phone(body.phone)
    with closing(db()) as conn:
        record = conn.execute("SELECT * FROM otp_codes WHERE phone=?", (phone,)).fetchone()
        if not record or record["expires_at"] < int(time.time()) or record["attempts"] >= 5:
            raise HTTPException(401, "Code expired or unavailable")
        conn.execute("UPDATE otp_codes SET attempts=attempts+1 WHERE phone=?", (phone,))
        if record["code_hash"] != otp_hash(phone, body.code):
            conn.commit()
            raise HTTPException(401, "Invalid verification code")
        conn.execute("INSERT OR IGNORE INTO users(phone,language,created_at) VALUES(?,?,?)", (phone, body.language, int(time.time())))
        conn.execute("UPDATE users SET language=? WHERE phone=?", (body.language, phone))
        user = conn.execute("SELECT * FROM users WHERE phone=?", (phone,)).fetchone()
        conn.execute("DELETE FROM otp_codes WHERE phone=?", (phone,))
        conn.commit()
    return {"access_token": create_token(user["id"], phone), "token_type": "bearer", "user": {"id": user["id"], "phone": phone, "language": body.language}}


@app.get("/v1/tools")
def list_tools(category: str | None = None, free: bool | None = None, has_api: bool | None = Query(default=None, alias="api")):
    items = TOOLS
    if category:
        items = [item for item in items if item["category"] == category]
    if free is not None:
        items = [item for item in items if item["free"] == free]
    if has_api is not None:
        items = [item for item in items if item["api"] == has_api]
    return items


@app.get("/v1/tools/{tool_id}")
def get_tool(tool_id: str):
    tool = next((item for item in TOOLS if item["id"] == tool_id), None)
    if not tool:
        raise HTTPException(404, "Tool not found")
    return tool


@app.post("/v1/tools/recommend")
def recommend_tools(body: ToolRecommendRequest, user=Depends(current_user)):
    cache_key = hashlib.sha256(f"{body.language}:{body.limit}:{body.query.strip().lower()}".encode()).hexdigest()
    cached = RECOMMENDATION_CACHE.get(cache_key)
    now = int(time.time())
    if cached and cached[0] > now:
        return {**cached[1], "cached": True}

    output_language = "Persian" if body.language == "fa" else "English"
    instructions = f"""
You are the live research engine for Pars AI, an AI-tool discovery app.
Search the live web and recommend exactly {body.limit} currently available AI tools that best match the user's need.
Prefer official product websites and verify that each tool still exists. Do not invent prices, ratings, APIs, or free plans.
Return ONLY valid JSON with this shape:
{{"summary":"short {output_language} summary","tools":[{{"name":"tool name","category":"image|video|code|content|research|audio|other","free_plan":true,"has_api":false,"why":"short explanation in {output_language}","website":"official https URL","verified_date":"YYYY-MM-DD"}}]}}
If free-plan or API availability cannot be verified, use null. The website must be the official product URL.
""".strip()
    response = ai_client().responses.create(
        model=OPENAI_SEARCH_MODEL,
        instructions=instructions,
        input=body.query,
        tools=[{"type": "web_search", "search_context_size": "low"}],
        tool_choice="auto",
        store=False,
    )
    try:
        payload = parse_json_object(response.output_text)
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(502, "Online recommendation response could not be parsed") from exc

    tools = payload.get("tools")
    if not isinstance(tools, list):
        raise HTTPException(502, "Online recommendation response is incomplete")
    clean_tools = []
    for index, item in enumerate(tools[:body.limit]):
        if not isinstance(item, dict) or not item.get("name") or not item.get("website"):
            continue
        clean_tools.append({
            "id": re.sub(r"[^a-z0-9]+", "-", item["name"].lower()).strip("-") or f"online-{index}",
            "name": str(item["name"])[:100],
            "category": str(item.get("category") or "other")[:30],
            "free": item.get("free_plan"),
            "api": item.get("has_api"),
            "description": str(item.get("why") or "")[:500],
            "website": str(item["website"])[:500],
            "verified_date": str(item.get("verified_date") or "")[:20],
            "live": True,
        })
    result = {
        "summary": str(payload.get("summary") or "")[:500],
        "tools": clean_tools,
        "sources": response_sources(response),
        "model": OPENAI_SEARCH_MODEL,
        "live": True,
        "cached": False,
        "updated_at": now,
    }
    RECOMMENDATION_CACHE[cache_key] = (now + RECOMMENDATION_CACHE_SECONDS, result)
    return result


@app.get("/v1/favorites")
def favorites(user=Depends(current_user)):
    with closing(db()) as conn:
        ids = {row["tool_id"] for row in conn.execute("SELECT tool_id FROM favorites WHERE user_id=?", (user["id"],))}
    return [item for item in TOOLS if item["id"] in ids]


@app.put("/v1/favorites/{tool_id}", status_code=204)
def add_favorite(tool_id: str, user=Depends(current_user)):
    if not any(item["id"] == tool_id for item in TOOLS):
        raise HTTPException(404, "Tool not found")
    with closing(db()) as conn:
        conn.execute("INSERT OR IGNORE INTO favorites(user_id,tool_id,created_at) VALUES(?,?,?)", (user["id"], tool_id, int(time.time())))
        conn.commit()


@app.delete("/v1/favorites/{tool_id}", status_code=204)
def remove_favorite(tool_id: str, user=Depends(current_user)):
    with closing(db()) as conn:
        conn.execute("DELETE FROM favorites WHERE user_id=? AND tool_id=?", (user["id"], tool_id))
        conn.commit()


@app.post("/v1/prompts/generate")
def generate_prompt(body: PromptRequest, user=Depends(current_user)):
    instruction = "Return only a polished image-generation prompt in English."
    response = ai_client().responses.create(model=OPENAI_MODEL, instructions=instruction, input=f"Idea: {body.idea}\nStyle: {body.style}\nAspect ratio: {body.ratio}", store=False)
    return {"prompt": response.output_text, "model": OPENAI_MODEL}


@app.post("/v1/chat")
def chat(body: ChatRequest, user=Depends(current_user)):
    language = "Persian" if body.language == "fa" else "English"
    instructions = f"You are Pars AI, an AI-tool matchmaker. Reply in {language}. Recommend at most three appropriate tools and briefly explain why."
    response = ai_client().responses.create(model=OPENAI_MODEL, instructions=instructions, input=body.message, store=False)
    return {"answer": response.output_text, "model": OPENAI_MODEL}


@app.get("/v1/subscription")
def subscription(user=Depends(current_user)):
    return get_subscription(user["id"])


@app.post("/v1/images/generate")
def generate_image(body: ImageRequest, user=Depends(current_user)):
    sub = consume_quota(user["id"])
    try:
        result = ai_client().images.generate(model=OPENAI_IMAGE_MODEL, prompt=body.prompt, size=body.size)
        image = result.data[0]
        payload = getattr(image, "b64_json", None) or getattr(image, "url", "")
        kind = "b64" if getattr(image, "b64_json", None) else "url"
    except Exception as exc:
        raise HTTPException(502, f"Image service unavailable: {exc}") from exc
    with closing(db()) as conn:
        conn.execute(
            "INSERT INTO generations(user_id,kind,prompt,result,created_at) VALUES(?,?,?,?,?)",
            (user["id"], "image", body.prompt[:1000], (payload or "")[:2000000], int(time.time())),
        )
        conn.commit()
    return {"image": payload, "kind": kind, "model": OPENAI_IMAGE_MODEL, "subscription": sub}


@app.post("/v1/videos/brief")
def video_brief(body: VideoBriefRequest, user=Depends(current_user)):
    sub = consume_quota(user["id"])
    language = "Persian" if body.language == "fa" else "English"
    instructions = f"You are a video director. Reply in {language}. Return a {body.duration}-second shot-by-shot storyboard: shots, camera move, lighting, sound. Keep it practical for Runway/Pika."
    response = ai_client().responses.create(model=OPENAI_MODEL, instructions=instructions, input=body.idea, store=False)
    with closing(db()) as conn:
        conn.execute(
            "INSERT INTO generations(user_id,kind,prompt,result,created_at) VALUES(?,?,?,?,?)",
            (user["id"], "video-brief", body.idea[:1000], response.output_text[:10000], int(time.time())),
        )
        conn.commit()
    return {"brief": response.output_text, "model": OPENAI_MODEL, "subscription": sub}


@app.post("/v1/code/assist")
def code_assist(body: CodeAssistRequest, user=Depends(current_user)):
    sub = consume_quota(user["id"])
    language = "Persian" if body.language == "fa" else "English"
    instructions = f"You are a senior engineer. Reply in {language}. Task: {body.task}. Be concrete, prioritize by impact, propose minimal fixes with tests."
    response = ai_client().responses.create(model=OPENAI_MODEL, instructions=instructions, input=body.code, store=False)
    with closing(db()) as conn:
        conn.execute(
            "INSERT INTO generations(user_id,kind,prompt,result,created_at) VALUES(?,?,?,?,?)",
            (user["id"], f"code-{body.task}", body.code[:4000], response.output_text[:10000], int(time.time())),
        )
        conn.commit()
    return {"answer": response.output_text, "model": OPENAI_MODEL, "subscription": sub}
