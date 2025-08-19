import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './mobile-optimization.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);

// Disable service worker for now to avoid caching issues
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister all service workers
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Service worker unregistered');
      }
    }).catch((error) => {
      console.log('Error unregistering service workers:', error);
    });
  });
}
