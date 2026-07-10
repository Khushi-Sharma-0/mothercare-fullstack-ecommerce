const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/products?category=toys&q=teddy
router.get("/", (req, res) => {
  const { category, q } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (q) {
    sql += " AND name LIKE ?";
    params.push(`%${q}%`);
  }
  sql += " ORDER BY name ASC";

  const products = db.prepare(sql).all(...params);
  res.json(products);
});

// GET /api/products/:id
router.get("/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found." });
  res.json(product);
});

module.exports = router;
