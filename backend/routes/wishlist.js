const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function getWishlistForUser(userId) {
  return db
    .prepare(
      `SELECT p.id, p.name, p.price, p.image, p.category
       FROM wishlist_items w JOIN products p ON p.id = w.product_id
       WHERE w.user_id = ?
       ORDER BY w.id DESC`
    )
    .all(userId);
}

// GET /api/wishlist
router.get("/", (req, res) => {
  res.json(getWishlistForUser(req.user.id));
});

// POST /api/wishlist  { productId }
router.post("/", (req, res) => {
  const { productId } = req.body || {};
  const product = db.prepare("SELECT id FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ error: "Product not found." });

  db.prepare(
    "INSERT OR IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)"
  ).run(req.user.id, productId);

  res.status(201).json(getWishlistForUser(req.user.id));
});

// DELETE /api/wishlist/:productId
router.delete("/:productId", (req, res) => {
  db.prepare("DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?").run(
    req.user.id,
    req.params.productId
  );
  res.json(getWishlistForUser(req.user.id));
});

module.exports = router;
