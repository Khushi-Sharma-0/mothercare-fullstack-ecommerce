// seed.js — loads data/catalog.json (extracted from the original site's
// product pages) into the products table. Safe to re-run: uses upsert.

const fs = require("fs");
const path = require("path");
const db = require("./db");

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "catalog.json"), "utf-8")
);

const upsert = db.prepare(`
  INSERT INTO products (id, name, price, image, category)
  VALUES (@id, @name, @price, @image, @category)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    price = excluded.price,
    image = excluded.image,
    category = excluded.category
`);

const insertMany = db.transaction((items) => {
  for (const item of items) upsert.run(item);
});

insertMany(catalog);

console.log(`Seeded ${catalog.length} products into the database.`);
