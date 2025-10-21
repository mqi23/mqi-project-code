// index.js
// Minimal Express starter for "cards-api" training (NO DB, NO file writes)

//NOTE: Due date for this assignment is 2 days onlyfrom assignment time.

// Data models (no DB):
// User: { id, name, phone, password, balance }
// Plan: { id, title, description, image, price, provider }
// Stock: { id, code, planId, status: 'ready' | 'sold' | 'error' }

// TODO: Keep data in memory (arrays). Instructor may paste sample data here.

const express = require("express");
const app = express();
app.use(express.json());

// TODO: Implement a simple auth by using JWT
// function auth(req,res,next){ /* read Authorization: Bearer <token> and set req.user */ }

// ===================== STUDENT TASKS (10 endpoints) =====================

// 1) POST /users/login
// - Body: { phone, password }
// - Find user, verify, return { token } or 401

// 2) GET /users/me  (Auth required)
// - Return current user basic info: { id, name, phone, balance }

// 3) GET /plans
// - Return all plans

// 4) GET /plans/:id
// - Return plan by id or 404

// 5) POST /purchase  (Auth required)
// - Body: { planId }
// - Check user balance >= plan.price
// - Pick ONE stock item with status='ready' for this planId
// - Mark it 'sold' then return { plan, code }

// 6) GET /stock/:planId/available
// - Return available items for planId (status='ready')
// - Tip: mask codes in list responses (e.g., show last 4 chars only)

// 7) GET /plans/search?q=term
// - Search by title/provider (case-insensitive), return matches

// 8) GET /stock/summary
// - Group stock by planId: [{ planId, ready, sold, error }]

// ===================== SERVER =====================
app.listen(3000, () => {
  console.log(`cards-api listening on http://localhost:${PORT}`);
});
