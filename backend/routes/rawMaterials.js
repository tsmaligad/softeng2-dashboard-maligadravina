// backend/routes/rawMaterials.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// Get all raw materials
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM raw_materials");
  res.json(rows);
});

// Add new raw material
router.post("/", async (req, res) => {
  const { name, brand, description, units, price, status } = req.body;
  const [result] = await db.query(
    "INSERT INTO raw_materials (name, brand, description, units, price, status) VALUES (?, ?, ?, ?, ?, ?)",
    [name, brand, description, units, price, status || "Available"]
  );
  res.json({ id: result.insertId, name, brand, description, units, price, status });
});

export default router;
