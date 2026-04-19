# 🔥 MobiGo Realtime Flow — PART 2: Practical Mini Project

> Ye Part 2 hai jisme hum **working mini project** banayenge jo **SAME logic** pe kaam karega
> jaise tumhara MobiGo project kaam karta hai!

---

## 📖 CHAPTER 9: Mini Project — BINA Realtime Ke (Polling Approach)

### 🤔 Pehle Dekhte Hain — BINA Socket.IO ke Kaise Kaam Hota?

Agar tumhe realtime updates dekhne hain BINA WebSocket ke, toh ek hi raasta hai:
**CLIENT ko har 2-3 second mein SERVER se poochhna padta** — "Kuch naya hai kya?"

Isko kehte hain **POLLING** 🔄

```
╔══════════════════════════════════════════════════════════════╗
║               POLLING (BINA Socket.IO)                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   Browser                              Server                ║
║                                                              ║
║   "Kuch naya?" ─────────────────────►  "Nahi" ◄────┐       ║
║   (2 sec baad)                                      │       ║
║   "Kuch naya?" ─────────────────────►  "Nahi"       │       ║
║   (2 sec baad)                                      │       ║
║   "Kuch naya?" ─────────────────────►  "Nahi"       │ WASTE!║
║   (2 sec baad)                                      │       ║
║   "Kuch naya?" ─────────────────────►  "Nahi"       │       ║
║   (2 sec baad)                                      │       ║
║   "Kuch naya?" ─────────────────────►  "HAAN!"  ◄──┘       ║
║                                                              ║
║   ❌ Problems:                                               ║
║   1. Server pe BAHUT load (har 2 sec mein request)          ║
║   2. Delay hota hai (2 sec tak puraana data dikhe)          ║
║   3. Battery / bandwidth waste (mobile pe)                   ║
║   4. 100 users = har 2 sec × 100 = 50 requests/sec! 😱     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 📁 POLLING version ke 2 files:

**File 1: `polling-server.js`** — Backend (Express)

```javascript
// ============================================
// polling-server.js — BINA Socket.IO ke server
// ============================================

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// -------- "Database" (fake - just a variable) --------
let orders = [
  { id: "order1", item: "Butter Chicken", status: "placed" }
];
// ☝️ Ye tumhare MongoDB ki jagah hai
//    Bilkul waise hi jaise Order model mein status: "placed" hota hai

// -------- GET /orders — Client poochhe "kuch naya?" --------
app.get("/orders", (req, res) => {
  console.log("📋 Client ne poochha: orders kya hain?");
  res.json({ orders });
  // ☝️ COMPARE: Ye tumhare fetchRestaurantOrders jaisa hai
  //    (order.ts Line 193)
  //    Client request kare → server response de → connection band
});

// -------- PUT /orders/:id — Status update --------
app.put("/orders/:id", (req, res) => {
  const { id } = req.params;       // URL se order ID
  const { status } = req.body;     // Body se naya status

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  console.log(`✅ Order ${id} status → ${status}`);
  // ☝️ Database mein update hua
  //    Bilkul waise hi jaise: order.status = status; await order.save();
  //    (order.ts Line 277-279)

  res.json({ message: "Updated!", order });

  // ❌ PROBLEM: Customer ke browser ko PATA HI NAHI ki status badla!
  //    Customer ko KHUD se refresh/poll karna padega!
});

app.listen(3001, () => {
  console.log("🚀 Polling server chal raha hai: http://localhost:3001");
});
```

**File 2: `polling-client.html`** — Frontend (Browser)

```html
<!-- ============================================ -->
<!-- polling-client.html — POLLING wala approach   -->
<!-- ============================================ -->
<!DOCTYPE html>
<html>
<head>
  <title>Order Tracker (POLLING - SLOW)</title>
  <style>
    body { font-family: Arial; padding: 20px; background: #1a1a2e; color: #eee; }
    .order { background: #16213e; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .status { font-weight: bold; color: #e94560; }
    .poll-count { color: #888; font-size: 12px; }
    button { background: #e94560; color: white; border: none; padding: 8px 16px;
             border-radius: 5px; cursor: pointer; margin: 5px; }
  </style>
</head>
<body>
  <h1>🍕 Order Tracker (POLLING Version)</h1>
  <p class="poll-count">Poll count: <span id="pollCount">0</span></p>
  <p class="poll-count">⚠️ Har 2 second mein server se poochh raha hai!</p>

  <div id="orders"></div>

  <h3>Restaurant Panel (Status Change Karo):</h3>
  <button onclick="changeStatus('order1', 'preparing')">→ Preparing</button>
  <button onclick="changeStatus('order1', 'ready')">→ Ready</button>
  <button onclick="changeStatus('order1', 'delivered')">→ Delivered</button>

  <script>
    let pollCount = 0;

    // -------- POLLING: Har 2 second mein request bhej raha hai --------
    async function fetchOrders() {
      pollCount++;
      document.getElementById("pollCount").textContent = pollCount;
      // ☝️ Dekho kitni baar request gai — ye number badhta jaayega!

      try {
        const res = await fetch("http://localhost:3001/orders");
        const data = await res.json();
        // ☝️ Har 2 sec mein SAME request ja rahi hai
        //    CHAHE kuch change hua ho ya NAHI!
        //
        //    COMPARE: Tumhare RestaurantOrders.tsx mein:
        //    fetchOrders() SIRF tab call hota hai jab "order:new" event aaye (Line 84)
        //    But yahan BLINDLY har 2 sec mein poochh raha hai!

        const ordersDiv = document.getElementById("orders");
        ordersDiv.innerHTML = data.orders.map(order => `
          <div class="order">
            <p>🆔 ${order.id}</p>
            <p>🍽️ ${order.item}</p>
            <p>Status: <span class="status">${order.status}</span></p>
          </div>
        `).join("");
      } catch (err) {
        console.error("Error:", err);
      }
    }

    // -------- Status change karo (restaurant side) --------
    async function changeStatus(orderId, status) {
      await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
        // ☝️ COMPARE: Tumhare OrderCard.tsx mein:
        //    axios.put(`${restaurantService}/api/order/${order._id}`, { status })
        //    (OrderCard.tsx Line 43-44)
      });
    }

    // -------- Start polling — har 2 second --------
    fetchOrders();                      // Pehli baar turant
    setInterval(fetchOrders, 2000);     // Fir har 2 second mein
    // ☝️ setInterval = har 2000ms (2 sec) mein fetchOrders() call karo
    //    Ye KABHI BAND NAHI HOTA — tab tak chalta rahega jab tak page open hai
    //    100 users × har 2 sec = 50 requests/sec to server! 😱
  </script>
</body>
</html>
```

```
╔══════════════════════════════════════════════════════════════╗
║             POLLING KE PROBLEMS (DEKH LO)                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. Poll count badh raha hai → Server pe load               ║
║  2. Status change ke baad 2 sec tak purana dikhe             ║
║  3. Bandwidth waste — 90% responses SAME data dete hain     ║
║  4. Mobile pe battery drain hoti hai                        ║
║                                                              ║
║  Ab dekhte hain SAME cheez Socket.IO se kaise hoti hai! 🚀  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 📖 CHAPTER 10: Mini Project — WITH Socket.IO (Instant Updates! ⚡)

Ab **SAME mini project** banate hain lekin **tumhare MobiGo wale EXACT SAME pattern** se!

### 📁 Project Structure (6 files):

```
mini-realtime-project/
│
├── package.json              ← Dependencies
│
├── realtime-service/         ← Tumhare services/realtime jaisa
│   ├── index.js              ← Entry point (Express + Socket.IO)
│   ├── socket.js             ← Socket.IO setup (rooms, auth)
│   └── routes/
│       └── internal.js       ← /emit route (THE BRIDGE 🌉)
│
├── restaurant-service/       ← Tumhare services/restaurant jaisa
│   └── index.js              ← Order update + /emit call
│
└── frontend/
    └── index.html            ← Browser (Socket.IO client)
```

**COMPARE KARO** tumhare project se:
```
╔═══════════════════════════════════════════════════════════════════╗
║  MINI PROJECT FILE          ←→    TUMHARA MOBIGO FILE              ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  realtime-service/index.js   ←→   services/realtime/src/index.ts  ║
║  realtime-service/socket.js  ←→   services/realtime/src/socket.ts ║
║  routes/internal.js          ←→   routes/internal.ts               ║
║  restaurant-service/index.js ←→   controllers/order.ts             ║
║  frontend/index.html         ←→   SocketContext.tsx +              ║
║                                    RestaurantOrders.tsx             ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

### 📄 FILE 1: `package.json`

```json
{
  "name": "mini-realtime-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "socket.io": "^4.7.2",
    "axios": "^1.6.0"
  }
}
```

---

### 📄 FILE 2: `realtime-service/socket.js` 

**(Compare: `services/realtime/src/socket.ts`)**

```javascript
// ============================================
// socket.js — Socket.IO ka dimag 🧠
// COMPARE: services/realtime/src/socket.ts
// ============================================

const { Server } = require("socket.io");

let io;
// ☝️ SAME pattern! 
//    tumhara socket.ts Line 5: let io: Server;

function initSocket(server) {
  // ☝️ COMPARE: tumhara socket.ts Line 7: export const initSocket = (server: http.Server) => {

  io = new Server(server, {
    cors: { origin: "*" }
    // ☝️ SAME! tumhara socket.ts Line 8-13
  });

  // ============================================
  // SIMPLIFIED AUTH — Mini project mein JWT nahi hai
  // Tumhare socket.ts mein io.use() middleware hai jo JWT verify karta hai
  // Yahan hum simple userId bhej rahe hain
  // ============================================

  io.on("connection", (socket) => {
    // ☝️ COMPARE: tumhara socket.ts Line 37

    const userId = socket.handshake.auth.userId;
    // ☝️ COMPARE: tumhara socket.ts mein:
    //    const token = socket.handshake.auth.token;
    //    const decoded = jwt.verify(token, ...);
    //    const userId = decoded.user._id;
    //    Yahan hum directly userId le rahe hain (no JWT for simplicity)

    const role = socket.handshake.auth.role;
    // ☝️ "customer" ya "restaurant" — ye batata hai ki USER kya hai

    if (!userId) {
      socket.disconnect();
      return;
    }

    // -------- ROOM JOIN (SAME LOGIC!) --------

    socket.join(`user:${userId}`);
    // ☝️ EXACT SAME! tumhara socket.ts Line 48:
    //    socket.join(`user:${userId}`);
    //    Har user apni room mein join hota hai

    if (role === "restaurant") {
      socket.join(`restaurant:${userId}`);
      // ☝️ COMPARE: tumhara socket.ts Line 50-52:
      //    if (user.restaurantId) {
      //      socket.join(`restaurant:${user.restaurantId}`);
      //    }
      //    Restaurant owners restaurant room mein bhi join hote hain
    }

    console.log(`✅ User connected: ${userId} (${role})`);
    console.log(`📋 Rooms: ${[...socket.rooms]}`);
    // ☝️ SAME! tumhara socket.ts Line 54-55

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${userId}`);
      // ☝️ SAME! tumhara socket.ts Line 57-59
    });
  });

  return io;
}

function getIO() {
  // ☝️ EXACT SAME! tumhara socket.ts Line 63-69
  if (!io) throw new Error("Socket.IO not initialized!");
  return io;
}

module.exports = { initSocket, getIO };
```

---

### 📄 FILE 3: `realtime-service/routes/internal.js`

**(Compare: `services/realtime/src/routes/internal.ts`)**

```javascript
// ============================================
// internal.js — THE BRIDGE 🌉
// COMPARE: services/realtime/src/routes/internal.ts
// YE FILE: HTTP request → WebSocket message convert karti hai
// ============================================

const express = require("express");
const { getIO } = require("../socket");
// ☝️ SAME! tumhara internal.ts Line 2: import { getIO } from "../socket.js";

const router = express.Router();
// ☝️ SAME! tumhara internal.ts Line 4

const INTERNAL_KEY = "my-secret-key-123";
// ☝️ COMPARE: tumhara .env mein INTERNAL_SERVICE_KEY=daracyrys@valhallah

// ============================================
// POST /emit — THE BRIDGE ROUTE
// ============================================
router.post("/emit", (req, res) => {
  // ☝️ EXACT SAME! tumhara internal.ts Line 6

  // -------- Security Check --------
  if (req.headers["x-internal-key"] !== INTERNAL_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }
  // ☝️ EXACT SAME! tumhara internal.ts Line 7-11
  //    Sirf internal services call kar sakti hain

  // -------- Body se data nikalo --------
  const { event, room, payload } = req.body;
  // ☝️ EXACT SAME! tumhara internal.ts Line 13
  //
  //    Jab restaurant-service call karega:
  //    event   = "order:update"
  //    room    = "user:customer123"
  //    payload = { orderId: "order1", status: "preparing" }

  if (!event || !room) {
    return res.status(400).json({ message: "event and room required" });
  }
  // ☝️ EXACT SAME! tumhara internal.ts Line 14-18

  // -------- THE MAGIC ✨ --------
  const io = getIO();
  // ☝️ EXACT SAME! tumhara internal.ts Line 20

  console.log(`📶 Emitting: ${event} → room: ${room}`);
  // ☝️ SAME! tumhara internal.ts Line 22

  io.to(room).emit(event, payload || {});
  // ☝️ ⭐ EXACT SAME! tumhara internal.ts Line 24
  //    io.to(room).emit(event, payload ?? {});
  //
  //    io = Socket.IO server
  //    .to(room) = is room wale sockets ko target karo
  //    .emit(event, payload) = inko ye event + data bhejo
  //
  //    RESULT: Jo bhi browser is room mein join hai,
  //            usse ye event + payload turant mil jayega!

  return res.json({ success: true });
  // ☝️ SAME! tumhara internal.ts Line 26
});

module.exports = router;
```

---

### 📄 FILE 4: `realtime-service/index.js`

**(Compare: `services/realtime/src/index.ts`)**

```javascript
// ============================================
// index.js — Realtime Service ka Entry Point
// COMPARE: services/realtime/src/index.ts
// ============================================

const express = require("express");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket");
const internalRoute = require("./routes/internal");
// ☝️ SAME imports! tumhara index.ts Line 1-6

const app = express();
app.use(cors());
app.use(express.json());
// ☝️ SAME! tumhara index.ts Line 9-11

app.use("/api/v1/internal", internalRoute);
// ☝️ EXACT SAME! tumhara index.ts Line 13
//    /api/v1/internal + /emit = /api/v1/internal/emit

// ============================================
// HTTP Server + Socket.IO (SAME server pe DONO!)
// ============================================
const server = http.createServer(app);
// ☝️ EXACT SAME! tumhara index.ts Line 15
//    Express app ko HTTP server mein wrap kiya
//    KYU? Kyunki Socket.IO ko raw HTTP server chahiye

initSocket(server);
// ☝️ EXACT SAME! tumhara index.ts Line 17
//    Socket.IO ko is HTTP server pe mount kiya

const PORT = 5004;
server.listen(PORT, () => {
  console.log(`🚀 Realtime service: http://localhost:${PORT}`);
});
// ☝️ EXACT SAME! tumhara index.ts Line 19-21
//    PORT 5004 pe HTTP + WebSocket DONO kaam kar rahe hain
```

---

### 📄 FILE 5: `restaurant-service/index.js`

**(Compare: `services/restaurant/src/controllers/order.ts`)**

```javascript
// ============================================
// restaurant-service/index.js
// COMPARE: services/restaurant/src/controllers/order.ts
//          + OrderCard.tsx
// ============================================

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const REALTIME_SERVICE = "http://localhost:5004";
// ☝️ COMPARE: tumhara .env mein REALTIME_SERVICE=http://localhost:5004
const INTERNAL_KEY = "my-secret-key-123";
// ☝️ COMPARE: tumhara .env mein INTERNAL_SERVICE_KEY=daracyrys@valhallah

// -------- "Database" --------
let orders = [
  { id: "order1", item: "Butter Chicken", status: "placed", userId: "customer123", restaurantId: "restaurant456" },
  { id: "order2", item: "Paneer Tikka", status: "placed", userId: "customer789", restaurantId: "restaurant456" },
];
// ☝️ COMPARE: tumhara Order model (MongoDB)

// ============================================
// GET /orders — Fetch orders
// COMPARE: fetchRestaurantOrders (order.ts Line 193)
// ============================================
app.get("/orders", (req, res) => {
  res.json({ orders });
});

// ============================================
// PUT /orders/:id — Update order status
// COMPARE: updateOrderStatus (order.ts Line 230)
// ============================================
app.put("/orders/:id", async (req, res) => {
  const { id } = req.params;
  // ☝️ COMPARE: const { orderId } = req.params; (order.ts Line 234)

  const { status } = req.body;
  // ☝️ COMPARE: const { status } = req.body; (order.ts Line 235)

  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  // ☝️ COMPARE: order.ts Line 249-255

  // -------- Database mein update --------
  order.status = status;
  // ☝️ EXACT SAME! order.ts Line 277: order.status = status;
  //    (tumhare mein await order.save() bhi hota hai MongoDB ke liye)

  console.log(`✅ Order ${id} → ${status}`);

  // ============================================
  // ⭐ REALTIME UPDATE — THE BRIDGE CALL ⭐
  // COMPARE: order.ts Line 281-297
  // ============================================
  try {
    await axios.post(
      `${REALTIME_SERVICE}/api/v1/internal/emit`,
      // ☝️ EXACT SAME URL!
      //    tumhara: `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`
      {
        event: "order:update",
        // ☝️ EXACT SAME! order.ts Line 285
        //    Event ka naam — frontend mein socket.on("order:update", ...) se sunega

        room: `user:${order.userId}`,
        // ☝️ EXACT SAME! order.ts Line 286
        //    room: `user:${order.userId}`
        //    SIRF is user ke browser ko message jayega!
        //    e.g., room = "user:customer123"

        payload: {
          orderId: order.id,
          status: order.status,
        },
        // ☝️ EXACT SAME! order.ts Line 287-290
        //    payload: { orderId: order._id, status: order.status }
        //    Ye data customer ke browser mein jayega
      },
      {
        headers: {
          "x-internal-key": INTERNAL_KEY,
        },
        // ☝️ EXACT SAME! order.ts Line 292-295
        //    headers: { "x-internal-key": process.env.INTERNAL_SERVICE_KEY }
        //    Security key — taaki /emit route jaane ki ye internal call hai
      }
    );
    console.log(`📶 Realtime event sent for order ${id}`);
  } catch (err) {
    console.error("❌ Failed to send realtime event:", err.message);
  }

  res.json({ message: "Updated!", order });
});

// ============================================
// POST /orders — Create new order (simulate)
// COMPARE: payment.consumer.ts (naye order ka notification)
// ============================================
app.post("/orders", async (req, res) => {
  const { item, userId } = req.body;
  const restaurantId = "restaurant456";

  const newOrder = {
    id: `order${Date.now()}`,
    item,
    status: "placed",
    userId,
    restaurantId,
  };
  orders.push(newOrder);
  // ☝️ COMPARE: Order.create({...}) — order.ts Line 129

  console.log(`🆕 New order: ${newOrder.id}`);

  // -------- Restaurant ko notify karo (SAME as payment.consumer.ts) --------
  try {
    await axios.post(
      `${REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:new",
        // ☝️ COMPARE: payment.consumer.ts Line 51
        //    event: "order:new"

        room: `restaurant:${restaurantId}`,
        // ☝️ COMPARE: payment.consumer.ts Line 52
        //    room: `restaurant:${order.restaurantId}`

        payload: {
          orderId: newOrder.id,
        },
        // ☝️ COMPARE: payment.consumer.ts Line 53-55
      },
      {
        headers: { "x-internal-key": INTERNAL_KEY },
      }
    );
  } catch (err) {
    console.error("❌ Failed:", err.message);
  }

  res.json({ message: "Order created!", order: newOrder });
});

app.listen(3001, () => {
  console.log("🍽️ Restaurant service: http://localhost:3001");
});
```

---

### 📄 FILE 6: `frontend/index.html`

**(Compare: `SocketContext.tsx` + `RestaurantOrders.tsx` + `OrderCard.tsx`)**

```html
<!-- ============================================ -->
<!-- frontend/index.html                           -->
<!-- COMPARE: SocketContext.tsx + RestaurantOrders  -->
<!-- ============================================ -->
<!DOCTYPE html>
<html>
<head>
  <title>MobiGo Mini — Realtime Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial; background: #0f0f23; color: #e0e0e0; padding: 20px; }
    h1 { color: #00d2ff; margin-bottom: 10px; }
    h2 { color: #ff6b6b; margin: 15px 0 10px; }

    .container { display: flex; gap: 30px; margin-top: 20px; }
    .panel { flex: 1; background: #1a1a3e; border-radius: 12px; padding: 20px;
             border: 1px solid #333; }

    .order { background: #252550; padding: 12px; border-radius: 8px;
             margin: 8px 0; border-left: 4px solid #00d2ff; }
    .status { font-weight: bold; padding: 3px 10px; border-radius: 12px;
              font-size: 12px; display: inline-block; }
    .status-placed { background: #ffd43b33; color: #ffd43b; }
    .status-preparing { background: #339af033; color: #339af0; }
    .status-ready { background: #51cf6633; color: #51cf66; }
    .status-delivered { background: #20c99733; color: #20c997; }

    button { background: #7048e8; color: white; border: none; padding: 6px 14px;
             border-radius: 6px; cursor: pointer; margin: 3px; font-size: 12px;
             transition: all 0.2s; }
    button:hover { background: #5f3dc4; transform: scale(1.05); }
    .btn-new { background: #00d2ff; color: #000; font-weight: bold; padding: 10px 20px;
               font-size: 14px; }

    .log { background: #0d0d1a; padding: 10px; border-radius: 8px; margin-top: 10px;
           max-height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px; }
    .log-entry { padding: 3px 0; border-bottom: 1px solid #222; }
    .log-entry.event { color: #51cf66; }
    .log-entry.info { color: #339af0; }
    .log-entry.warn { color: #ffd43b; }

    .connection-status { display: inline-block; padding: 4px 12px; border-radius: 12px;
                         font-size: 12px; font-weight: bold; }
    .connected { background: #20c99733; color: #20c997; }
    .disconnected { background: #ff6b6b33; color: #ff6b6b; }

    input { background: #252550; border: 1px solid #444; color: #fff; padding: 8px 12px;
            border-radius: 6px; margin: 5px; width: 200px; }
  </style>
</head>
<body>
  <h1>🍕 MobiGo Mini — Realtime Demo</h1>
  <p>Ye demo tumhare MobiGo project ka EXACT SAME realtime pattern use karta hai!</p>

  <!-- ============================================ -->
  <!-- CONNECTION SETUP — COMPARE: SocketContext.tsx -->
  <!-- ============================================ -->
  <div style="margin: 15px 0; display: flex; gap: 10px; align-items: center;">
    <label>Role:</label>
    <select id="roleSelect">
      <option value="customer">👤 Customer</option>
      <option value="restaurant">👨‍🍳 Restaurant Owner</option>
    </select>
    <label>User ID:</label>
    <input id="userIdInput" value="customer123" placeholder="e.g. customer123" />
    <button onclick="connectSocket()" class="btn-new">🔌 Connect</button>
    <span id="connStatus" class="connection-status disconnected">Disconnected</span>
  </div>

  <div class="container">
    <!-- ============================================ -->
    <!-- CUSTOMER PANEL — Order track karo             -->
    <!-- ============================================ -->
    <div class="panel">
      <h2>👤 Customer Side (Order Tracking)</h2>
      <p style="font-size:12px; color:#888;">Realtime status updates milte hain — bina refresh ke!</p>
      <div id="customerOrders"></div>

      <h3 style="margin-top:15px; color:#ffd43b;">📦 Create New Order:</h3>
      <input id="newItemInput" placeholder="Item name (e.g. Biryani)" />
      <input id="newUserInput" placeholder="Customer ID (e.g. customer789)" />
      <button onclick="createOrder()" class="btn-new">+ New Order</button>
    </div>

    <!-- ============================================ -->
    <!-- RESTAURANT PANEL — Status update karo         -->
    <!-- COMPARE: OrderCard.tsx                        -->
    <!-- ============================================ -->
    <div class="panel">
      <h2>👨‍🍳 Restaurant Side (Manage Orders)</h2>
      <p style="font-size:12px; color:#888;">Status buttons dabao — customer ko TURANT dikhega!</p>
      <div id="restaurantOrders"></div>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- EVENT LOG — Dekho kya ho raha hai realtime    -->
  <!-- ============================================ -->
  <div style="margin-top:20px;">
    <h2>📋 Realtime Event Log</h2>
    <div id="eventLog" class="log">
      <div class="log-entry info">Waiting for connection...</div>
    </div>
  </div>

  <!-- Socket.IO CLIENT library (CDN se) -->
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
  <!-- ☝️ COMPARE: tumhare project mein:
       npm package: socket.io-client
       import { io } from "socket.io-client";
       Yahan CDN se load ho raha hai (same library, different delivery) -->

  <script>
    let socket = null;
    // ☝️ COMPARE: SocketContext.tsx Line 22:
    //    const socketRef = useRef<Socket | null>(null);
    //    Same concept — socket reference store karna

    const REALTIME_URL = "http://localhost:5004";
    // ☝️ COMPARE: main.tsx Line 13:
    //    export const realtimeService = 'http://localhost:5004';

    const RESTAURANT_URL = "http://localhost:3001";
    // ☝️ COMPARE: main.tsx Line 12:
    //    export const restaurantService = 'http://localhost:5001';

    // ============================================
    //  addLog() — Event log mein entry add karo
    // ============================================
    function addLog(msg, type = "info") {
      const log = document.getElementById("eventLog");
      const entry = document.createElement("div");
      entry.className = `log-entry ${type}`;
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      log.prepend(entry);
    }

    // ============================================
    // connectSocket() — WebSocket Connection Banana
    // COMPARE: SocketContext.tsx Line 34-38
    // ============================================
    function connectSocket() {
      if (socket) {
        socket.disconnect();
        // ☝️ COMPARE: SocketContext.tsx Line 26:
        //    socketRef.current?.disconnect();
      }

      const userId = document.getElementById("userIdInput").value;
      const role = document.getElementById("roleSelect").value;

      socket = io(REALTIME_URL, {
        auth: {
          userId: userId,     // ← Ye socket.ts mein socket.handshake.auth.userId se milega
          role: role,         // ← Ye socket.ts mein socket.handshake.auth.role se milega
        },
        transports: ["websocket"],
      });
      // ☝️ EXACT SAME PATTERN! SocketContext.tsx Line 34-38:
      //    const socket = io(realtimeService, {
      //        auth: { token: localStorage.getItem("token") },
      //        transports: ["websocket"],
      //    });
      //
      //    Fark sirf ye hai ki:
      //    - Tumhara project JWT token bhejta hai → socket.ts mein jwt.verify() hota hai
      //    - Mini project mein directly userId bhej rahe hain (simplified)

      // -------- Connection Events --------
      socket.on("connect", () => {
        // ☝️ COMPARE: SocketContext.tsx Line 43-45
        document.getElementById("connStatus").textContent = "Connected ✅";
        document.getElementById("connStatus").className = "connection-status connected";
        addLog(`Connected as ${role}: ${userId} (socket: ${socket.id})`, "event");
      });

      socket.on("disconnect", () => {
        // ☝️ COMPARE: SocketContext.tsx Line 47-49
        document.getElementById("connStatus").textContent = "Disconnected ❌";
        document.getElementById("connStatus").className = "connection-status disconnected";
        addLog("Disconnected from realtime service", "warn");
      });

      socket.on("connect_error", (err) => {
        // ☝️ COMPARE: SocketContext.tsx Line 51-53
        addLog(`Connection error: ${err.message}`, "warn");
      });

      // ============================================
      // EVENT LISTENERS — Events sun raha hai
      // ============================================

      // -------- "order:update" event listener --------
      socket.on("order:update", (data) => {
        // ☝️ YE WO LISTENER HAI JO TUMHARE MOBIGO MEIN ABHI NAHI HAI!
        //    Tumhare project mein "order:update" bhejta hai (order.ts Line 285)
        //    Lekin frontend mein listener NAHI lagaya abhi!
        //
        //    Is mini project mein hum dikha rahe hain ki
        //    agar listener hota toh KAISE kaam karta

        addLog(`🔔 order:update received! Order: ${data.orderId} → ${data.status}`, "event");
        // data = payload = { orderId: "order1", status: "preparing" }
        fetchAndRenderOrders();
        // Orders dubara fetch karo taki UPDATED status dikhe
      });

      // -------- "order:new" event listener --------
      socket.on("order:new", (data) => {
        // ☝️ COMPARE: RestaurantOrders.tsx Line 87:
        //    socket.on("order:new", onNewOrder);
        //
        //    Bilkul SAME! Jab naya order aaye toh:

        addLog(`🆕 order:new received! Order: ${data.orderId}`, "event");
        // ☝️ COMPARE: RestaurantOrders.tsx Line 75:
        //    console.log("New Order received socket");

        // Tumhare project mein yahan audio bhi bajta hai:
        // audioRef.current.play() — RestaurantOrders.tsx Line 80
        // Mini project mein hum audio skip kar rahe hain

        fetchAndRenderOrders();
        // ☝️ COMPARE: RestaurantOrders.tsx Line 84:
        //    fetchOrders();
        //    Bilkul SAME! Orders refresh karo!
      });

      fetchAndRenderOrders();
    }

    // ============================================
    // fetchAndRenderOrders() — Orders fetch + render
    // COMPARE: RestaurantOrders.tsx → fetchOrders()
    // ============================================
    async function fetchAndRenderOrders() {
      try {
        const res = await fetch(`${RESTAURANT_URL}/orders`);
        const data = await res.json();
        // ☝️ COMPARE: RestaurantOrders.tsx Line 51-58:
        //    const { data } = await axios.get(`${restaurantService}/api/order/${restaurantId}`)
        //    setOrders(data.orders || []);

        renderCustomerOrders(data.orders);
        renderRestaurantOrders(data.orders);
      } catch (err) {
        console.error(err);
      }
    }

    // ============================================
    // renderCustomerOrders() — Customer ka UI
    // ============================================
    function renderCustomerOrders(orders) {
      const div = document.getElementById("customerOrders");
      div.innerHTML = orders.map(order => `
        <div class="order">
          <strong>🆔 ${order.id}</strong> — ${order.item}<br/>
          <span class="status status-${order.status}">${order.status.toUpperCase()}</span>
          <span style="font-size:11px; color:#666; margin-left:8px;">
            (Owner: ${order.userId})
          </span>
        </div>
      `).join("");
    }

    // ============================================
    // renderRestaurantOrders() — Restaurant ka UI
    // COMPARE: OrderCard.tsx
    // ============================================
    function renderRestaurantOrders(orders) {
      const div = document.getElementById("restaurantOrders");
      div.innerHTML = orders.map(order => `
        <div class="order">
          <strong>🆔 ${order.id}</strong> — ${order.item}
          <span class="status status-${order.status}">${order.status.toUpperCase()}</span><br/>
          <span style="font-size:11px; color:#666;">Customer: ${order.userId}</span><br/>
          <div style="margin-top:8px;">
            <button onclick="updateOrderStatus('${order.id}', 'preparing')">🍳 Preparing</button>
            <button onclick="updateOrderStatus('${order.id}', 'ready')">✅ Ready</button>
            <button onclick="updateOrderStatus('${order.id}', 'delivered')">🚗 Delivered</button>
          </div>
        </div>
        <!-- ☝️ COMPARE: OrderCard.tsx mein:
             const actions = ORDER_ACTION[order.status] || [];
             Tumhare project mein status-based buttons dikhte hain
             (orderflow.ts: placed→["accepted"], accepted→["preparing"], etc.)
             Yahan hum sab buttons dikha rahe hain simplicity ke liye -->
      `).join("");
    }

    // ============================================
    // updateOrderStatus() — Status change karo
    // COMPARE: OrderCard.tsx → updateStatus()
    // ============================================
    async function updateOrderStatus(orderId, status) {
      addLog(`📤 Sending status update: ${orderId} → ${status}`, "info");

      await fetch(`${RESTAURANT_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      // ☝️ COMPARE: OrderCard.tsx Line 43-49:
      //    await axios.put(`${restaurantService}/api/order/${order._id}`, {
      //        status
      //    }, {
      //        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      //    })
      //
      //    SAME chain start hogi:
      //    1. Restaurant service mein PUT request jaayegi
      //    2. Status DB mein update hoga
      //    3. axios.post("/emit") call hoga
      //    4. Realtime service mein /emit route handle karega
      //    5. io.to(room).emit(event, payload) chalega
      //    6. Customer ke browser mein socket.on("order:update") fire hoga!
      //    7. UI UPDATE! 🎉

      // Status update ke baad local list bhi refresh karo
      fetchAndRenderOrders();
      // ☝️ COMPARE: OrderCard.tsx Line 51:
      //    onStatusUpdate?.() — jo fetchOrders() call karta hai
    }

    // ============================================
    // createOrder() — Naya order banao
    // COMPARE: payment.consumer.ts (notification part)
    // ============================================
    async function createOrder() {
      const item = document.getElementById("newItemInput").value || "Biryani";
      const userId = document.getElementById("newUserInput").value || "customer789";

      addLog(`📤 Creating new order: ${item} for ${userId}`, "info");

      await fetch(`${RESTAURANT_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, userId }),
      });
      // ☝️ Ye restaurant service mein POST /orders ke handlers ko call karega
      //    Jo internally /emit call karega with event: "order:new"
      //    Restaurant owner ke browser mein socket.on("order:new") fire hoga!

      fetchAndRenderOrders();
    }

    // Initial fetch
    fetchAndRenderOrders();
  </script>
</body>
</html>
```

---

## 📖 CHAPTER 11: HOW TO TEST — Step by Step

### 🚀 Step 1: Files Create Karo

```
mini-realtime-project/
├── package.json
├── realtime-service/
│   ├── index.js
│   ├── socket.js
│   └── routes/
│       └── internal.js
├── restaurant-service/
│   └── index.js
└── frontend/
    └── index.html
```

### 🚀 Step 2: Install Dependencies

```bash
cd mini-realtime-project
npm install
```

### 🚀 Step 3: Start Both Services

**Terminal 1:**
```bash
node realtime-service/index.js
# Output: 🚀 Realtime service: http://localhost:5004
```

**Terminal 2:**
```bash
node restaurant-service/index.js
# Output: 🍽️ Restaurant service: http://localhost:3001
```

### 🚀 Step 4: Open Browser

Open `frontend/index.html` in **2 ALAG TABS**:

```
╔══════════════════════════════════════════════════════════════════╗
║                    TESTING STEPS                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  TAB 1 (Customer):                                               ║
║  ─────────────────                                                ║
║  1. Role = "Customer"                                             ║
║  2. User ID = "customer123"                                       ║
║  3. Click "🔌 Connect"                                            ║
║  4. Status "Connected ✅" dikhna chahiye                          ║
║                                                                   ║
║  TAB 2 (Restaurant Owner):                                       ║
║  ─────────────────────────                                        ║
║  1. Role = "Restaurant Owner"                                     ║
║  2. User ID = "restaurant456"                                     ║
║  3. Click "🔌 Connect"                                            ║
║  4. Status "Connected ✅" dikhna chahiye                          ║
║                                                                   ║
║  TEST 1 — Status Update:                                          ║
║  ─────────────────────────                                        ║
║  TAB 2 mein "🍳 Preparing" button dabao ──────►                  ║
║  ──────► TAB 1 mein TURANT status change dikhega!                ║
║  ──────► Event log mein "🔔 order:update received!" ayega!       ║
║  ──────► BINA page refresh ke! This is REALTIME! ⚡              ║
║                                                                   ║
║  TEST 2 — New Order:                                              ║
║  ──────────────────────                                           ║
║  TAB 1 mein new order create karo ──────►                        ║
║  ──────► TAB 2 mein TURANT naya order dikhega!                   ║
║  ──────► Event log mein "🆕 order:new received!" aayega!         ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 📖 CHAPTER 12: MINI PROJECT KA COMPLETE FLOW

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                 MINI PROJECT — COMPLETE DATA FLOW                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ╔══════════════╗                                  ╔══════════════╗          ║
║  ║  TAB 2       ║                                  ║  TAB 1       ║          ║
║  ║  Restaurant   ║                                  ║  Customer     ║          ║
║  ║  Owner        ║                                  ║               ║          ║
║  ╚═══╤══════════╝                                  ╚═══╤══════════╝          ║
║      │                                                  │                     ║
║      │ 1. Click "Preparing"                             │                     ║
║      │ updateOrderStatus("order1","preparing")          │                     ║
║      │                                                  │                     ║
║      ▼ (HTTP PUT)                                       │                     ║
║  ╔══════════════════╗                                   │                     ║
║  ║ restaurant-      ║                                   │                     ║
║  ║ service (3001)   ║                                   │                     ║
║  ║                  ║                                   │                     ║
║  ║ order.status =   ║                                   │                     ║
║  ║ "preparing"      ║                                   │                     ║
║  ║                  ║                                   │                     ║
║  ║ axios.post(      ║                                   │                     ║
║  ║  "/emit", {      ║                                   │                     ║
║  ║   event,room,    ║                                   │                     ║
║  ║   payload        ║                                   │                     ║
║  ║ })               ║                                   │                     ║
║  ╚═══╤══════════════╝                                   │                     ║
║      │ (HTTP POST)                                      │                     ║
║      ▼                                                  │                     ║
║  ╔══════════════════╗        WebSocket                  │                     ║
║  ║ realtime-        ║ ═══════════════════════════►      │                     ║
║  ║ service (5004)   ║                                   │                     ║
║  ║                  ║  io.to("user:customer123")        │                     ║
║  ║ /emit route      ║  .emit("order:update", {          ▼                     ║
║  ║                  ║    orderId, status              socket.on(              ║
║  ║ io.to(room)      ║  })                            "order:update",         ║
║  ║ .emit(event,     ║                                (data) => {             ║
║  ║  payload)        ║                                  // UI update!         ║
║  ╚══════════════════╝                                  // data.status =      ║
║                                                        // "preparing"        ║
║                                                        })                    ║
║                                                                              ║
║  ⚡ TOTAL TIME: < 50 milliseconds (almost instant!)                         ║
║  📊 Network calls: 2 (PUT + POST /emit) — NOT per-second polling!          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 📖 CHAPTER 13: POLLING vs SOCKET.IO — Final Comparison

```
╔════════════════════╦══════════════════════════╦══════════════════════════╗
║     Feature         ║  POLLING (BINA Socket)    ║  SOCKET.IO (SAATH)        ║
╠════════════════════╬══════════════════════════╬══════════════════════════╣
║ Network calls       ║ 30/min (har 2 sec)       ║ 0 (sirf jab zarurat ho)  ║
║                     ║ per user! 😱             ║  BAHUT efficient! 🎯     ║
╠════════════════════╬══════════════════════════╬══════════════════════════╣
║ Delay               ║ 0-2 sec (jab tak         ║ < 50ms (turant!) ⚡     ║
║                     ║ next poll na aaye)        ║                          ║
╠════════════════════╬══════════════════════════╬══════════════════════════╣
║ Server load         ║ BAHUT zyada              ║ Minimal                   ║
║                     ║ (N users × polls/sec)    ║ (event-based)             ║
╠════════════════════╬══════════════════════════╬══════════════════════════╣
║ Battery (mobile)    ║ 🔋 Drain hota hai        ║ 🔋 Efficient              ║
║                     ║ (constant HTTP reqs)     ║ (idle connection)         ║
╠════════════════════╬══════════════════════════╬══════════════════════════╣
║ Code complexity     ║ Simple (setInterval)     ║ Thoda complex             ║
║                     ║                          ║ (socket setup needed)     ║
╠════════════════════╬══════════════════════════╬══════════════════════════╣
║ Tumhare project     ║ ❌ Use NAHI kar rahe     ║ ✅ YE use kar rahe ho!    ║
║ mein                ║                          ║ (services/realtime)        ║
╚════════════════════╩══════════════════════════╩══════════════════════════╝
```

---

## 📋 PART 2 — FINAL SUMMARY BOX

```
╔══════════════════════════════════════════════════════════════════════════╗
║                        PART 2 SUMMARY                                    ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  1️⃣ POLLING (setInterval) → SIMPLE but WASTEFUL                        ║
║     Har 2 sec server se poochho → 90% time empty response               ║
║     Server pe load ↑, Battery drain ↑, Delay ↑                         ║
║                                                                          ║
║  2️⃣ SOCKET.IO → SMART and EFFICIENT                                    ║
║     Connect ek baar → Server KHUD bataye jab kuch ho                    ║
║     Zero waste → Instant delivery → Server load ↓                      ║
║                                                                          ║
║  3️⃣ MINI PROJECT FILES ←→ MOBIGO FILES:                                ║
║     socket.js         ←→  services/realtime/src/socket.ts               ║
║     routes/internal.js ←→  services/realtime/src/routes/internal.ts     ║
║     index.js (realtime) ←→  services/realtime/src/index.ts             ║
║     index.js (restaurant) ←→  controllers/order.ts                     ║
║     index.html         ←→  SocketContext.tsx + RestaurantOrders.tsx     ║
║                                                                          ║
║  4️⃣ THE BRIDGE PATTERN (KEY TAKEAWAY):                                 ║
║     Backend services SIRF HTTP jaanti hain                              ║
║     Frontend SIRF WebSocket se connected hai                            ║
║     /emit route = BRIDGE = HTTP → WebSocket converter                   ║
║     Ek route se UNLIMITED events manage ho sakte hain!                  ║
║                                                                          ║
║  5️⃣ OBSERVATION (TUMHARE PROJECT KE LIYE):                             ║
║     ⚠️ "order:update" event bhejta hai order.ts (Line 285)             ║
║     ⚠️ Lekin frontend mein KOI LISTENER NAHI hai "order:update" ka!    ║
║     ⚠️ Customer ko ABHI status updates realtime mein NAHI mil rahe!    ║
║     ⚠️ Ye add karna padega kisi page mein!                              ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

> 🎉 **Ab tumhe pata hai ki MobiGo mein realtime KAISE kaam karta hai!**
> 
> Har cheez EK LINE mein:
> **`io.to(room).emit(event, payload)` — Bas yahi ek line hai jo PURE project ko REALTIME banati hai!** 🚀
