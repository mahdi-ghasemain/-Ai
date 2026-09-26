export const categories = [
  ['all', 'همه ابزارها', 'All tools', 'apps-outline'],
  ['image', 'ساخت تصویر', 'Images', 'image-outline'],
  ['video', 'ساخت ویدئو', 'Video', 'videocam-outline'],
  ['code', 'برنامه‌نویسی', 'Coding', 'code-slash'],
  ['content', 'نوشتن و محتوا', 'Writing', 'create-outline'],
  ['research', 'درس و تحقیق', 'Research', 'book-outline'],
  ['audio', 'صدا و موسیقی', 'Audio', 'musical-notes-outline'],
];
// Editorial descriptions, not live pricing or fabricated review scores.
export const catalog = [
  ['nano', 'Nano Banana / Gemini', 'image', 'https://gemini.google.com/', 'ساخت و ویرایش تصویر در Gemini؛ شرایط دسترسی را در سایت بررسی کن.', 'Generate and edit images in Gemini. Check availability on the official site.'],
  ['mid', 'Midjourney', 'image', 'https://www.midjourney.com/', 'ابزار تصویرسازی هنری و طراحی مفهومی.', 'Artistic image generation and concept design.'],
  ['firefly', 'Adobe Firefly', 'image', 'https://firefly.adobe.com/', 'ابزارهای خلاقانه تصویر و ویرایش از Adobe.', 'Creative image generation and editing from Adobe.'],
  ['runway', 'Runway', 'video', 'https://runwayml.com/', 'ابزارهای تولید و ویرایش ویدئو.', 'Tools for generating and editing video.'],
  ['pika', 'Pika', 'video', 'https://pika.art/', 'تبدیل ایده و تصویر به ویدئو.', 'Turn ideas and images into video.'],
  ['copilot', 'GitHub Copilot', 'code', 'https://github.com/features/copilot', 'کمک به نوشتن و بررسی کد در محیط توسعه.', 'Help with writing and reviewing code in your editor.'],
  ['cursor', 'Cursor', 'code', 'https://cursor.com/', 'ویرایشگر کد با دستیار هوش مصنوعی.', 'A code editor with an AI assistant.'],
  ['claude', 'Claude', 'content', 'https://claude.ai/', 'نوشتن، تحلیل و خلاصه‌سازی متن.', 'Writing, analysis, and summarization.'],
  ['chatgpt', 'ChatGPT', 'content', 'https://chatgpt.com/', 'گفت‌وگو، ایده‌پردازی و کمک به کارهای روزمره.', 'Conversation, brainstorming, and everyday assistance.'],
  ['perplexity', 'Perplexity', 'research', 'https://www.perplexity.ai/', 'جستجو و تحقیق با پیوند به منابع.', 'Search and research with source links.'],
  ['notebook', 'NotebookLM', 'research', 'https://notebooklm.google.com/', 'مطالعه و بررسی منابعی که خودت وارد می‌کنی.', 'Explore and study the sources you provide.'],
  ['eleven', 'ElevenLabs', 'audio', 'https://elevenlabs.io/', 'ابزارهای تبدیل متن به صدا و تولید صوت.', 'Text-to-speech and audio creation tools.'],
  ['suno', 'Suno', 'audio', 'https://suno.com/', 'ایده‌پردازی و ساخت موسیقی از توضیح متنی.', 'Create music ideas from a text description.'],
].map(([id, name, category, website, fa, en]) => ({id, name, category, website, description: {fa,en}, source:'editorial'}));

// sampleKind: 'image' | 'video' | 'code' | 'text'
// sampleImage: 'persepolis-home' | 'persepolis-hero' | null (local assets, always visible without network)
// sample: concrete example output shown next to each template so employers see a real result.
export const templates = [
  {id:'product', fa:'عکاسی محصول', en:'Product photography', category:'image', prompt:'Commercial product photography of [PRODUCT] on a clean stone surface, soft studio lighting, realistic materials, subtle shadows, premium editorial composition. Preserve the product shape and branding. No added text.', theme:'تبلیغاتی / Commercial', sampleKind:'image', sampleImage:'persepolis-home', sampleFa:'نمونه: کفش چرم روی سنگ روشن، نور نرم استودیویی، سایه ملایم، کادر ۱:۱ برای اینستاگرام.', sampleEn:'Sample: leather shoe on light stone, soft studio light, gentle shadow, 1:1 frame for Instagram.'},
  {id:'portrait', fa:'پرتره طبیعی', en:'Natural portrait', category:'image', prompt:'An editorial portrait of [SUBJECT] near a window, soft natural light, authentic skin texture, warm neutral palette, shallow depth of field, quiet background, realistic proportions.', theme:'پرتره / Portrait', sampleKind:'image', sampleImage:'persepolis-hero', sampleFa:'نمونه: پرتره کنار پنجره، نور طبیعی، پس‌زمینه آرام، نسبت ۴:۳.', sampleEn:'Sample: window-side portrait, natural light, calm background, 4:3.'},
  {id:'persia', fa:'شکوه تخت‌جمشید', en:'Persepolis at sunset', category:'image', prompt:'A cinematic architectural view of Persepolis at sunset, warm golden light on ancient stone columns, detailed reliefs, atmospheric depth, realistic sandstone textures, wide composition. No text or modern buildings.', theme:'معماری / Architecture', sampleKind:'image', sampleImage:'persepolis-hero', sampleFa:'نمونه: ستون‌های تخت‌جمشید در غروب، نور طلایی، کادر سینمایی ۱۶:۹.', sampleEn:'Sample: Persepolis columns at sunset, golden light, cinematic 16:9.'},
  {id:'video', fa:'ویدئوی معرفی محصول', en:'Product reveal video', category:'video', prompt:'Create a 6-second product reveal of [PRODUCT]. Begin with a close-up, slowly dolly out to reveal the full product, consistent soft lighting, stable geometry, smooth motion, clean background, no captions.', theme:'ویدئو / Video', sampleKind:'video', sampleImage:null, sampleFa:'نمونه استوری‌برد ۶ ثانیه‌ای: ۱) کلوزآپ محصول ۲) چرخش آرام دوربین ۳) نمایش کامل روی پس‌زمینه تمیز.', sampleEn:'Sample 6s storyboard: 1) product close-up 2) slow dolly-out 3) full reveal on clean background.'},
  {id:'code', fa:'بررسی کد', en:'Code review', category:'code', prompt:'Review the following code for correctness, security and maintainability. Explain concrete issues with examples, prioritize by impact, and propose minimal fixes with tests. Do not invent missing context. Code: [CODE]', theme:'کدنویسی / Coding', sampleKind:'code', sampleImage:null, sampleFa:'نمونه خروجی: ۱) خطای null در سطر ۱۲ ۲) پیشنهاد try/catch + تست ۳) اولویت‌بندی بر اساس امنیت.', sampleEn:'Sample output: 1) null error at line 12 2) try/catch + test proposal 3) security-first priority.'},
  {id:'study', fa:'یادگیری قدم‌به‌قدم', en:'Step-by-step learning', category:'research', prompt:'Teach me [TOPIC] at [LEVEL]. Start with an intuitive explanation, give a worked example, then ask three practice questions. Distinguish established facts from uncertainty and cite sources where available.', theme:'یادگیری / Learning', sampleKind:'text', sampleImage:null, sampleFa:'نمونه: آموزش فتوسنتز در ۳ قدم + یک مثال + سه سؤال تمرینی.', sampleEn:'Sample: photosynthesis in 3 steps + one example + three practice questions.'},
  {id:'writing', fa:'محتوای شبکه اجتماعی', en:'Social post', category:'content', prompt:'Write three distinct social posts about [TOPIC] for [AUDIENCE]. Tone: [TONE]. Use a clear opening, one useful insight and a relevant call to action. Avoid invented statistics and exaggerated claims.', theme:'محتوا / Writing', sampleKind:'text', sampleImage:null, sampleFa:'نمونه: سه پست متفاوت با شروع قوی، یک نکته کاربردی و دعوت به اقدام.', sampleEn:'Sample: three posts with a strong hook, one insight and a call to action.'},
  {id:'audio', fa:'طراحی موسیقی', en:'Music brief', category:'audio', prompt:'Compose an instrumental track inspired by [MOOD], featuring [INSTRUMENTS], a gentle introduction, a memorable main motif and a resolved ending. Tempo: [BPM]. No vocals.', theme:'موسیقی / Music', sampleKind:'text', sampleImage:null, sampleFa:'نمونه: قطعه بی‌کلام ۶۰ ثانیه‌ای با سه‌تار، شروع آرام، موتیف اصلی و پایان مشخص. تمپو ۹۰.', sampleEn:'Sample: 60s instrumental with setar, gentle intro, main motif, resolved ending. 90 BPM.'},
];

export function normalizeDigits(value) { return value.replace(/[۰-۹٠-٩]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.includes(c) ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(c) : '٠١٢٣٤٥٦٧٨٩'.indexOf(c))); }
export function safeUrl(value) { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : null; } catch { return null; } }
export function logoUrl(tool) { const url = safeUrl(tool.website); return url ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(url).hostname)}&sz=128` : null; }
export function buildPrompt(idea, style, ratio, language) {
  return language === 'fa' ? `موضوع: ${idea.trim()}\nسبک: ${style}\nکادربندی: ${ratio}\nنورپردازی هماهنگ، جزئیات دقیق، ترکیب‌بندی واضح و بدون نوشته اضافی. عناصر اصلی موضوع را حفظ کن.` : `Subject: ${idea.trim()}\nStyle: ${style}\nAspect ratio: ${ratio}\nCoherent lighting, precise details, clear composition, and no additional text. Preserve the subject's defining features.`;
}
