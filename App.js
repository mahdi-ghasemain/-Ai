import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Vazirmatn_400Regular,
  Vazirmatn_600SemiBold,
  Vazirmatn_700Bold,
  Vazirmatn_900Black,
} from "@expo-google-fonts/vazirmatn";
import { api } from "./src/api";

const HERO = require("./assets/persepolis-hero.png");
const HOME_HERO = require("./assets/persepolis-home.png");

const TOOLS = [
  {
    id: "nano",
    name: "Nano Banana",
    icon: "image-outline",
    rating: "4.8",
    kind: { fa: "ساخت تصویر", en: "Image generation" },
    color: "#24534d",
    desc: { fa: "برای تولید و ویرایش تصویر با نتیجهٔ سریع و حرفه‌ای.", en: "Fast, professional AI image generation and editing." },
  },
  {
    id: "mid",
    name: "Midjourney",
    icon: "color-palette-outline",
    rating: "4.7",
    kind: { fa: "ساخت تصویر", en: "Image generation" },
    color: "#31466c",
    desc: { fa: "مناسب تصاویر هنری، مفهومی و بسیار باکیفیت.", en: "Ideal for artistic, conceptual, high-quality visuals." },
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    icon: "code-slash",
    rating: "4.7",
    kind: { fa: "برنامه‌نویسی", en: "Programming" },
    color: "#47355f",
    desc: { fa: "دستیار کدنویسی برای ساخت و بررسی کد.", en: "A coding assistant for writing and reviewing code." },
  },
  {
    id: "claude",
    name: "Claude",
    icon: "sparkles-outline",
    rating: "4.8",
    kind: { fa: "تولید محتوا", en: "Content creation" },
    color: "#5a4032",
    desc: { fa: "برای نوشتن، خلاصه‌سازی و تحلیل محتوا.", en: "For writing, summarizing, and analyzing content." },
  },
];
const CATEGORY_DATA = [
  ["image-outline", "imageCategory", "tools"],
  ["videocam-outline", "videoCategory", "tools"],
  ["code-slash", "codingCategory", "tools"],
  ["create-outline", "contentCategory", "tools"],
  ["book-outline", "studyCategory", "tools"],
  ["chatbubbles-outline", "guideCategory", "chat"],
];

const I18N = {
  fa: {
    splashTag: "هوش مصنوعی، به سبک ایران", splashQuote: "از گذشته الهام می‌گیریم\nبرای آینده می‌سازیم", start: "شروع کنید",
    languageTitle: "زبان برنامه را انتخاب کنید", languageSub: "Choose your language", continue: "ادامه",
    welcome: "خوش آمدید", phoneSub: "برای ادامه شماره تلفن را وارد کنید", sendCode: "ارسال کد تأیید", sending: "در حال ارسال...", changeLanguage: "تغییر زبان",
    verification: "کد تأیید", codeSent: "کد آزمایشی را وارد کنید", demoCode: "کد آزمایشی: 1234", verify: "تأیید و ورود", verifying: "در حال بررسی...", editPhone: "ویرایش شماره تلفن",
    phoneErrorTitle: "شماره تلفن", phoneError: "یک شماره آزمایشی وارد کنید.", codeErrorTitle: "کد اشتباه", codeError: "برای ورود آزمایشی کد 1234 را وارد کنید.",
    apiError: "خطای ارتباط", connectionFailed: "اتصال برقرار نشد", ideaTitle: "ایده را بنویس", ideaError: "ابتدا موضوع را وارد کن.",
    home: "خانه", favorites: "علاقه‌مندی‌ها", prompts: "پرامپت‌ها", search: "جستجو", guide: "راهنما",
    toolDetails: "جزئیات ابزار", openSoon: "به‌زودی", openSoonText: "اتصال امن به سرویس آنلاین در مرحلهٔ بعد فعال می‌شود.", openSite: "باز کردن سایت",
    readyPrompts: "پرامپت‌های آماده", samples: "نمونه‌ها", about: "معرفی", features: "ویژگی‌ها", feature1: "✓ کیفیت بالای تصاویر", feature2: "✓ ویرایش دقیق و طبیعی", feature3: "✓ سبک‌های متنوع و حرفه‌ای", feature4: "✓ مناسب استفاده شخصی و تجاری",
    saved: "در علاقه‌مندی‌ها ذخیره شده ♥", addSaved: "افزودن به علاقه‌مندی‌ها ♡",
    imageTools: "ساخت تصویر", bestTools: "بهترین ابزارهای هوش مصنوعی", imageToolsSub: "برای تولید و ویرایش تصویر", all: "همه", hasApi: "دارای API", free: "رایگان", web: "وب", toolSearch: "نیازت را بنویس؛ مثلاً ساخت ویدئوی رایگان", onlineSearch: "جستجوی آنلاین", searchingOnline: "در حال بررسی ابزارهای جدید...", onlineSources: "منابع بررسی", emptySaved: "هنوز ابزاری ذخیره نکرده‌ای.",
    promptBuilder: "ساخت پرامپت", professionalPrompt: "پرامپت حرفه‌ای بساز", promptCaption: "ایده‌ات را به یک دستور دقیق تبدیل کن.", promptPlaceholder: "مثلاً: عکس تبلیغاتی کفش در خیابان بارانی", realistic: "واقع‌گرایانه", cinematic: "سینمایی", advertising: "تبلیغاتی", buildPrompt: "ساخت پرامپت", building: "در حال ساخت...", suggestedPrompt: "پرامپت پیشنهادی", copyPrompt: "کپی پرامپت", popularPrompts: "پرامپت‌های محبوب", productPhoto: "عکاسی محصول", realisticPortrait: "پرترهٔ واقع‌گرایانه", cinematicPoster: "پوستر سینمایی", artistic: "هنری", historical: "منظره تاریخی", copy: "کپی",
    guideChat: "چت راهنما", chatHint: "نیازت را بنویس تا بهترین ابزارهای هوش مصنوعی را پیشنهاد بدهم.", assistantIntro: "من راهنمای Pars AI هستم. سؤال خود را بپرس تا پاسخ واقعی از مدل AI دریافت کنی.", messagePlaceholder: "پیامت را بنویس...",
    greeting: "سلام 👋", heroTitle: "چه کاری می‌خوای با\nهوش مصنوعی انجام بدی؟", heroSearch: "مثلاً: ساخت عکس، کدنویسی، خلاصه متن...", promoText: "برای ابزار منتخب، پرامپت حرفه‌ای بساز.", begin: "شروع ←", today: "پیشنهاد امروز",
    imageCategory: "ساخت تصویر", videoCategory: "ساخت ویدئو", codingCategory: "برنامه‌نویسی", contentCategory: "تولید محتوا", studyCategory: "درس و تحقیق", guideCategory: "چت راهنما",
  },
  en: {
    splashTag: "Artificial intelligence, inspired by Iran", splashQuote: "Inspired by the past\nBuilding the future", start: "Get started",
    languageTitle: "Choose your language", languageSub: "زبان برنامه را انتخاب کنید", continue: "Continue",
    welcome: "Welcome", phoneSub: "Enter any test phone number to continue", sendCode: "Continue in demo mode", sending: "Opening...", changeLanguage: "Change language",
    verification: "Verification code", codeSent: "Enter the demo verification code", demoCode: "Demo code: 1234", verify: "Verify & enter", verifying: "Verifying...", editPhone: "Edit phone number",
    phoneErrorTitle: "Phone number", phoneError: "Enter a test phone number.", codeErrorTitle: "Incorrect code", codeError: "Enter 1234 for demo access.",
    apiError: "Connection error", connectionFailed: "Connection failed", ideaTitle: "Describe your idea", ideaError: "Enter a topic first.",
    home: "Home", favorites: "Favorites", prompts: "Prompts", search: "Search", guide: "Guide",
    toolDetails: "Tool details", openSoon: "Coming soon", openSoonText: "Secure connection to the online service will be enabled next.", openSite: "Open website",
    readyPrompts: "Ready prompts", samples: "Samples", about: "Overview", features: "Features", feature1: "✓ High-quality images", feature2: "✓ Precise, natural editing", feature3: "✓ Diverse professional styles", feature4: "✓ Suitable for personal and commercial use",
    saved: "Saved to favorites ♥", addSaved: "Add to favorites ♡",
    imageTools: "Image generation", bestTools: "Best AI tools", imageToolsSub: "For image generation and editing", all: "All", hasApi: "API", free: "Free", web: "Web", toolSearch: "Describe your need, e.g. free AI video creation", onlineSearch: "Search online", searchingOnline: "Checking the latest AI tools...", onlineSources: "Research sources", emptySaved: "You have not saved any tools yet.",
    promptBuilder: "Prompt builder", professionalPrompt: "Build a professional prompt", promptCaption: "Turn your idea into a precise instruction.", promptPlaceholder: "Example: a shoe advertisement on a rainy street", realistic: "Realistic", cinematic: "Cinematic", advertising: "Advertising", buildPrompt: "Build prompt", building: "Building...", suggestedPrompt: "Suggested prompt", copyPrompt: "Copy prompt", popularPrompts: "Popular prompts", productPhoto: "Product photography", realisticPortrait: "Realistic portrait", cinematicPoster: "Cinematic poster", artistic: "Artistic", historical: "Historical landscape", copy: "Copy",
    guideChat: "AI guide", chatHint: "Describe your needs and I will recommend the best AI tools.", assistantIntro: "I am your Pars AI guide. Ask a question to get an AI-powered answer.", messagePlaceholder: "Write your message...",
    greeting: "Hello 👋", heroTitle: "What would you like to do\nwith artificial intelligence?", heroSearch: "Example: create an image, code, summarize text...", promoText: "Build a professional prompt for your selected tool.", begin: "Start →", today: "Today's picks",
    imageCategory: "Create images", videoCategory: "Create videos", codingCategory: "Programming", contentCategory: "Create content", studyCategory: "Study & research", guideCategory: "AI guide",
  },
};

function Top({ title, back, isFa = true }) {
  return (
    <View style={[s.top, !isFa && s.rowLtr]}>
      <Pressable onPress={back}>
        {back ? (
          <Ionicons name="chevron-back" size={27} color="#f7ddad" />
        ) : (
          <Ionicons name="sparkles" size={24} color="#eeb85d" />
        )}
      </Pressable>
      <Text style={s.topTitle}>{title}</Text>
      <View style={{ width: 30 }} />
    </View>
  );
}
function Card({ item, open, compact, language = "fa" }) {
  const isFa = language === "fa";
  return (
    <Pressable
      onPress={() => open(item)}
      style={[s.card, !isFa && s.rowLtr, compact && { padding: 10 }]}
    >
      <View style={[s.logo, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={27} color="#f8cf7a" />
      </View>
      <View style={s.cardInfo}>
        <Text style={[s.toolName, !isFa && s.textLeft]}>{item.name}</Text>
        <Text style={[s.meta, !isFa && s.textLeft]}>
          {item.live ? (isFa ? "بررسی آنلاین" : "Live verified") : `${item.kind[language]} · ★ ${item.rating}`}
        </Text>
        {!compact && (
          <Text numberOfLines={2} style={[s.desc, !isFa && s.textLeft]}>
            {item.desc[language]}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-back" size={22} color="#d3e1e0" />
    </Pressable>
  );
}

export default function App() {
  const windowSize = useWindowDimensions();
  const screenSize = {
    width: windowSize.width <= 600 ? windowSize.width : 430,
    height: windowSize.height,
    minHeight: windowSize.height,
  };
  const [fontsLoaded] = useFonts({
    Vazirmatn_400Regular,
    Vazirmatn_600SemiBold,
    Vazirmatn_700Bold,
    Vazirmatn_900Black,
  });
  const [page, setPage] = useState("welcome");
  const [language, setLanguage] = useState("fa");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState();
  const [saved, setSaved] = useState(["nano", "copilot"]);
  const [idea, setIdea] = useState("");
  const [promptResult, setPromptResult] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [developmentCode, setDevelopmentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineTools, setOnlineTools] = useState([]);
  const [onlineSummary, setOnlineSummary] = useState("");
  const [onlineSources, setOnlineSources] = useState([]);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const isFa = language === "fa";
  const t = I18N[language];
  const demoAuth = process.env.EXPO_PUBLIC_DEMO_AUTH !== "false";
  const open = (item) => {
    setChosen(item);
    setPage("detail");
  };
  const shown = useMemo(
    () =>
      TOOLS.filter((x) =>
        (x.name + x.kind[language]).toLowerCase().includes(query.toLowerCase()),
      ),
    [query, language],
  );
  const showApiError = (error) => Alert.alert(t.apiError, error.message || t.connectionFailed);
  const sendOtp = async () => {
    if (phone.trim().length < 3) return Alert.alert(t.phoneErrorTitle, t.phoneError);
    if (demoAuth) {
      setDevelopmentCode("1234");
      setPage("otp");
      return;
    }
    try {
      setLoading(true);
      const result = await api.requestOtp(phone, language);
      setDevelopmentCode(result.development_code || "");
      setPage("otp");
    } catch (error) { showApiError(error); } finally { setLoading(false); }
  };
  const verifyOtp = async () => {
    if (demoAuth) {
      if (otp !== "1234") return Alert.alert(t.codeErrorTitle, t.codeError);
      setPage("home");
      return;
    }
    try {
      setLoading(true);
      await api.verifyOtp(phone, otp, language);
      setPage("home");
    } catch (error) { showApiError(error); } finally { setLoading(false); }
  };
  const createPrompt = async () => {
    if (!idea) return Alert.alert(t.ideaTitle, t.ideaError);
    try {
      setLoading(true);
      const result = await api.generatePrompt({ idea, style: "cinematic", ratio: "16:9", language });
      setPromptResult(result.prompt);
    } catch (error) { showApiError(error); } finally { setLoading(false); }
  };
  const sendChat = async () => {
    if (!chatMessage.trim()) return;
    try {
      setLoading(true);
      const result = await api.chat(chatMessage, language);
      setChatAnswer(result.answer);
    } catch (error) { showApiError(error); } finally { setLoading(false); }
  };
  const searchOnlineTools = async () => {
    const need = query.trim() || (isFa ? "بهترین ابزارهای جدید هوش مصنوعی برای کاربران فارسی زبان" : "best new AI tools for everyday users");
    try {
      setSearchingOnline(true);
      const result = await api.recommendTools(need, language, 5);
      const icons = { image: "image-outline", video: "videocam-outline", code: "code-slash", content: "create-outline", research: "book-outline", audio: "musical-notes-outline", other: "sparkles-outline" };
      const colors = { image: "#24534d", video: "#69412f", code: "#47355f", content: "#5a4032", research: "#31466c", audio: "#63512f", other: "#315264" };
      setOnlineTools((result.tools || []).map((item) => ({
        ...item,
        icon: icons[item.category] || icons.other,
        color: colors[item.category] || colors.other,
        rating: "",
        kind: { fa: item.category, en: item.category },
        desc: { fa: item.description, en: item.description },
      })));
      setOnlineSummary(result.summary || "");
      setOnlineSources(result.sources || []);
    } catch (error) {
      showApiError(error);
    } finally {
      setSearchingOnline(false);
    }
  };
  if (!fontsLoaded)
    return <View style={{ flex: 1, backgroundColor: "#061b2a" }} />;
  const nav = (
    <View style={s.nav}>
      {[
        ["home-outline", t.home, "home"],
        ["heart-outline", t.favorites, "saved"],
        ["albums-outline", t.prompts, "prompt"],
        ["search-outline", t.search, "tools"],
        ["chatbubble-ellipses-outline", t.guide, "chat"],
      ].map(([i, t, p]) => (
        <Pressable key={p} onPress={() => setPage(p)} style={s.navItem}>
          <Ionicons
            name={i}
            size={21}
            color={page === p ? "#f1b859" : "#879ba6"}
          />
          <Text style={[s.navText, page === p && s.gold]}>{t}</Text>
        </Pressable>
      ))}
    </View>
  );
  if (page === "welcome")
    return (
      <SafeAreaView style={[s.app, screenSize]}>
        <StatusBar style="light" />
        <ImageBackground
          source={HERO}
          style={s.welcome}
          imageStyle={s.welcomeImage}
        >
          <View style={s.welcomeShade} />
          <View style={s.welcomeBrand}>
            <Text style={s.wing}>𓅃</Text>
            <Text style={s.welcomeName}>Pars AI</Text>
            <Text style={s.welcomeEnglish}>AI MATCHMAKER</Text>
            <Text style={s.welcomeTag}>{t.splashTag}</Text>
          </View>
          <View style={s.welcomeBottom}>
            <Text style={s.welcomeQuote}>
              {t.splashQuote}
            </Text>
            <View style={s.dots}>
              <View style={s.dotActive} />
              <View style={s.dot} />
              <View style={s.dot} />
            </View>
            <Pressable
              style={s.startButton}
              onPress={() => setPage("language")}
            >
              <Ionicons name="arrow-back" size={23} color="#142431" />
              <Text style={s.startText}>{t.start}</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  if (page === "language")
    return (
      <SafeAreaView style={[s.app, screenSize]}>
        <StatusBar style="light" />
        <ImageBackground source={HOME_HERO} style={s.authBackground}>
          <View style={s.authShade} />
          <View style={s.authCard}>
            <View style={s.authIcon}>
              <Ionicons name="language" size={30} color="#efb75a" />
            </View>
            <Text style={s.authTitle}>{t.languageTitle}</Text>
            <Text style={s.authSub}>{t.languageSub}</Text>
            <Pressable
              style={[s.languageButton, language === "fa" && s.languageActive]}
              onPress={() => setLanguage("fa")}
            >
              <Text
                style={[
                  s.languageText,
                  language === "fa" && s.languageTextActive,
                ]}
              >
                فارسی
              </Text>
              <Text style={s.languageCode}>FA</Text>
            </Pressable>
            <Pressable
              style={[s.languageButton, language === "en" && s.languageActive]}
              onPress={() => setLanguage("en")}
            >
              <Text
                style={[
                  s.languageText,
                  language === "en" && s.languageTextActive,
                ]}
              >
                English
              </Text>
              <Text style={s.languageCode}>EN</Text>
            </Pressable>
            <Pressable style={s.authPrimary} onPress={() => setPage("phone")}>
              <Text style={s.authPrimaryText}>{t.continue}</Text>
              <Ionicons name="arrow-forward" size={20} color="#142431" />
            </Pressable>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  if (page === "phone")
    return (
      <SafeAreaView style={[s.app, screenSize]}>
        <StatusBar style="light" />
        <ImageBackground source={HOME_HERO} style={s.authBackground}>
          <View style={s.authShade} />
          <View style={s.authCard}>
            <View style={s.authLogo}>
              <Ionicons name="sparkles" size={24} color="#efb75a" />
              <Text style={s.authBrand}>Pars AI</Text>
            </View>
            <Text style={s.authTitle}>{t.welcome}</Text>
            <Text style={s.authSub}>{t.phoneSub}</Text>
            <View style={s.phoneRow}>
              <Text style={s.countryCode}>+98</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={11}
                style={s.phoneInput}
                placeholder={demoAuth ? "912 000 0000" : "912 123 4567"}
                placeholderTextColor="#71838d"
                textAlign="left"
              />
            </View>
            <Pressable
              style={s.authPrimary}
              onPress={sendOtp}
              disabled={loading}
            >
              <Text style={s.authPrimaryText}>{loading ? t.sending : t.sendCode}</Text>
              <Ionicons name="arrow-forward" size={20} color="#142431" />
            </Pressable>
            <Pressable onPress={() => setPage("language")}>
              <Text style={s.authBack}>{t.changeLanguage}</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  if (page === "otp")
    return (
      <SafeAreaView style={[s.app, screenSize]}>
        <StatusBar style="light" />
        <ImageBackground source={HOME_HERO} style={s.authBackground}>
          <View style={s.authShade} />
          <View style={s.authCard}>
            <View style={s.authIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={31}
                color="#efb75a"
              />
            </View>
            <Text style={s.authTitle}>{t.verification}</Text>
            <Text style={s.authSub}>{t.codeSent}</Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={4}
              style={s.otpInput}
              placeholder="—  —  —  —"
              placeholderTextColor="#71838d"
              textAlign="center"
            />
            {developmentCode ? <Text style={s.demoCode}>{t.demoCode}</Text> : null}
            <Pressable
              style={s.authPrimary}
              onPress={verifyOtp}
              disabled={loading}
            >
              <Text style={s.authPrimaryText}>{loading ? t.verifying : t.verify}</Text>
              <Ionicons name="checkmark" size={21} color="#142431" />
            </Pressable>
            <Pressable onPress={() => setPage("phone")}>
              <Text style={s.authBack}>{t.editPhone}</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  if (page === "detail")
    return (
      <SafeAreaView style={[s.app, screenSize]}>
        <Top title={t.toolDetails} back={() => setPage("tools")} isFa={isFa} />
        <ScrollView contentContainerStyle={s.detail}>
          <ImageBackground
            source={HOME_HERO}
            style={s.detailHero}
            imageStyle={s.roundImage}
          >
            <View style={s.detailHeroShade} />
          </ImageBackground>
          <View style={[s.bigLogo, { backgroundColor: chosen.color }]}>
            <Ionicons name={chosen.icon} size={40} color="#f8cf7a" />
          </View>
          <Text style={s.detailTitle}>{chosen.name}</Text>
          <Text style={s.meta}>
            {chosen.kind[language]} · ★ {chosen.rating}
          </Text>
          <Text style={[s.detailDesc, !isFa && s.textLeft]}>{chosen.desc[language]}</Text>
          <Pressable
            style={s.primary}
            onPress={() => chosen.website ? Linking.openURL(chosen.website) : Alert.alert(t.openSoon, t.openSoonText)}
          >
            <Ionicons name="open-outline" size={19} color="#172332" />
            <Text style={s.primaryText}>{t.openSite}</Text>
          </Pressable>
          <View style={s.detailTabs}>
            <Pressable onPress={() => setPage("ready")}>
              <Text style={s.activeTab}>{t.readyPrompts}</Text>
            </Pressable>
            <Text style={s.detailTab}>{t.samples}</Text>
            <Text style={s.detailTab}>{t.about}</Text>
          </View>
          <View style={s.box}>
            <Text style={[s.section, !isFa && s.textLeft]}>{t.features}</Text>
            <Text style={[s.feature, !isFa && s.textLeft]}>{t.feature1}</Text>
            <Text style={[s.feature, !isFa && s.textLeft]}>{t.feature2}</Text>
            <Text style={[s.feature, !isFa && s.textLeft]}>{t.feature3}</Text>
            <Text style={[s.feature, !isFa && s.textLeft]}>{t.feature4}</Text>
          </View>
          <Pressable
            style={s.outline}
            onPress={() =>
              setSaved((a) =>
                a.includes(chosen.id)
                  ? a.filter((x) => x !== chosen.id)
                  : [...a, chosen.id],
              )
            }
          >
            <Text style={s.outlineText}>
              {saved.includes(chosen.id)
                ? t.saved
                : t.addSaved}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  let body;
  if (page === "tools")
    body = (
      <>
        <Top title={t.imageTools} isFa={isFa} />
        <View style={s.toolIntro}>
          <Ionicons name="color-palette" size={35} color="#f0bc61" />
          <Text style={s.toolIntroTitle}>{t.bestTools}</Text>
          <Text style={s.toolIntroText}>{t.imageToolsSub}</Text>
          <View style={s.filterRow}>
            {[t.all, t.hasApi, t.free, t.web].map((x, i) => (
              <Text key={x} style={[s.filterChip, i === 0 && s.filterActive]}>
                {x}
              </Text>
            ))}
          </View>
        </View>
        <TextInput
          style={s.search}
          value={query}
          onChangeText={setQuery}
          placeholder={t.toolSearch}
          placeholderTextColor="#82929b"
          textAlign={isFa ? "right" : "left"}
          returnKeyType="search"
          onSubmitEditing={searchOnlineTools}
        />
        <Pressable style={s.onlineButton} onPress={searchOnlineTools} disabled={searchingOnline}>
          <Ionicons name="globe-outline" size={19} color="#172332" />
          <Text style={s.onlineButtonText}>{searchingOnline ? t.searchingOnline : t.onlineSearch}</Text>
        </Pressable>
        {onlineSummary ? <Text style={[s.onlineSummary, !isFa && s.textLeft]}>{onlineSummary}</Text> : null}
        <FlatList
          data={onlineTools.length ? onlineTools : shown}
          keyExtractor={(x) => x.id}
          renderItem={({ item }) => <Card item={item} open={open} language={language} />}
          contentContainerStyle={s.list}
          ListFooterComponent={onlineSources.length ? (
            <View style={s.sourcesBox}>
              <Text style={[s.sourcesTitle, !isFa && s.textLeft]}>{t.onlineSources}</Text>
              {onlineSources.slice(0, 5).map((source) => (
                <Pressable key={source.url} onPress={() => Linking.openURL(source.url)}>
                  <Text numberOfLines={1} style={[s.sourceLink, !isFa && s.textLeft]}>↗ {source.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        />
      </>
    );
  else if (page === "saved")
    body = (
      <>
        <Top title={t.favorites} isFa={isFa} />
        <FlatList
          data={TOOLS.filter((x) => saved.includes(x.id))}
          keyExtractor={(x) => x.id}
          renderItem={({ item }) => <Card item={item} open={open} language={language} />}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <Text style={s.empty}>{t.emptySaved}</Text>
          }
        />
      </>
    );
  else if (page === "prompt")
    body = (
      <>
        <Top title={t.promptBuilder} isFa={isFa} />
        <ScrollView contentContainerStyle={s.pad}>
          <View style={s.promptHead}>
            <Ionicons name="color-wand-outline" size={34} color="#f2bd60" />
            <View>
              <Text style={s.promptTitle}>{t.professionalPrompt}</Text>
              <Text style={s.caption}>
                {t.promptCaption}
              </Text>
            </View>
          </View>
          <TextInput
            style={s.idea}
            value={idea}
            onChangeText={setIdea}
            multiline
            textAlign="right"
            placeholder={t.promptPlaceholder}
            placeholderTextColor="#82929b"
          />
          <View style={s.chips}>
            {[t.realistic, t.cinematic, t.advertising, "16:9"].map((x) => (
              <Text key={x} style={s.chip}>
                {x}
              </Text>
            ))}
          </View>
          <Pressable
            style={s.primary}
            onPress={createPrompt}
            disabled={loading}
          >
            <Ionicons name="sparkles" size={19} color="#172332" />
            <Text style={s.primaryText}>{loading ? t.building : t.buildPrompt}</Text>
          </Pressable>
          {promptResult ? (
            <View style={s.resultBox}>
              <Text style={s.resultLabel}>{t.suggestedPrompt}</Text>
              <Text style={s.resultText}>{promptResult}</Text>
              <Pressable style={s.copyRow}>
                <Ionicons name="copy-outline" size={18} color="#f2bd60" />
                <Text style={s.copy}>{t.copyPrompt}</Text>
              </Pressable>
            </View>
          ) : null}
          <Text style={s.section}>{t.popularPrompts}</Text>
          {[t.productPhoto, t.realisticPortrait, t.cinematicPoster].map((x) => (
            <View style={s.template} key={x}>
              <Text style={s.templateTitle}>{x}</Text>
              <Ionicons name="copy-outline" size={17} color="#f1ba62" />
            </View>
          ))}
        </ScrollView>
      </>
    );
  else if (page === "ready")
    body = (
      <>
        <Top title={t.readyPrompts} isFa={isFa} />
        <ScrollView contentContainerStyle={s.pad}>
          <Text style={s.readyTool}>Nano Banana</Text>
          <View style={s.filterRow}>
            {[t.all, t.advertising, t.realistic, t.artistic].map((x, i) => (
              <Text key={x} style={[s.filterChip, i === 0 && s.filterActive]}>
                {x}
              </Text>
            ))}
          </View>
          {[
            [
              `${t.productPhoto} ${t.advertising}`,
              "A professional commercial photography of a running shoe on a wet city street...",
            ],
            [
              t.realisticPortrait,
              "A realistic portrait with natural cinematic lighting and fine details...",
            ],
            [
              t.historical,
              "A cinematic view of Persepolis at sunset with golden light...",
            ],
          ].map(([title, copy]) => (
            <View style={s.readyCard} key={title}>
              <ImageBackground
                source={HOME_HERO}
                style={s.readyImage}
                imageStyle={s.readyImageRound}
              />
              <View style={s.readyBody}>
                <Text style={s.readyTitle}>{title}</Text>
                <Text style={s.readyCopy} numberOfLines={3}>
                  {copy}
                </Text>
                <Pressable style={s.miniCopy}>
                  <Ionicons name="copy-outline" size={15} color="#efbd63" />
                  <Text style={s.copy}>{t.copy}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </>
    );
  else if (page === "chat")
    body = (
      <>
        <Top title={t.guideChat} isFa={isFa} />
        <ScrollView contentContainerStyle={s.chatPad}>
          <View style={s.userBubble}>
            <Text style={s.bubbleText}>
              {chatMessage || t.chatHint}
            </Text>
          </View>
          <View style={s.aiRow}>
            <View style={s.aiAvatar}>
              <Ionicons name="sparkles" size={18} color="#f6c66e" />
            </View>
            <View style={s.aiBubble}>
              <Text style={s.aiText}>
                {chatAnswer || t.assistantIntro}
              </Text>
            </View>
          </View>
        </ScrollView>
        <View style={s.chatInput}>
          <Pressable style={s.send} onPress={sendChat} disabled={loading}>
            <Ionicons name="arrow-up" size={20} color="#142431" />
          </Pressable>
          <TextInput
            style={s.chatField}
            value={chatMessage}
            onChangeText={setChatMessage}
            placeholder={t.messagePlaceholder}
            placeholderTextColor="#84949d"
            textAlign="right"
          />
        </View>
      </>
    );
  else
    body = (
      <>
        <Top title="Pars AI" isFa={isFa} />
        <ScrollView contentContainerStyle={s.pad}>
          <ImageBackground
            source={HOME_HERO}
            style={s.homeHero}
            imageStyle={s.homeHeroImage}
          >
            <View style={s.homeShade} />
            <View style={s.heroBrand}>
              <Text style={s.heroBrandText}>Pars AI</Text>
              <Text style={s.heroBrandSub}>{t.splashTag}</Text>
            </View>
            <View style={s.heroContent}>
              <Text style={[s.greeting, !isFa && s.textLeft]}>{t.greeting}</Text>
              <Text style={[s.heroTitle, !isFa && s.textLeft]}>{t.heroTitle}</Text>
              <Pressable style={s.heroSearch} onPress={() => setPage("tools")}>
                <Ionicons name="search" size={24} color="#152a37" />
                <Text style={s.searchLabel}>
                  {t.heroSearch}
                </Text>
              </Pressable>
            </View>
          </ImageBackground>
          <View style={s.grid}>
            {CATEGORY_DATA.map(([i, labelKey, p]) => (
              <Pressable key={labelKey} style={s.category} onPress={() => setPage(p)}>
                <Ionicons name={i} size={30} color="#efb757" />
                <Text style={s.cat}>{t[labelKey]}</Text>
              </Pressable>
            ))}
          </View>
          <View style={s.promo}>
            <View>
              <Text style={[s.promoTitle, !isFa && s.textLeft]}>{t.promptBuilder}</Text>
              <Text style={s.promoText}>
                {t.promoText}
              </Text>
            </View>
            <Pressable style={s.promoBtn} onPress={() => setPage("prompt")}>
              <Text style={s.promoBtnText}>{t.begin}</Text>
            </Pressable>
          </View>
          <Text style={[s.section, !isFa && s.textLeft]}>{t.today}</Text>
          {TOOLS.slice(0, 2).map((x) => (
            <Card key={x.id} item={x} open={open} compact language={language} />
          ))}
        </ScrollView>
      </>
    );
  return (
    <SafeAreaView style={[s.app, screenSize]}>
      <StatusBar style="light" />
      {body}
      {nav}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  rowLtr: { flexDirection: "row" },
  textLeft: { textAlign: "left" },
  app: {
    flex: 1,
    backgroundColor: "#061b2a",
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    overflow: "hidden",
  },
  top: {
    height: 58,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#173747",
    backgroundColor: "#061b2a",
  },
  topTitle: {
    color: "#f6d597",
    fontSize: 19,
    fontFamily: "Vazirmatn_900Black",
    textAlign: "center",
    flex: 1,
  },
  pad: { padding: 12, paddingBottom: 90 },
  heroTitle: {
    color: "#fff9ee",
    fontSize: 24,
    fontFamily: "Vazirmatn_900Black",
    lineHeight: 39,
    textAlign: "right",
    marginTop: 7,
    textShadowColor: "#000",
    textShadowRadius: 8,
  },
  caption: {
    color: "#aab9bf",
    fontSize: 13,
    fontFamily: "Vazirmatn_400Regular",
    textAlign: "right",
    marginTop: 4,
  },
  heroSearch: {
    flexDirection: "row-reverse",
    gap: 8,
    backgroundColor: "rgba(251,248,240,.96)",
    borderColor: "#efb859",
    borderWidth: 1.5,
    borderRadius: 13,
    paddingHorizontal: 13,
    height: 46,
    marginTop: 14,
    alignItems: "center",
  },
  searchLabel: {
    color: "#737d82",
    flex: 1,
    textAlign: "right",
    fontSize: 11,
    fontFamily: "Vazirmatn_400Regular",
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 11,
  },
  category: {
    width: "31.7%",
    height: 94,
    marginBottom: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#365e71",
    backgroundColor: "#0b2637",
    alignItems: "center",
    justifyContent: "center",
    padding: 7,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  cat: {
    color: "#f5f2e9",
    fontSize: 11,
    fontFamily: "Vazirmatn_700Bold",
    marginTop: 7,
    textAlign: "center",
  },
  promo: {
    backgroundColor: "#102f40",
    borderColor: "#99733b",
    borderWidth: 1,
    padding: 15,
    borderRadius: 15,
    marginTop: 5,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoTitle: {
    color: "#fce5b9",
    fontSize: 18,
    fontFamily: "Vazirmatn_900Black",
    textAlign: "right",
  },
  promoText: {
    color: "#bdc8c9",
    fontSize: 10,
    width: 170,
    lineHeight: 18,
    marginTop: 3,
    textAlign: "right",
    fontFamily: "Vazirmatn_400Regular",
  },
  promoBtn: {
    backgroundColor: "#ecb354",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 11,
  },
  promoBtnText: {
    color: "#172331",
    fontFamily: "Vazirmatn_900Black",
    fontSize: 11,
  },
  section: {
    color: "#f7dfa8",
    fontSize: 17,
    fontFamily: "Vazirmatn_900Black",
    textAlign: "right",
    marginTop: 20,
    marginBottom: 9,
  },
  card: {
    flexDirection: "row-reverse",
    backgroundColor: "#0c2737",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#294e60",
    marginBottom: 9,
    padding: 11,
    alignItems: "center",
  },
  logo: {
    height: 48,
    width: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1, marginHorizontal: 10 },
  toolName: {
    color: "#fff7e9",
    textAlign: "right",
    fontFamily: "Vazirmatn_700Bold",
    fontSize: 14,
  },
  meta: {
    color: "#edb65b",
    textAlign: "right",
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Vazirmatn_600SemiBold",
  },
  desc: {
    color: "#b4c0c3",
    textAlign: "right",
    fontSize: 10,
    marginTop: 3,
    lineHeight: 16,
    fontFamily: "Vazirmatn_400Regular",
  },
  nav: {
    flexDirection: "row-reverse",
    height: 67,
    borderTopWidth: 1,
    borderTopColor: "#2b4a5a",
    backgroundColor: "#061b2a",
    justifyContent: "space-around",
    paddingTop: 7,
  },
  navItem: { alignItems: "center", width: 70 },
  navText: {
    color: "#879ba6",
    fontSize: 9,
    marginTop: 2,
    fontFamily: "Vazirmatn_600SemiBold",
  },
  gold: { color: "#f1b859" },
  search: {
    height: 47,
    margin: 14,
    marginBottom: 5,
    color: "#fff6e7",
    borderRadius: 13,
    borderColor: "#355a68",
    borderWidth: 1,
    paddingHorizontal: 14,
    backgroundColor: "#0d293a",
    fontFamily: "Vazirmatn_400Regular",
  },
  onlineButton: {
    height: 44,
    marginHorizontal: 14,
    marginTop: 7,
    marginBottom: 5,
    borderRadius: 13,
    backgroundColor: "#efb75a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  onlineButtonText: { color: "#172332", fontSize: 12, fontFamily: "Vazirmatn_900Black" },
  onlineSummary: { color: "#d5dfdc", fontSize: 11, lineHeight: 19, textAlign: "right", marginHorizontal: 15, marginTop: 8, fontFamily: "Vazirmatn_400Regular" },
  sourcesBox: { marginTop: 12, backgroundColor: "#0d293a", borderWidth: 1, borderColor: "#294e60", borderRadius: 13, padding: 12 },
  sourcesTitle: { color: "#f0bd62", textAlign: "right", fontSize: 12, fontFamily: "Vazirmatn_700Bold", marginBottom: 5 },
  sourceLink: { color: "#9bc9e2", textAlign: "right", fontSize: 10, lineHeight: 21, textDecorationLine: "underline" },
  list: { padding: 14, paddingTop: 4, paddingBottom: 85 },
  empty: {
    color: "#aab9bf",
    textAlign: "center",
    marginTop: 80,
    fontSize: 14,
    fontFamily: "Vazirmatn_400Regular",
  },
  idea: {
    minHeight: 135,
    padding: 14,
    color: "#f7f0e3",
    textAlignVertical: "top",
    backgroundColor: "#0d293a",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#345667",
    marginTop: 21,
    fontSize: 14,
    lineHeight: 24,
    fontFamily: "Vazirmatn_400Regular",
  },
  chips: { flexDirection: "row-reverse", flexWrap: "wrap", marginTop: 10 },
  chip: {
    color: "#f3c66f",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#486673",
    marginLeft: 6,
    marginBottom: 6,
    fontSize: 11,
    fontFamily: "Vazirmatn_600SemiBold",
  },
  primary: {
    backgroundColor: "#eab052",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    padding: 14,
    marginTop: 15,
  },
  primaryText: {
    color: "#172332",
    fontSize: 14,
    fontFamily: "Vazirmatn_900Black",
  },
  template: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#0d293a",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#244859",
  },
  templateTitle: { color: "#edf2ed", fontFamily: "Vazirmatn_700Bold" },
  copy: { color: "#f1ba62", fontSize: 11, fontFamily: "Vazirmatn_600SemiBold" },
  detail: { padding: 15, paddingBottom: 36 },
  bigLogo: {
    width: 80,
    height: 80,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: -38,
    borderWidth: 4,
    borderColor: "#071c2c",
  },
  detailTitle: {
    color: "#fff5e4",
    fontFamily: "Vazirmatn_900Black",
    textAlign: "center",
    fontSize: 23,
    marginTop: 9,
  },
  detailDesc: {
    color: "#c4d0d0",
    textAlign: "right",
    lineHeight: 25,
    marginTop: 22,
    fontSize: 14,
    fontFamily: "Vazirmatn_400Regular",
  },
  box: {
    backgroundColor: "#0d293a",
    borderWidth: 1,
    borderColor: "#294d5d",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  feature: {
    color: "#d7e1dc",
    textAlign: "right",
    marginTop: 10,
    fontSize: 13,
    fontFamily: "Vazirmatn_400Regular",
  },
  outline: {
    borderWidth: 1,
    borderColor: "#bd9653",
    borderRadius: 14,
    padding: 13,
    marginTop: 9,
    alignItems: "center",
  },
  outlineText: { color: "#f1c36e", fontFamily: "Vazirmatn_700Bold" },
  welcome: { flex: 1, justifyContent: "space-between" },
  welcomeImage: { resizeMode: "cover" },
  welcomeShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,19,31,.32)",
  },
  welcomeBrand: { alignItems: "center", paddingTop: 44, zIndex: 2 },
  wing: {
    color: "#f5c15f",
    fontSize: 68,
    textShadowColor: "#000",
    textShadowRadius: 10,
  },
  welcomeName: {
    color: "#f6bd55",
    fontSize: 42,
    fontFamily: "Vazirmatn_900Black",
    marginTop: -7,
    textShadowColor: "#06131d",
    textShadowRadius: 8,
  },
  welcomeEnglish: {
    color: "#ffe5ac",
    fontSize: 14,
    letterSpacing: 2.3,
    fontWeight: "700",
  },
  welcomeTag: {
    color: "#f9ead0",
    fontSize: 12,
    marginTop: 6,
    fontFamily: "Vazirmatn_400Regular",
  },
  welcomeBottom: { padding: 22, paddingBottom: 26, zIndex: 2 },
  welcomeQuote: {
    color: "#fff3d7",
    fontSize: 15,
    lineHeight: 26,
    textAlign: "right",
    fontFamily: "Vazirmatn_700Bold",
    textShadowColor: "#000",
    textShadowRadius: 8,
  },
  dots: {
    flexDirection: "row-reverse",
    alignSelf: "center",
    marginVertical: 15,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#60737d",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#f4c56b",
    marginHorizontal: 4,
  },
  startButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#efb653",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  startText: {
    color: "#142431",
    fontSize: 15,
    fontFamily: "Vazirmatn_900Black",
  },
  homeHero: {
    height: 245,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  homeHeroImage: { borderRadius: 15, resizeMode: "cover" },
  homeShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,17,28,.35)",
  },
  heroContent: { zIndex: 2, padding: 14 },
  greeting: {
    color: "#fff7e8",
    fontSize: 14,
    fontFamily: "Vazirmatn_700Bold",
    textAlign: "right",
  },
  heroBrand: {
    position: "absolute",
    left: 14,
    top: 12,
    zIndex: 3,
    backgroundColor: "rgba(4,25,38,.72)",
    borderWidth: 1,
    borderColor: "rgba(239,183,87,.65)",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  heroBrandText: {
    color: "#f2bd60",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  heroBrandSub: {
    color: "#f5e8cf",
    fontSize: 8,
    fontFamily: "Vazirmatn_400Regular",
    textAlign: "right",
  },
  detailHero: { height: 180, borderRadius: 16, overflow: "hidden" },
  roundImage: { borderRadius: 16, resizeMode: "cover" },
  detailHeroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,21,31,.12)",
  },
  promptHead: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0d293a",
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#294e60",
  },
  promptTitle: {
    color: "#f7dfa8",
    fontSize: 18,
    fontFamily: "Vazirmatn_900Black",
    textAlign: "right",
  },
  resultBox: {
    backgroundColor: "#0d293a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#8c6c3d",
    padding: 14,
    marginTop: 14,
  },
  resultLabel: {
    color: "#f0bd62",
    fontSize: 13,
    fontFamily: "Vazirmatn_700Bold",
    textAlign: "right",
  },
  resultText: {
    color: "#e7ece8",
    fontSize: 12,
    lineHeight: 21,
    marginTop: 9,
    textAlign: "left",
  },
  copyRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  chatPad: { padding: 14, paddingBottom: 90 },
  userBubble: {
    backgroundColor: "#0f4c6a",
    borderRadius: 15,
    borderTopRightRadius: 4,
    padding: 13,
    marginLeft: 45,
    marginBottom: 14,
  },
  bubbleText: {
    color: "#f7fbfa",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right",
    fontFamily: "Vazirmatn_400Regular",
  },
  aiRow: { flexDirection: "row-reverse", alignItems: "flex-end" },
  aiAvatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#173b4d",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },
  aiBubble: {
    flex: 1,
    backgroundColor: "#0d293a",
    borderRadius: 15,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: "#294e60",
    padding: 13,
  },
  aiText: {
    color: "#e8eee9",
    fontSize: 12,
    lineHeight: 22,
    textAlign: "right",
    fontFamily: "Vazirmatn_400Regular",
  },
  chatInput: {
    height: 67,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#264656",
    backgroundColor: "#061b2a",
  },
  chatField: {
    flex: 1,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#0d293a",
    borderWidth: 1,
    borderColor: "#315466",
    paddingHorizontal: 13,
    color: "#fff",
    fontFamily: "Vazirmatn_400Regular",
  },
  send: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#eab052",
    alignItems: "center",
    justifyContent: "center",
  },
  toolIntro: { alignItems: "center", paddingTop: 10, paddingHorizontal: 14 },
  toolIntroTitle: { color: "#f6d89a", fontSize: 16, fontFamily: "Vazirmatn_900Black", marginTop: 4 },
  toolIntroText: { color: "#c0cacb", fontSize: 12, fontFamily: "Vazirmatn_400Regular" },
  filterRow: { flexDirection: "row-reverse", justifyContent: "center", flexWrap: "wrap", gap: 7, marginTop: 10, marginBottom: 5 },
  filterChip: { color: "#c5cfd0", fontSize: 10, fontFamily: "Vazirmatn_600SemiBold", backgroundColor: "#102d3d", borderWidth: 1, borderColor: "#2b4c5c", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 13 },
  filterActive: { color: "#172332", backgroundColor: "#efb75a", borderColor: "#efb75a" },
  detailTabs: { flexDirection: "row-reverse", justifyContent: "space-around", borderBottomWidth: 1, borderBottomColor: "#31505e", marginTop: 18, paddingBottom: 9 },
  detailTab: { color: "#b8c5c8", fontSize: 11, fontFamily: "Vazirmatn_600SemiBold" },
  activeTab: { color: "#f1bc5f", fontSize: 11, fontFamily: "Vazirmatn_700Bold", borderBottomWidth: 2, borderBottomColor: "#f1bc5f", paddingBottom: 8 },
  readyTool: { color: "#f0bc61", fontSize: 14, fontWeight: "800", textAlign: "center" },
  readyCard: { flexDirection: "row-reverse", backgroundColor: "#0c2737", borderRadius: 14, borderWidth: 1, borderColor: "#2b4e5f", padding: 8, marginTop: 10, overflow: "hidden" },
  readyImage: { width: 108, height: 114, borderRadius: 11, overflow: "hidden" },
  readyImageRound: { borderRadius: 11, resizeMode: "cover" },
  readyBody: { flex: 1, paddingHorizontal: 9 },
  readyTitle: { color: "#fff5e3", fontSize: 12, fontFamily: "Vazirmatn_700Bold", textAlign: "right" },
  readyCopy: { color: "#c0cbcc", fontSize: 9, lineHeight: 15, marginTop: 3, textAlign: "left" },
  miniCopy: { height: 28, borderRadius: 9, backgroundColor: "#2a3438", flexDirection: "row-reverse", gap: 5, alignItems: "center", justifyContent: "center", marginTop: 5 },
  authBackground: { flex: 1, justifyContent: "center", padding: 20 },
  authShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(2,18,29,.76)" },
  authCard: { zIndex: 2, backgroundColor: "rgba(6,27,42,.97)", borderWidth: 1, borderColor: "#886a3d", borderRadius: 22, padding: 22, shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 20 },
  authIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: "#102f40", borderWidth: 1, borderColor: "#8c6d3d", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 14 },
  authLogo: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 13 },
  authBrand: { color: "#efb75a", fontSize: 21, fontWeight: "900" },
  authTitle: { color: "#fff6e7", fontSize: 23, fontWeight: "900", textAlign: "center" },
  authSub: { color: "#aebdc1", fontSize: 12, textAlign: "center", marginTop: 6, marginBottom: 19, fontFamily: "Vazirmatn_400Regular" },
  languageButton: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: "#35596a", backgroundColor: "#0c293a", flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 9 },
  languageActive: { borderColor: "#efb75a", backgroundColor: "#173542" },
  languageText: { color: "#e8efec", fontSize: 14, fontFamily: "Vazirmatn_700Bold" },
  languageTextActive: { color: "#f5c56c" },
  languageCode: { color: "#718792", fontSize: 11, fontWeight: "700" },
  authPrimary: { height: 52, borderRadius: 14, backgroundColor: "#efb75a", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 },
  authPrimaryText: { color: "#142431", fontSize: 13, fontWeight: "900" },
  phoneRow: { height: 54, borderRadius: 14, borderWidth: 1, borderColor: "#3b5f70", backgroundColor: "#0c293a", flexDirection: "row", alignItems: "center", paddingHorizontal: 14 },
  countryCode: { color: "#f2c36c", fontSize: 14, fontWeight: "800", paddingRight: 12, borderRightWidth: 1, borderRightColor: "#355465" },
  phoneInput: { flex: 1, color: "#fff", fontSize: 16, letterSpacing: 1, paddingLeft: 12 },
  otpInput: { height: 64, borderRadius: 14, borderWidth: 1, borderColor: "#8c6d3d", backgroundColor: "#0c293a", color: "#f6c56b", fontSize: 25, letterSpacing: 12 },
  demoCode: { color: "#788e98", fontSize: 10, textAlign: "center", marginTop: 9 },
  authBack: { color: "#d1bd96", fontSize: 11, textAlign: "center", marginTop: 16, fontWeight: "700" },
});
