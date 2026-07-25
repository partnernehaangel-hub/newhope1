import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill process for browser environments (Vite/Vercel)
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: {} };
}

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

// Initialize Capacitor features
const initCapacitor = async () => {
  try {
    // Hide splash screen after app loads
    await SplashScreen.hide();
    
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#4f46e5' });
  } catch (e) {
    // Fail gracefully if not on mobile
    console.debug('Capacitor not detected or failed to init');
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Call init after render
initCapacitor();
