# پارس‌آی — AI Matchmaker

اپلیکیشن اندروید فارسی برای کشف ابزارهای هوش مصنوعی و ساخت پرامپت‌های حرفه‌ای.

## ✨ ویژگی‌ها

- 🔍 **کشف ابزارهای AI** — جستجو و فیلترکردن ابزارهای هوش مصنوعی بر اساس دسته‌بندی
- 📝 **سازماندهی پرامپت** — ساخت، ویرایش و مدیریت پرامپت‌های حرفه‌ای
- ⭐ **مورد علاقه** — ذخیره ابزارها و پرامپت‌های مورد نظر
- 🌙 **حالت تاریک/روشن** — پشتیبانی از تم‌های مختلف
- 🌐 **پشتیبانی از زبان فارسی** — رابط کاربری کاملاً فارسی

## 📱 پیش‌نمایش

| خانه | کاولوژی | پرامپت‌ها |
|-------|---------|-----------|
| ![Home](assets/persepolis-home.png) | ![Catalog](assets/persepolis-hero.png) | ![Prompts](assets/icon.png) |

## 🚀 اجرا و نصب

### پیش‌نیازها
- Node.js 18+
- Python 3.10+ (برای API)
- Expo Go روی گوشی Android

### اجرای اپلیکیشن (React Native / Expo)

```bash
# نصب وابستگی‌ها
npm install

# اجرای سرور توسعه
npm run start
```

سپس Expo Go را روی گوشی نصب کنید و QR کد نمایش‌داده‌شده را اسکن کنید.

### اجرای API (FastAPI)

```bash
cd api
python -m pip install -r requirements.txt
uvicorn main:app --reload
```

API در پورت `8000` روی `http://localhost:8000` اجرا می‌شود.

## 📦 ساخت بیلد Android

```bash
# ساخت APK
npm run build:android

# یا با EAS Build
eas build --platform android
```

## 🗂 ساختار پروژه

```
پارسیAi/
├── src/              # کدهای اصلی اپلیکیشن (React Native)
│   ├── ParsApp.js    # کامپوننت اصلی
│   ├── discovery.js  # صفحه کشف ابزارها
│   ├── catalog.js    # کتالوگ ابزارها
│   └── api.js        # ارتباط با بک‌اند
├── api/              # بک‌اند FastAPI
│   ├── main.py       # نقطه ورود API
│   └── requirements.txt
├── assets/           # تصاویر و آیکون‌ها
├── App.js            # ورودی اپلیکیشن
├── package.json      # وابستگی‌های Node.js
└── README.md
```

## 🔧 تکنولوژی‌ها

- **Frontend**: React Native + Expo
- **Backend**: FastAPI (Python)
- **Database**: SQLite (توسعه) → PostgreSQL (تولید)
- **State Management**: React Context
- **Navigation**: Expo Router / React Navigation
- **UI**: کامپوننت‌های سفارشی + React Native Paper

## 🤝 مشارکت

1. Fork کنید
2. Branch بسازید (`git checkout -b feature/amazing-feature`)
3. Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request باز کنید

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. فایل [LICENSE](LICENSE) را ببینید.

## 📞 ارتباط

- GitHub: [@mahdi-ghasemain](https://github.com/mahdi-ghasemain)
- Repository: [https://github.com/mahdi-ghasemain/-Ai](https://github.com/mahdi-ghasemain/-Ai)
