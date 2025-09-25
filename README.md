# 🎯 Bubble Physics App

نظام محاكاة فيزيائية متقدم للفقاعات باستخدام D3.js -.

## ✨ المميزات

- ✅ محاكاة فيزيائية واقعية (تصادم، جاذبية، حدود)
- ✅ واجهة مستخدم تفاعلية كاملة
- ✅ نظام فلاتر متقدم (زمنية، فئوية)
- ✅ قابلية السحب والإفلات
- ✅ تصميم متجاوب

## 🚀 البدء السريع

```bash
# نسخ المستودع
git clone https://github.com/username/bubble-physics-app.git

# الدخول للمجلد
cd bubble-physics-app

# تثبيت التبعيات (اختياري)
npm install

# تشغيل التطبيق
npm run dev
```

## 📁 هيكل المشروع

```
public/
├── index.html          # الصفحة الرئيسية
├── css/style.css       # التنسيقات
└── js/
    ├── physics-engine.js    # محرك الفيزياء
    ├── bubble-system.js     # نظام الفقاعات
    ├── ui-components.js     # مكونات الواجهة
    └── app.js               # التطبيق الرئيسي
```

## 🎮 الاستخدام

```javascript
// إنشاء تطبيق جديد
const app = new BubbleApp();

// إضافة فقاعة مخصصة
app.addbubble({
    title: "My Bubble",
    value: 100,
    category: "tech"
});
```

## 🌐 النشر على GitHub Pages

```bash
npm run deploy
```

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 الرخصة

هذا المشروع مرخص تحت رخصة MIT - انظر [LICENSE](LICENSE) للتفاصيل.
