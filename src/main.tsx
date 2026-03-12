import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { AuthProvider } from './components/providers/AuthProvider'

console.log("Starting to render React app...");
try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  )
  console.log("React app mounted.");
} catch (e) {
  console.error("Failed to mount app", e);
}
