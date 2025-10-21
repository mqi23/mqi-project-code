const express = require("express");
const app = express();
app.use(express.json());

// ===============================
// Food Order API
// ===============================
// GOAL:
// Build a small Express.js API with only TWO routes:
//   1️⃣ GET  /menu     -> list available food items
//   2️⃣ POST /orders   -> place a new order (with simple coupon support)

// -------------------------------
// ✅ Example of "database"
// -------------------------------
const menu = [
  {
    id: 1,
    name: "Margherita Pizza",
    price: 6000,
    stock: 20,
    tags: ["pizza", "veg"],
  },
  { id: 2, name: "Pepperoni Pizza", price: 7000, stock: 15, tags: ["pizza"] },
  {
    id: 3,
    name: "Chicken Shawarma",
    price: 4000,
    stock: 25,
    tags: ["sandwich"],
  },
  {
    id: 4,
    name: "Fattoush Salad",
    price: 3000,
    stock: 30,
    tags: ["salad", "veg"],
  },
];

const coupons = [
  { code: "SAVE10", percent: 10, maxDiscount: 2000 },
  { code: "aon", percent: 30, maxDiscount: 1000 },
];

// ===============================
// ROUTE 1: GET /menu
// ===============================

app.get("/menu", (req, res) => {
  // TODO(1): return the list of all menu items in JSON format.
  // Example response:
  // [
  //   { "id":1, "name":"Margherita Pizza", "price":6000, "stock":20, "tags":["pizza","veg"] },
  //   ...
  // ]
  //
  // Optional:
  // - Support ?tag=pizza to filter items by tag (e.g. GET /menu?tag=pizza)
  const tag = req.query.tag;
  let result = menu;
  if (tag) {
    result = menu.map((item) => item.tags.includes(tag));
  }
  res.json(result);
});

// ===============================
// ROUTE 2: POST /orders
// ===============================

app.post("/orders", (req, res) => {
  const { items, coupon } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: '"items" must be a non-empty array' });
  }

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const { id, qty } = item;
    if (!Number.isInteger(id) || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Each item must have a valid "id" and positive "qty"' });
    }
    const menuItem = menu.find((m) => m.id === id);
    if (!menuItem) {
      return res.status(400).json({ error: `Item with id ${id} does not exist in menu` });
    }
    if (menuItem.stock < qty) {
      return res.status(400).json({ error: `Not enough stock for item id ${id}` });
    }

    const itemTotal = menuItem.price * qty;
    subtotal += itemTotal;
    orderItems.push({ id, qty, price: itemTotal });
  }
  let discount = 0;
  if (coupon) {
    const couponObj = coupons.find((c) => c.code === coupon);
    if (couponObj) {
      discount = Math.min((subtotal * couponObj.percent) / 100, couponObj.maxDiscount);
    }
  }

  const total = subtotal - discount;
  const response = {
    currency: "IQD",
    items: orderItems,
    subtotal,
    coupon: coupon || null,
    discount,
    total,
    createdAt: new Date().toISOString(),
  };

  res.json(response);
  // TODO(2): receive JSON body with the format:
  // {
  //   "items": [ { "id": 1, "qty": 2 }, { "id": 4, "qty": 1 } ],
  //   "coupon": "SAVE10"
  // }
  // Steps to implement:
  //   1. Validate that "items" exists and is a non-empty array
  //   2. For each item:
  //        - Ensure id and qty are valid integers
  //        - Ensure item exists in menu
  //        - Ensure enough stock
  //   3. Calculate subtotal (sum of item.price * qty)
  //   4. Apply coupon if valid
  //   5. Return final JSON response:
  //
  // Example response:
  // {
  //   "currency": "IQD",
  //   "items": [
  //     { "id": 1, "qty": 2, "price": 6000 },
  //     { "id": 4, "qty": 1, "price": 3000 }
  //   ],
  //   "subtotal": 15000,
  //   "coupon": "SAVE10",
  //   "discount": 1500,
  //   "total": 13500,
  //   "createdAt": "2025-10-20T12:34:56.000Z"
  // }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Food Order API running on http://localhost:${PORT}`)
);
