import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Registra el service worker de pantalla offline (ver public/sw.js).
// Ese archivo solo cachea /offline.html y solo responde si la red falla, así que
// no puede volver a servir una versión vieja de la app como pasaba antes.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Si el registro falla la app funciona igual, solo se pierde la vista offline.
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
