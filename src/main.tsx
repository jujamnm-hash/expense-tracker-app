import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('تازەکردنەوەیەکی نوێ هەیە. دەتەوێ ئێستا تازەی بکەیتەوە؟')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('ئەپەکە ئامادەیە بۆ کارکردنی ئۆفلاین');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
