# 🍔 MobiGo - The Ultimate Food Delivery Platform 🚀

Welcome to **MobiGo**! Your one-stop destination for ordering delicious food from your favorite restaurants. Built with a modern microservices architecture, MobiGo ensures a blazing fast, secure, and delightful experience. 🤤✨

---

## 🏗️ Architecture Showcase

We love keeping things scalable! MobiGo is powered by independent microservices:

- 🛡️ **Auth Service:** Secure JWT-based authentication to keep your accounts safe.
- 🏪 **Restaurant Service:** Manage restaurant details, menus, and incoming orders.
- 💳 **Utils (Payment) Service:** Handles the moolah! Integrated with **Stripe** & **Razorpay** for seamless checkouts. 💸
- ⚡ **Realtime Service:** Powered by WebSockets (`Socket.io`) so you can track your hot food live! 🛵💨
- 💻 **Frontend:** A beautiful, responsive user interface.

---

## 🔥 Features that Wow!

- 🔐 **Secure Login:** Google OAuth and traditional login support.
- 🛒 **Smart Cart:** Easy cart management with real-time total calculations.
- 🌍 **Multiple Addresses:** Save and choose your delivery address on the fly.
- 💳 **Dual Payment Gateways:** Pay securely via Stripe or Razorpay!
- 📍 **Real-time Tracking:** Watch your order status change in real-time without refreshing the page!

---

## 🛠️ Tech Stack

### Frontend 🎨
- React (Vite) ⚡
- Tailwind CSS 💅
- JavaScript/TypeScript
- Stripe Elements & Razorpay 💳

### Backend Services ⚙️
- Node.js & Express 🚀
- MongoDB & Mongoose 🍃
- Socket.io 📡
- RabbitMQ 🐇 (Inter-service communication)

---

## 🚀 Getting Started

If you want to run this beast locally, here is what you need to do:

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd mobigo
   ```

2. **Start the Engines 🏎️💨:**
   You will need to run the development server for each microservice and the frontend. 
   Navigate into each folder (`frontend`, `services/auth`, `services/restaurant`, `services/utils`, `services/realtime`) and run:
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Developer Notes
Developed with ❤️. 

*Keep coding, keep building!* 🚀✨
