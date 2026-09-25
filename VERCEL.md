# لینک نمایشی Pars AI با Vercel

این انتشار نسخه وب برنامه است و برای بازبینی ظاهر و مسیرهای برنامه استفاده می‌شود. فایل APK نیست.

## انتشار از GitHub

1. تغییرات پوشه پروژه را به مخزن GitHub ارسال کنید.
2. وارد https://vercel.com/new شوید و با GitHub وارد شوید.
3. مخزن Pars AI را انتخاب و Import کنید.
4. Framework Preset را روی Other بگذارید.
5. Build Command باید `npm run build:web` و Output Directory باید `dist` باشد؛ فایل vercel.json این دو را از قبل تنظیم می‌کند.
6. در Environment Variables مقدار `EXPO_PUBLIC_DEMO_AUTH` را برابر `true` قرار دهید.
7. Deploy را بزنید. پس از پایان، لینکی شبیه `https://pars-ai.vercel.app` دریافت می‌کنید.

هر بار تغییرات جدید را به شاخه main بفرستید، Vercel نسخه جدید را خودکار منتشر می‌کند. برای هر Pull Request نیز یک Preview URL جدا می‌سازد.

## محدودیت نسخه نمایشی

ورود با کد 1234 و داده‌های داخل برنامه کار می‌کند. API محلی با آدرس localhost از اینترنت قابل دسترسی نیست. برای چت واقعی، پیامک واقعی و پیشنهادهای زنده باید سرور FastAPI روی یک سرویس عمومی دارای HTTPS منتشر شود و `EXPO_PUBLIC_API_URL` در Vercel روی آدرس آن سرور قرار گیرد.

کلیدهای Kavenegar و OpenAI را در Vercel frontend قرار ندهید؛ این کلیدها فقط متعلق به میزبان backend هستند.
