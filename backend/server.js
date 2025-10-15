// backend/server.js — Express API using USERS table only
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype);
    cb(ok ? null : new Error('Unsupported image type'), ok);
  }
});

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

/* ---------------- MySQL pool ---------------- */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'sweettreats_db',
  waitForConnections: true,
  connectionLimit: 10,
});

/* ---------------- Helpers ---------------- */
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getBearerToken(req) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

/* ---------------- Health ---------------- */
app.get('/', (_req, res) => res.json({ message: 'SweetTreats backend is alive!' }));
app.get('/health', (_req, res) => res.json({ ok: true, time: Date.now() }));

app.get('/health/db', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM users');
    res.json({ ok: true, users: rows[0].count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* ---------------- AUTH ---------------- */

// POST /login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const [rows] = await pool.execute(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows?.[0];
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ success: true, token, role: user.role, name: user.name, email: user.email });
  } catch (e) {
    console.error('LOGIN ERROR', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /admin-login
// POST /admin-login
app.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    console.log('[admin-login] body.email =', JSON.stringify(email));
    console.log('[admin-login] body.password length =', password ? password.length : 0);

    const [rows] = await pool.execute(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = ? AND role = 'admin' LIMIT 1",
      [email]
    );
    console.log('[admin-login] rows.length =', rows.length);
    if (rows.length) {
      const u = rows[0];
      console.log('[admin-login] found user →', {
        id: u.id,
        email: u.email,
        role: u.role,
        hash_len: (u.password_hash || '').length,
        email_hex: Buffer.from(u.email, 'utf8').toString('hex'),
      });
      const ok = await bcrypt.compare(password, u.password_hash || '');
      console.log('[admin-login] bcrypt.compare =', ok);
      if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const token = signToken(u);
      return res.json({ success: true, token, role: u.role, name: u.name, email: u.email });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (e) {
    console.error('ADMIN LOGIN ERROR', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// GET /me
// server.js /me
// GET /me
app.get('/me', async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.json({ success: false });

    const decoded = jwt.verify(token, JWT_SECRET);

    // fetch the full user from DB
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [decoded.userId]
    );

    if (!rows.length) return res.json({ success: false });

    const u = rows[0];
    res.json({
      success: true,
      user_id: u.id,
      role: u.role,
      email: u.email,
      name: u.name,
    });
  } catch (e) {
    console.error("ME ERROR", e);
    res.json({ success: false });
  }
});



// POST /logout
app.post('/logout', (_req, res) => res.json({ success: true }));

/* ---------------- Middleware ---------------- */
function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

/* ---------------- Users CRUD ---------------- */

// GET /users?q=
app.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { q = "" } = req.query;
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE name LIKE ? OR email LIKE ?
       ORDER BY created_at DESC
       LIMIT 500`,
      [like, like]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// POST /users
app.post('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role = "user", is_active = 1 } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password required" });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hash, role, Number(is_active) ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId, name, email, role, is_active: !!is_active });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "Email already exists" });
    console.error(e);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// PATCH /users/:id
app.patch('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, is_active } = req.body || {};

    const fields = [];
    const values = [];

    if (name != null) { fields.push("name = ?"); values.push(name); }
    if (email != null) { fields.push("email = ?"); values.push(email); }
    if (role != null) { fields.push("role = ?"); values.push(role); }
    if (is_active != null) { fields.push("is_active = ?"); values.push(Number(is_active) ? 1 : 0); }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push("password_hash = ?");
      values.push(hash);
    }
    if (fields.length === 0) return res.status(400).json({ message: "No changes" });

    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "Email already exists" });
    console.error(e);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE /users/:id
app.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM users WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// POST /register → create a standard user
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password are required" });
    }

    const normName = String(name).trim().replace(/\s+/g, " ");
    const normEmail = String(email).trim().toLowerCase();

    // prevent duplicates
    const [exists] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [normEmail]);
    if (exists.length) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES (?, ?, ?, 'user', 1)`,
      [normName, normEmail, hash]
    );

    res.status(201).json({
      id: result.insertId,
      name: normName,
      email: normEmail,
      role: "user",
      is_active: true,
    });
  } catch (e) {
    console.error("POST /register error:", e);
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});


/* ---------------- Start server ---------------- */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});

/* ---------------- RAW MATERIALS ---------------- */

app.get("/api/raw-materials", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM raw_materials ORDER BY id ASC");
    res.json(rows);
  } catch (e) {
    console.error("GET /api/raw-materials error:", e);
    res.status(500).json({ error: e.message });
  }
});

// POST new raw material
app.post("/api/raw-materials", async (req, res) => {
  try {
    const { name, brand, description, units, price, status } = req.body || {};
    if (!name || !brand || !units || price == null) {
      return res.status(400).json({ error: "name, brand, units, price are required" });
    }
    const [result] = await pool.execute(
      `INSERT INTO raw_materials (name, brand, description, units, price, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, brand, description || "", units, Number(price), status || "Available"]
    );
    const [rows] = await pool.query(
      `SELECT id, name, brand, description, units, price, status, created_at
         FROM raw_materials
         WHERE id = ?`,
      [result.insertId]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error("POST /api/raw-materials error:", e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/inventory  → joined with raw_materials
app.get("/api/inventory", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.id,
        i.raw_material_id AS rawMaterialId,
        i.quantity,
        i.created_at,
        r.name,
        r.brand,
        r.units,
        r.price,
        r.status
      FROM inventory i
      JOIN raw_materials r ON r.id = i.raw_material_id
      ORDER BY i.id ASC
    `);
    res.json(rows);
  } catch (e) {
    console.error("GET /api/inventory error:", e);
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/raw-materials/:id
app.put("/api/raw-materials/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, description, units, price, status } = req.body;

    await pool.query(
      `UPDATE raw_materials
       SET name = ?, brand = ?, description = ?, units = ?, price = ?, status = ?
       WHERE id = ?`,
      [name, brand, description, units, price, status, id]
    );

    res.json({ id, name, brand, description, units, price, status });
  } catch (e) {
    console.error("PUT /api/raw-materials error:", e);
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/raw-materials/:id
app.delete("/api/raw-materials/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM raw_materials WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/raw-materials error:", e);
    res.status(500).json({ error: e.message });
  }
});




// POST /api/inventory
app.post("/api/inventory", async (req, res) => {
  try {
    const { rawMaterialId, quantity } = req.body || {};
    if (!rawMaterialId || !quantity) {
      return res.status(400).json({ error: "rawMaterialId and quantity are required" });
    }
    const [result] = await pool.execute(
      `INSERT INTO inventory (raw_material_id, quantity) VALUES (?, ?)`,
      [rawMaterialId, quantity]
    );
    const [rows] = await pool.query(
      `SELECT
         i.id,
         i.raw_material_id AS rawMaterialId,
         i.quantity,
         i.created_at,
         r.name, r.brand, r.units, r.price, r.status
       FROM inventory i
       JOIN raw_materials r ON i.raw_material_id = r.id
       WHERE i.id = ?`,
      [result.insertId]
    );
    return res.json(rows[0]);
  } catch (e) {
    console.error("POST /api/inventory error:", e);
    return res.status(500).json({ error: e.message });
  }
});



/* ---------------- INVENTORY ---------------- */

// Add inventory item
app.post("/api/inventory", async (req, res) => {
  try {
    const { rawMaterialId, quantity } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO inventory (raw_material_id, quantity)
       VALUES (?, ?)`,
      [rawMaterialId, quantity]
    );

    // Return the new row joined with raw_materials details
    const [rows] = await pool.query(
      `SELECT 
         i.id,
         i.raw_material_id AS rawMaterialId,
         i.quantity,
         i.created_at,
         r.name,
         r.brand,
         r.units,
         r.price,
         r.status
       FROM inventory i
       JOIN raw_materials r ON i.raw_material_id = r.id
       WHERE i.id = ?`,
      [result.insertId]
    );

    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ PRODUCTS: Public (read-only) ------------ */
// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        name,
        base_price,
        sizes,
        flavors,
        addons,
        enabled,
        (image IS NOT NULL) AS has_image,
        image_mime,
        created_at,
        updated_at
      FROM products
      WHERE enabled = 1
      ORDER BY created_at DESC
    `);

    const items = rows.map(r => ({
      id: r.id,
      name: r.name,
      base_price: Number(r.base_price),
      sizes: r.sizes ? JSON.parse(r.sizes) : [],
      flavors: r.flavors ? JSON.parse(r.flavors) : [],
      addons: r.addons ? JSON.parse(r.addons) : [],
      image_url: r.has_image ? `/api/products/${r.id}/image` : null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    res.json({ items });
  } catch (e) {
    console.error('GET /api/products error:', e);
    res.status(500).json({ error: e.message });
  }
});


// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
         id,
         name,
         base_price,
         sizes,
         flavors,
         addons,
         enabled,
         (image IS NOT NULL) AS has_image,
         image_mime,
         created_at,
         updated_at
       FROM products
       WHERE id = ? AND enabled = 1
       LIMIT 1`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: 'Product not found' });

    const p = rows[0];
    res.json({
      id: p.id,
      name: p.name,
      base_price: Number(p.base_price),
      sizes: p.sizes ? JSON.parse(p.sizes) : [],
      flavors: p.flavors ? JSON.parse(p.flavors) : [],
      addons: p.addons ? JSON.parse(p.addons) : [],
      image_url: p.has_image ? `/api/products/${p.id}/image` : null,
      created_at: p.created_at,
      updated_at: p.updated_at,
    });
  } catch (e) {
    console.error('GET /api/products/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});



// Main image (bytes) for <img src=...>
app.get('/api/products/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT image, image_mime FROM products WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows.length || !rows[0].image) return res.status(404).send('Image not found');
    res.set('Content-Type', rows[0].image_mime || 'application/octet-stream');
    res.send(rows[0].image);
  } catch (e) {
    console.error('GET /api/products/:id/image error:', e);
    res.status(500).json({ error: 'Failed to load image' });
  }
});

// POST /api/products/:id/image → upload a product photo
// POST /api/products/:id/image → upload a product photo
app.post('/api/products/:id/image', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    await pool.query(
      `UPDATE products SET image = ?, image_mime = ? WHERE id = ?`,
      [file.buffer, file.mimetype, id]
    );

    res.json({ success: true, message: 'Image uploaded successfully!' });
  } catch (e) {
    console.error('POST /api/products/:id/image error:', e);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});















/* ---------------- PRODUCTS ADMIN ---------------- */

// GET /api/products-admin
app.get("/api/products-admin", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, base_price, sizes, flavors, addons, enabled,
              (image IS NOT NULL) AS has_image
         FROM products
         ORDER BY id DESC`
    );

    const items = rows.map((r) => ({
      id: r.id,
      name: r.name,
      base_price: r.base_price,
      sizes: r.sizes ? JSON.parse(r.sizes) : [],
      flavors: r.flavors ? JSON.parse(r.flavors) : [],
      addons: r.addons ? JSON.parse(r.addons) : [],
      enabled: !!r.enabled,
      image: r.has_image ? `/api/products/${r.id}/image` : null,
    }));

    res.json({ items });
  } catch (e) {
    console.error("GET /api/products-admin error:", e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/products-admin
app.post("/api/products-admin", async (req, res) => {
  try {
    const { name, base_price, sizes, flavors, addons } = req.body || {};

    if (!name || !base_price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, base_price, sizes, flavors, addons, enabled)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        name,
        base_price,
        JSON.stringify(sizes || []),
        JSON.stringify(flavors || []),
        JSON.stringify(addons || []),
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (e) {
    console.error("POST /api/products-admin error:", e);
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/products-admin/:id
app.put("/api/products-admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, base_price, sizes, flavors, addons } = req.body;

    await pool.query(
      `UPDATE products
       SET name=?, base_price=?, sizes=?, flavors=?, addons=?
       WHERE id=?`,
      [
        name,
        base_price,
        JSON.stringify(sizes || []),
        JSON.stringify(flavors || []),
        JSON.stringify(addons || []),
        id,
      ]
    );

    res.json({ success: true });
  } catch (e) {
    console.error("PUT /api/products-admin/:id error:", e);
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/products-admin/:id
app.delete("/api/products-admin/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM products WHERE id=?`, [id]);
    res.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/products-admin/:id error:", e);
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/products-admin/:id/status
app.put("/api/products-admin/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    await pool.query(`UPDATE products SET enabled=? WHERE id=?`, [
      enabled ? 1 : 0,
      id,
    ]);
    res.json({ success: true });
  } catch (e) {
    console.error("PUT /api/products-admin/:id/status error:", e);
    res.status(500).json({ error: e.message });
  }
});

// GET product image
app.get("/api/products/:id/image", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT image, image_mime FROM products WHERE id=? LIMIT 1",
      [id]
    );
    if (!rows.length || !rows[0].image) return res.status(404).send("No image");
    res.set("Content-Type", rows[0].image_mime || "image/jpeg");
    res.send(rows[0].image);
  } catch (e) {
    console.error("GET /api/products/:id/image error:", e);
    res.status(500).json({ error: e.message });
  }
});

/* ------------ PRODUCTS: Public (read-only) ------------ */

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const { q = '', category = '', page = 1, pageSize = 24 } = req.query;
    const limit = Math.min(Math.max(parseInt(pageSize, 10) || 24, 1), 100);
    const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * limit;

    const filters = ['(is_active = 1 OR enabled = 1 OR enabled IS NULL)'];
    const params = [];

    if (q) {
      filters.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      filters.push('(category = ? OR category IS NULL)');
      params.push(category);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT
         id,
         name,
         description,
         category,
         price,
         base_price,
         options,
         sizes,
         flavors,
         addons,
         (image IS NOT NULL) AS has_image,
         image_mime,
         created_at,
         updated_at
       FROM products
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const items = rows.map(r => {
      const effectivePrice = r.price != null ? Number(r.price) : Number(r.base_price ?? 0);
      const options = r.options
        ? JSON.parse(r.options)
        : {
            sizes: r.sizes ? JSON.parse(r.sizes) : [],
            flavors: r.flavors ? JSON.parse(r.flavors) : [],
            addons: r.addons ? JSON.parse(r.addons) : [],
          };

      return {
        id: r.id,
        name: r.name,
        description: r.description || '',
        category: r.category || '',
        price: effectivePrice,
        options,
        image_url: r.has_image ? `/api/products/${r.id}/image` : null,
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    });

    res.json({ page: Number(page), pageSize: limit, items });
  } catch (e) {
    console.error('GET /api/products error:', e);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT
         id, name, description, category,
         price, base_price,
         options, sizes, flavors, addons,
         (image IS NOT NULL) AS has_image, image_mime,
         created_at, updated_at
       FROM products
       WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });

    const p = rows[0];
    const effectivePrice = p.price != null ? Number(p.price) : Number(p.base_price ?? 0);
    const options = p.options
      ? JSON.parse(p.options)
      : {
          sizes: p.sizes ? JSON.parse(p.sizes) : [],
          flavors: p.flavors ? JSON.parse(p.flavors) : [],
          addons: p.addons ? JSON.parse(p.addons) : [],
        };

    res.json({
      id: p.id,
      name: p.name,
      description: p.description || '',
      category: p.category || '',
      price: effectivePrice,
      options,
      image_url: p.has_image ? `/api/products/${p.id}/image` : null,
      created_at: p.created_at,
      updated_at: p.updated_at,
    });
  } catch (e) {
    console.error('GET /api/products/:id error:', e);
    res.status(500).json({ message: 'Failed to load product' });
  }
});






// ---------- FLAVORS ----------
app.get("/api/flavors", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM flavors ORDER BY id DESC");
    res.json({ items: rows });
  } catch (err) {
    console.error("GET /api/flavors error:", err);
    res.status(500).json({ error: "Failed to fetch flavors" });
  }
});

app.post("/api/flavors", async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: "Name is required" });
    const [result] = await pool.query("INSERT INTO flavors (name) VALUES (?)", [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    console.error("POST /api/flavors error:", err);
    res.status(500).json({ error: err.sqlMessage || "Failed to add flavor" });
  }
});

app.delete("/api/flavors/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM flavors WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/flavors/:id error:", err);
    res.status(500).json({ error: "Failed to delete flavor" });
  }
});

// ---------- ADDONS ----------
app.get("/api/addons", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, description FROM addons ORDER BY id DESC"
    );
    res.json({ items: rows });
  } catch (err) {
    console.error("GET /api/addons error:", err);
    res.status(500).json({ error: "Failed to fetch addons" });
  }
});

app.post("/api/addons", async (req, res) => {
  try {
    const { title, description } = req.body || {};
    if (!title) return res.status(400).json({ error: "Title is required" });
    const [result] = await pool.query(
      "INSERT INTO addons (title, description) VALUES (?, ?)",
      [title, description || ""]
    );
    res.status(201).json({ id: result.insertId, title, description: description || "" });
  } catch (err) {
    console.error("POST /api/addons error:", err);
    res.status(500).json({ error: err.sqlMessage || "Failed to add addon" });
  }
});

app.delete("/api/addons/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM addons WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/addons/:id error:", err);
    res.status(500).json({ error: "Failed to delete addon" });
  }
});
