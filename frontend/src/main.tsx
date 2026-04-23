import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import "leaflet/dist/leaflet.css"; //leaflet.css for styling leaflet map
import { SocketProvider } from './context/SocketContext.tsx';

export const authService = 'http://localhost:5000';
export const restaurantService = 'http://localhost:5001';
export const utilsService = 'http://localhost:5002';
export const realtimeService = 'http://localhost:5004';
export const riderService = 'http://localhost:5005';

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="331858214070-b0pekgtpebujsepsea2q9jn6nqfpouvv.apps.googleusercontent.com">
    <AppProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AppProvider>
  </GoogleOAuthProvider>,
)
