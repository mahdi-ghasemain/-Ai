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

export const templates = [
  {id:'product', fa:'عکاسی محصول', en:'Product photography', category:'image', prompt:'Commercial product photography of [PRODUCT] on a clean stone surface, soft studio lighting, realistic materials, subtle shadows, premium editorial composition. Preserve the product shape and branding. No added text.', theme:'تبلیغاتی / Commercial'},
  {id:'portrait', fa:'پرتره طبیعی', en:'Natural portrait', category:'image', prompt:'An editorial portrait of [SUBJECT] near a window, soft natural light, authentic skin texture, warm neutral palette, shallow depth of field, quiet background, realistic proportions.', theme:'پرتره / Portrait'},
  {id:'persia', fa:'شکوه تخت‌جمشید', en:'Persepolis at sunset', category:'image', prompt:'A cinematic architectural view of Persepolis at sunset, warm golden light on ancient stone columns, detailed reliefs, atmospheric depth, realistic sandstone textures, wide composition. No text or modern buildings.', theme:'معماری / Architecture'},
  {id:'video', fa:'ویدئوی معرفی محصول', en:'Product reveal video', category:'video', prompt:'Create a 6-second product reveal of [PRODUCT]. Begin with a close-up, slowly dolly out to reveal the full product, consistent soft lighting, stable geometry, smooth motion, clean background, no captions.', theme:'ویدئو / Video'},
  {id:'code', fa:'بررسی کد', en:'Code review', category:'code', prompt:'Review the following code for correctness, security and maintainability. Explain concrete issues with examples, prioritize by impact, and propose minimal fixes with tests. Do not invent missing context. Code: [CODE]', theme:'کدنویسی / Coding'},
  {id:'study', fa:'یادگیری قدم‌به‌قدم', en:'Step-by-step learning', category:'research', prompt:'Teach me [TOPIC] at [LEVEL]. Start with an intuitive explanation, give a worked example, then ask three practice questions. Distinguish established facts from uncertainty and cite sources where available.', theme:'یادگیری / Learning'},
  {id:'writing', fa:'محتوای شبکه اجتماعی', en:'Social post', category:'content', prompt:'Write three distinct social posts about [TOPIC] for [AUDIENCE]. Tone: [TONE]. Use a clear opening, one useful insight and a relevant call to action. Avoid invented statistics and exaggerated claims.', theme:'محتوا / Writing'},
  {id:'audio', fa:'طراحی موسیقی', en:'Music brief', category:'audio', prompt:'Compose an instrumental track inspired by [MOOD], featuring [INSTRUMENTS], a gentle introduction, a memorable main motif and a resolved ending. Tempo: [BPM]. No vocals.', theme:'موسیقی / Music'},
];

export function normalizeDigits(value) { return value.replace(/[۰-۹٠-٩]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.includes(c) ? '۰۱۲۳۴۵۶۷۸۹'.indexOf(c) : '٠١٢٣٤٥٦٧٨٩'.indexOf(c))); }
export function safeUrl(value) { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : null; } catch { return null; } }
export function logoUrl(tool) { const url = safeUrl(tool.website); return url ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(url).hostname)}&sz=128` : null; }
export function buildPrompt(idea, style, ratio, language) {
  return language === 'fa' ? `موضوع: ${idea.trim()}\nسبک: ${style}\nکادربندی: ${ratio}\nنورپردازی هماهنگ، جزئیات دقیق، ترکیب‌بندی واضح و بدون نوشته اضافی. عناصر اصلی موضوع را حفظ کن.` : `Subject: ${idea.trim()}\nStyle: ${style}\nAspect ratio: ${ratio}\nCoherent lighting, precise details, clear composition, and no additional text. Preserve the subject's defining features.`;
}
