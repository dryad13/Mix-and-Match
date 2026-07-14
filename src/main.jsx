import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SpotifyProvider } from './context/SpotifyContext'
import { DJProvider } from './context/DJContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SpotifyProvider>
      <DJProvider>
        <App />
      </DJProvider>
    </SpotifyProvider>
  </StrictMode>,
)
