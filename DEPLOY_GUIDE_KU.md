# 🚀 ڕێنمایی تەواو بۆ دیپلۆی کردن لە GitHub Pages

## پێش دەست پێکردن

پێویستیەکان:
- ئەکاونتێکی GitHub
- Git لەسەر کۆمپیوتەرەکەت دامەزرێنراوە

---

## 🔰 هەنگاو بە هەنگاو

### هەنگاوی ١: دروستکردنی ریپۆزیتۆریی نوێ لە GitHub

1. بڕۆ بۆ [github.com](https://github.com)
2. کلیک لە دوگمەی سەوز **New** بکە (یان + لە سەرەوە)
3. ناوی ریپۆزیتۆری: `expense-tracker-app`
4. Description: `Kurdish Expense Tracker - Professional expense management system`
5. **Public** هەڵبژێرە
6. **پەڕگەیەک زیاد مەکە** (README, .gitignore, license)
7. کلیک لە **Create repository** بکە

### هەنگاوی ٢: پەیوەستکردنی پڕۆژەکە بە GitHub

لە تێرمیناڵ ئەم فەرمانانە بنووسە:

```bash
# بڕۆ بۆ فۆڵدەری پڕۆژەکە
cd "c:\Users\lenovo\Desktop\New folder"

# Initialize git (ئەگەر پێشتر نەکراوە)
git init

# زیادکردنی هەموو فایلەکان
git add .

# یەکەم commit
git commit -m "Initial commit - Kurdish Expense Tracker"

# پەیوەستکردن بە GitHub (ناوی کەسەکەت دابنێ بە جێی YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker-app.git

# Push کردن بۆ GitHub
git branch -M main
git push -u origin main
```

⚠️ **گرنگ**: `YOUR_USERNAME` بگۆڕە بە یوزەرنەیمەکەی خۆت لە GitHub!

### هەنگاوی ٣: چالاککردنی GitHub Pages

1. بڕۆ بۆ ریپۆزیتۆریەکەت لە GitHub:
   ```
   https://github.com/YOUR_USERNAME/expense-tracker-app
   ```

2. کلیک لە **Settings** بکە (تابی کۆتایی)

3. لە لای چەپەوە **Pages** هەڵبژێرە

4. لە بەشی **Build and deployment**:
   - **Source**: لە لیستەکە **GitHub Actions** هەڵبژێرە
   - (نەک Deply from a branch)

5. **Save** بکە (ئەگەر دوگمەیەک هەیە)

### هەنگاوی ٤: چاوەڕوانی بوون

1. بڕۆ بۆ تابی **Actions** لە سەرەوە
2. دەبینیت workflow ێک دەکات run (دوگمەی سەوز یان زەرد)
3. چاوەڕێی ٢-٥ خولەک بە
4. کاتێک دوگمە سەوز بوو ✅، ئامادەیە!

### هەنگاوی ٥: بینینی ئەپەکە

ئەپەکەت ئێستا لێرە کاردەکات:
```
https://YOUR_USERNAME.github.io/expense-tracker-app/
```

🎉 **بەرێکەوت!** ئێستا ئەپەکەت لە ئینتەرنێتە!

---

## 🔄 تازەکردنەوە

هەر جارێک دەتەوێت گۆڕانکاری بکەیت:

```bash
# گۆڕانکاری بکە لە فایلەکان

# زیادکردنی گۆڕانکارییەکان
git add .

# Commit
git commit -m "وەسفی گۆڕانکارییەکە"

# Push
git push
```

دوای ٢-٣ خولەک، وێبسایتەکە تازە دەبێتەوە ئۆتۆماتیک! 🚀

---

## 🎨 گۆڕینی ناوی پڕۆژەکە

ئەگەر ناوی جیاواز دەتەوێت بە جێی `expense-tracker-app`:

1. لە vite.config.ts ئەم هێڵە بگۆڕە:
```typescript
base: process.env.NODE_ENV === 'production' ? '/NAW-Y-NWET/' : '/',
```

2. لینکەکە دەبێتە:
```
https://YOUR_USERNAME.github.io/NAW-Y-NWET/
```

---

## 📱 دابەزاندن وەک ئەپ

دوای دیپلۆی کردن، دەتوانی ئەپەکە وەک ئەپێکی ڕاستەقینە دابەزێنیت:

### لەسەر مۆبایل:
- **Android (Chrome)**: Menu (⋮) → "Add to Home screen"
- **iPhone (Safari)**: Share button → "Add to Home Screen"

### لەسەر کۆمپیوتەر:
- **Chrome/Edge**: لە URL bar دوگمەی Install (+) بکە
- **Firefox**: لە address bar ئایکۆنی Install ببینە

---

## ❓ کێشە و چارەسەر

### ئەگەر پەیجەکە کار نەکرد:

1. **چێک کردنی Workflow**:
   - بڕۆ بۆ تابی **Actions**
   - کلیک لە workflow ی کۆتایی بکە
   - سەیری لۆگەکان بکە بۆ هەڵە

2. **چێک کردنی Settings**:
   - Settings → Pages
   - دڵنیابەرەوە Source لەسەر "GitHub Actions" دانراوە

3. **چێک کردنی URL**:
   - دڵنیابە یوزەرنەیم و ناوی ریپۆزیتۆری ڕاستە
   - ئاگادار بە لە / لە کۆتایی URL

### ئەگەر ئایکۆنەکان نییە:

لە فۆڵدەری `public/` ئەم فایلانە زیاد بکە:
- pwa-192x192.png (وێنەیەکی ١٩٢×١٩٢)
- pwa-512x512.png (وێنەیەکی ٥١٢×٥١٢)
- favicon.ico

### ئەگەر بیلدەکە شکستی هێنا:

```bash
# لۆکاڵ تاقی بکەرەوە
npm run build

# ئەگەر کار کرد، push بکەرەوە
git add .
git commit -m "Fix build issues"
git push
```

---

## 🌟 تیپەکان

1. **دۆمەینی تایبەت**: دەتوانی دۆمەینی تایبەتی خۆت بەستریتەوە (settings.md.com، .iq)
2. **HTTPS**: ئۆتۆماتیک SSL دابین دەکرێت (secure connection)
3. **تێچوو**: GitHub Pages **بەخۆڕایی**یە! 💰
4. **سپیس**: تا ١GB بۆ هەر ریپۆزیتۆری

---

## 📞 پشتیوانی

ئەگەر کێشەت هەیە:
1. سەیری تابی [Actions](https://github.com/YOUR_USERNAME/expense-tracker-app/actions) بکە
2. سەیری [GitHub Pages Documentation](https://docs.github.com/en/pages) بکە
3. یان Issue بکەرەوە لە ریپۆزیتۆریەکە

---

🎉 **بەرێکەوت لە دیپلۆی کردنی یەکەم ئەپەکەت!** 🎉

بەخێرهاتی بۆ جیهانی وێب دیڤێڵۆپمێنت! 🚀
