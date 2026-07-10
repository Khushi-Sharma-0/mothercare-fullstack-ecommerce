const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Stripe is optional. If STRIPE_SECRET_KEY is set in .env, real Stripe
// Checkout Sessions are created. Otherwise payments are simulated so the
// full flow (cart -> checkout -> order confirmation) still works out of
// the box for development/demo purposes.
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
}

function getCart(userId) {
  return db
    .prepare(
      `SELECT c.product_id AS id, c.quantity, p.name, p.price
       FROM cart_items c JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`
    )
    .all(userId);
}

// POST /api/orders/checkout
// body: { shipping: { name, address, phone }, paymentMethod: "card" | "cod" }
router.post("/checkout", async (req, res) => {
  const { shipping = {}, paymentMethod = "card" } = req.body || {};
  const cart = getCart(req.user.id);

  if (cart.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Cash on delivery: create the order immediately as "confirmed".
  if (paymentMethod === "cod" || !stripe) {
    const orderId = createOrder({
      userId: req.user.id,
      cart,
      total,
      shipping,
      paymentMethod: paymentMethod === "cod" ? "cod" : "card_simulated",
      paymentRef: paymentMethod === "cod" ? null : `SIMULATED-${Date.now()}`,
      status: "confirmed",
    });
    clearCart(req.user.id);
    return res.status(201).json({
      orderId,
      total,
      status: "confirmed",
      simulated: !stripe,
      message: stripe
        ? "Order placed with cash on delivery."
        : "Payment simulated (no STRIPE_SECRET_KEY configured). Order confirmed.",
    });
  }

  // Real Stripe Checkout Session
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: cart.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${process.env.CLIENT_URL || "http://localhost:5500"}/checkout.html?success=1&order_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5500"}/checkout.html?canceled=1`,
      metadata: { userId: String(req.user.id) },
    });

    const orderId = createOrder({
      userId: req.user.id,
      cart,
      total,
      shipping,
      paymentMethod: "card",
      paymentRef: session.id,
      status: "pending_payment",
    });

    res.status(201).json({ orderId, checkoutUrl: session.url, status: "pending_payment" });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Payment provider error. Please try again." });
  }
});

function createOrder({ userId, cart, total, shipping, paymentMethod, paymentRef, status }) {
  const info = db
    .prepare(
      `INSERT INTO orders (user_id, total, status, shipping_name, shipping_address, shipping_phone, payment_method, payment_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      total,
      status,
      shipping.name || null,
      shipping.address || null,
      shipping.phone || null,
      paymentMethod,
      paymentRef
    );

  const orderId = info.lastInsertRowid;
  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)`
  );
  for (const item of cart) {
    insertItem.run(orderId, item.id, item.name, item.price, item.quantity);
  }
  return orderId;
}

function clearCart(userId) {
  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
}

// GET /api/orders  (order history for the logged-in user)
router.get("/", (req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);

  const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
  const withItems = orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));
  res.json(withItems);
});

module.exports = router;
