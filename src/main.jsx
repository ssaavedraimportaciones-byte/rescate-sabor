import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Desregistrar cualquier service worker existente y limpiar todas las cachés
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister())
  })
}
if ('caches' in window) {
  caches.keys().then(keys => keys.forEach(k => caches.delete(k)))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
