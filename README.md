# 🍔 MobiGo - The Ultimate Food Delivery Platform 🚀

Welcome to **MobiGo**! Your one-stop destination for ordering delicious food from your favorite restaurants. Built with a modern microservices architecture, MobiGo ensures a blazing fast, secure, and delightful experience. 🤤✨

---

## 🏗️ The Microservice Architecture (A Simple Restaurant Analogy 🍔)

Instead of having a single massive system, MobiGo splits its operations among independent services. Think of MobiGo as a busy physical restaurant:

### 1. 🕵️‍♂️ Auth Service: The Entry Gate Security Guard
- **Role:** Verifies who you are. Whether you are a Customer, Restaurant Owner, or Rider, the Guard checks your credentials, registers you, and issues a secure badge (**JWT Token**).
- **Tech Stack:** Node.js, Express, MongoDB (Mongoose), TypeScript.
- **Port:** `5000`

### 🍳 2. Restaurant Service: The Main Kitchen & Head Chef
- **Role:** Manages the menu items, calculates cart totals (including platform fees and delivery fees), registers restaurant configurations, and tracks the lifecycle of orders in the database.
- **Tech Stack:** Node.js, Express, MongoDB, TypeScript.
- **Port:** `5001`

### 💳 3. Utils Service: The Cashier & Media Center
- **Role:** Handles payments securely (via **Stripe** or **Razorpay** checkout links) and uploads pictures (e.g., rider profile photos) using **Cloudinary**.
- **Tech Stack:** Node.js, Express, Stripe SDK, Razorpay SDK, Cloudinary, TypeScript.
- **Port:** `5002`

### 📢 4. Realtime Service: The Speaker Announcer
- **Role:** Keeps everyone updated in real-time. Using WebSockets (**Socket.io**), it broadcasts live updates (e.g., "Order is ready", "Rider assigned") to specific rooms matching `user:<userId>` or `restaurant:<restaurantId>`.
- **Tech Stack:** Node.js, Express, HTTP Server, Socket.io, TypeScript.
- **Port:** `5004`

### 🛵 5. Rider Service: The Delivery Partner Network
- **Role:** Tracks rider profiles, checks their verifications, updates their online availability, and runs geospatial queries (**MongoDB `$near`**) to match ready orders to the closest active rider.
- **Tech Stack:** Node.js, Express, MongoDB, TypeScript.
- **Port:** `5005`

### 📋 6. RabbitMQ: The Order Slip Board
- **Role:** The asynchronous communication channel. When the cashier (Utils Service) verifies a payment, they pin a slip to the board (`payment_queue`). The Chef (Restaurant Service) pulls the slip when they are free. Similarly, when the kitchen finishes cooking, it pins a slip (`order_ready_queue`) for the Rider Service to read.
- **Tech Stack:** RabbitMQ Message Broker.

### 👑 7. Admin Service: The Restaurant Manager
- **Role:** Monitors pending verifications for newly registered restaurants and riders, ensuring no fake restaurants or unverified riders enter the system.
- **Tech Stack:** Node.js, Express, MongoDB, TypeScript.
- **Port:** `5006`

---

## 🔄 Dynamic Flows & Function Calling Chains

Here is how variables flow and services interact through function calls during key business flows:

### 💳 Flow 1: Order Placement & Payment Flow
When a user decides to checkout:
1. **Frontend Call:** Client posts cart details to `/api/order` in the **Restaurant Service**.
2. **Order Creation:** `createOrder` calculates distance, subtotal, platform fees, and sets status to `placed` with paymentStatus as `pending`.
3. **Payment Initialization:** Client initiates payment via **Utils Service** by calling `payWithStripe` or `createRazorpayOrder`.
4. **Payment Success:** On payment completion, the callback hits `verifyStripe` / `verifyRazorpayPayment` in the **Utils Service**.
5. **RabbitMQ Event Published:** Utils Service calls `publishPaymentSuccess` which publishes a message containing `{ orderId }` into RabbitMQ's `PAYMENT_QUEUE`.
6. **RabbitMQ Event Consumed:** `startPaymentConsumer` in **Restaurant Service** picks up the message:
   - Updates `Order` status to `placed` and `paymentStatus` to `paid`.
   - Sends an HTTP POST `/api/v1/internal/emit` to the **Realtime Service**.
7. **Real-time Announcement:** The Realtime Service emits `order:new` to the `restaurant:${restaurantId}` socket room.

---

### 🛵 Flow 2: Food Ready & Rider Matchmaking Flow
When the chef finishes cooking the food:
1. **Status Update:** Restaurant owner marks order status as `ready_for_rider` in the frontend, calling `updateOrderStatus` in the **Restaurant Service**.
2. **RabbitMQ Event Published:** The Restaurant Service calls `publishEvent` which pushes `{ orderId, restaurantId, location }` into the `ORDER_READY_QUEUE` on RabbitMQ.
3. **RabbitMQ Event Consumed:** `startOrderReadyConsumer` in the **Rider Service** processes the event:
   - Queries MongoDB using Geospatial index: `Rider.find({ isAvailable: true, isVerified: true, location: { $near: ... } })`.
   - Loops through the found nearby riders.
   - For each rider, sends an HTTP POST `/api/v1/internal/emit` to **Realtime Service**.
4. **Rider Notification:** Realtime Service emits `order:available` to `user:${rider.userId}` socket room.
5. **Rider Acceptance:** The first rider clicks "Accept", calling `acceptOrder` in **Rider Service**:
   - Sends HTTP PUT `/api/order/assign/rider` to the **Restaurant Service** to bind the rider details (`riderId`, `riderName`, `riderPhone`) to the order.
   - Updates rider's state in Rider DB: `isAvailable = false` (busy).
   - Restaurant Service calls HTTP POST `/api/v1/internal/emit` to trigger `order:rider_assigned` event for both the customer room (`user:${userId}`) and the restaurant room (`restaurant:${restaurantId}`).

---

## 🛠️ Tech Stack Overview

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React (Vite), TypeScript, Tailwind CSS | High performance, lightweight single-page UI |
| **Databases** | MongoDB Atlas, Mongoose | NoSQL database for flexible menus and order states |
| **Realtime** | Socket.io | Full-duplex WebSocket channels for live tracking |
| **Message Broker** | RabbitMQ | Asynchronous and decoupled inter-service processing |
| **Payments** | Stripe & Razorpay APIs | Diverse and robust checkout options |
| **Media** | Cloudinary | Cloud storage for images |

---

## 🚀 Getting Started (How to Build and Run)

To run the entire MobiGo platform on your local machine, follow these steps:

### Prerequisites
- Node.js installed (v18+)
- MongoDB running locally or a MongoDB Atlas URI
- RabbitMQ server running (or an AMQP Cloud instance)
- A Cloudinary account, Stripe API keys, and Razorpay API keys

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd mobigo
```

### 2. Configure Environment Variables
Create a `.env` file in each backend service directory and the frontend folder using the examples below:

#### Frontend (`frontend/.env`)
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
JWT_SECRET=your_jwt_secret
VITE_INTERNAL_SERVICE_KEY=your_internal_service_key
```

#### Auth Service (`services/auth/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

#### Restaurant Service (`services/restaurant/.env`)
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REALTIME_SERVICE=http://localhost:5004
INTERNAL_SERVICE_KEY=your_internal_service_key
RABBITMQ_URL=amqp://localhost
PAYMENT_QUEUE=payment_queue
RIDER_QUEUE=rider_queue
ORDER_READY_QUEUE=order_ready_queue
```

#### Utils Service (`services/utils/.env`)
```env
PORT=5002
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=your_internal_service_key
RABBITMQ_URL=amqp://localhost
PAYMENT_QUEUE=payment_queue
```

#### Realtime Service (`services/realtime/.env`)
```env
PORT=5004
INTERNAL_SERVICE_KEY=your_internal_service_key
JWT_SECRET=your_jwt_secret
```

#### Rider Service (`services/rider/.env`)
```env
PORT=5005
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
UTILS_SERVICE=http://localhost:5002
REALTIME_SERVICE=http://localhost:5004
RESTAURANT_SERVICE=http://localhost:5001
INTERNAL_SERVICE_KEY=your_internal_service_key
RABBITMQ_URL=amqp://localhost
RIDER_QUEUE=rider_queue
ORDER_READY_QUEUE=order_ready_queue
```

#### Admin Service (`services/admin/.env`)
```env
PORT=5006
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
DB_NAME=MobiGO
```

### 3. Start the Engines 🏎️💨
Open separate terminals for the frontend and each service, then run:

```bash
# In each folder: frontend, services/auth, services/restaurant, services/utils, services/realtime, services/rider, services/admin
npm install
npm run dev
```

---

## 👨‍💻 Developer Notes
Developed with ❤️ by the MobiGo team. Keep coding, keep building! 🚀✨
