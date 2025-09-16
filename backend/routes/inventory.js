// backend/routes/inventory.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all inventory items
router.get("/", async (req, res) => {
  const [rows] = await db.query(`
    SELECT i.id, i.quantity, r.name, r.brand, r.units, r.price, r.status
    FROM inventory i
    JOIN raw_materials r ON i.raw_material_id = r.id
  `);
  res.json(rows);
});

export default router;
