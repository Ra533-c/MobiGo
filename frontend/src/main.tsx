import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext.tsx';
import "leaflet/dist/leaflet.css"; //leaflet.css for styling leaflet map
import { SocketProvider } from './context/SocketContext.tsx';

export const authService = 'https://mobigo-auth.onrender.com';
export const restaurantService = 'https://restaurant-service-zci6.onrender.com';
export const utilsService = 'https://utils-service-eb6b.onrender.com';
export const realtimeService = 'https://realtime-service-uvpk.onrender.com';
export const riderService = 'https://rider-service-lg4s.onrender.com';
export const adminService = 'https://admin-service-tq1y.onrender.com';

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="331858214070-b0pekgtpebujsepsea2q9jn6nqfpouvv.apps.googleusercontent.com">
    <AppProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AppProvider>
  </GoogleOAuthProvider>,
)
