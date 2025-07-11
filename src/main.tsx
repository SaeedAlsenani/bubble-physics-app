import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 1. التحقق من وجود عنصر root قبل التحميل
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// 2. إضافة شاشة تحميل احتياطية
const FallbackUI = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0f172a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '24px'
  }}>
    جاري تحميل التطبيق...
  </div>
);

// 3. تهيئة التطبيق مع معالجة الأخطاء
try {
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <FallbackUI />
      <App />
    </StrictMode>
  );
  
  // إخفاء شاشة التحميل بعد 3 ثواني (كحماية إضافية)
  setTimeout(() => {
    const loader = document.getElementById('fallback-loader');
    if (loader) loader.style.display = 'none';
  }, 3000);
  
} catch (error) {
  document.body.innerHTML = `
    <div style="
      color: red;
      padding: 20px;
      font-family: Arial;
    ">
      <h1>حدث خطأ في تحميل التطبيق</h1>
      <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `;
  console.error('Render error:', error);
}
