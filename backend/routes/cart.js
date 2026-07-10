const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function getCartForUser(userId) {
  return db
    .prepare(
      `SELECT c.product_id AS id, c.quantity, p.name, p.price, p.image, p.category
       FROM cart_items c JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?
       ORDER BY c.id ASC`
    )
    .all(userId);
}

// GET /api/cart
router.get("/", (req, res) => {
  res.json(getCartForUser(req.user.id));
});

// POST /api/cart  { productId, quantity }
router.post("/", (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ error: "Product not found." });

  const existing = db
    .prepare("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?")
    .get(req.user.id, productId);

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?").run(
      Math.max(1, quantity),
      existing.id
    );
  } else {
    db.prepare(
      "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)"
    ).run(req.user.id, productId, Math.max(1, quantity));
  }

  res.status(201).json(getCartForUser(req.user.id));
});

// PUT /api/cart/:productId  { quantity }
router.put("/:productId", (req, res) => {
  const { quantity } = req.body || {};
  if (!quantity || quantity < 1) {
    db.prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?").run(
      req.user.id,
      req.params.productId
    );
  } else {
    db.prepare(
      "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?"
    ).run(quantity, req.user.id, req.params.productId);
  }
  res.json(getCartForUser(req.user.id));
});

// DELETE /api/cart/:productId
router.delete("/:productId", (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?").run(
    req.user.id,
    req.params.productId
  );
  res.json(getCartForUser(req.user.id));
});

// DELETE /api/cart  (clear)
router.delete("/", (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(req.user.id);
  res.json([]);
});

module.exports = router;
