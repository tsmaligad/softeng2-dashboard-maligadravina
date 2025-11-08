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

// ✅ ADD THIS DIRECTLY AFTER CORS AND JSON:
const fs = require('fs');
const path = require('path');

// Serve uploaded hero images
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR));

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

/* ---------------- HOMEPAGE CONFIG ---------------- */

async function loadHomepageConfig() {
  try {
    const [rows] = await pool.query(
      `SELECT hero_url, hero_urls, featured_product_ids, faq_ids
       FROM homepage_config
       WHERE id = 1
       LIMIT 1`
    );
    if (!rows.length) {
      return { hero_url: null, hero_urls: [], featured_product_ids: [], faq_ids: [] };
    }
    const r = rows[0];
    return {
      hero_url: r.hero_url || null,
      hero_urls: r.hero_urls ? JSON.parse(r.hero_urls) : [],   // ✅ new
      featured_product_ids: r.featured_product_ids ? JSON.parse(r.featured_product_ids) : [],
      faq_ids: r.faq_ids ? JSON.parse(r.faq_ids) : [],
    };
  } catch (e) {
    console.warn('[homepage_config] load warning:', e.message);
    return { hero_url: null, hero_urls: [], featured_product_ids: [], faq_ids: [] };
  }
}


async function saveHomepageConfig({ hero_url = null, hero_urls = [], featured_product_ids = [], faq_ids = [] }) {
  const [exists] = await pool.query(`SELECT id FROM homepage_config WHERE id = 1 LIMIT 1`);
  if (exists.length) {
    await pool.query(
      `UPDATE homepage_config
       SET hero_url=?, hero_urls=?, featured_product_ids=?, faq_ids=?
       WHERE id=1`,
      [
        hero_url,
        JSON.stringify(hero_urls),
        JSON.stringify(featured_product_ids),
        JSON.stringify(faq_ids)
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO homepage_config (id, hero_url, hero_urls, featured_product_ids, faq_ids)
       VALUES (1, ?, ?, ?, ?)`,
      [
        hero_url,
        JSON.stringify(hero_urls),
        JSON.stringify(featured_product_ids),
        JSON.stringify(faq_ids)
      ]
    );
  }
}


// Public: read homepage config
app.get('/homepage', async (_req, res) => {
  try {
    const conf = await loadHomepageConfig(); // should return { hero_url, hero_urls, featured_product_ids, faq_ids }
    res.json({
      hero_url: conf.hero_url,
      hero_urls: conf.hero_urls,              // ✅ include the array for carousel
      featured_product_ids: conf.featured_product_ids,
      faq_ids: conf.faq_ids,
    });
  } catch (e) {
    console.error('GET /homepage error:', e);
    res.status(500).json({ error: 'Failed to load homepage' });
  }
});


// Admin only: update featured products + faqs
app.put('/homepage', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { featured_product_ids = [], faq_ids = [] } = req.body || {};
    const current = await loadHomepageConfig();
    await saveHomepageConfig({ featured_product_ids, faq_ids, hero_url: current.hero_url });
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /homepage error:', e);
    res.status(500).json({ error: 'Failed to save homepage' });
  }
});

// Admin only: upload hero image
app.post('/homepage/hero', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const ext = (req.file.mimetype && req.file.mimetype.split('/')[1]) || 'bin';
    const filename = `hero_${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filepath, req.file.buffer);
    const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    const current = await loadHomepageConfig();
    await saveHomepageConfig({
      featured_product_ids: current.featured_product_ids,
      faq_ids: current.faq_ids,
      hero_url: url,
    });
    res.json({ success: true, url });
  } catch (e) {
    console.error('POST /homepage/hero error:', e);
    res.status(500).json({ success: false, error: 'Failed to upload hero image' });
  }
});

// CLEAR single hero (your editor calls this but route doesn't exist yet)
app.delete('/homepage/hero', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const current = await loadHomepageConfig();
    await saveHomepageConfig({
      hero_url: null,
      hero_urls: current.hero_urls,
      featured_product_ids: current.featured_product_ids,
      faq_ids: current.faq_ids,
    });
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /homepage/hero error:', e);
    res.status(500).json({ success: false, error: 'Failed to clear hero image' });
  }
});

// MULTI upload → append to hero_urls
app.post('/homepage/heroes', requireAuth, requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, error: 'No files uploaded' });

    const urls = [];
    for (const f of req.files) {
      const ext = (f.mimetype && f.mimetype.split('/')[1]) || 'bin';
      const filename = `hero_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const filepath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filepath, f.buffer);
      urls.push(`${req.protocol}://${req.get('host')}/uploads/${filename}`);
    }

    const current = await loadHomepageConfig();
    const merged = [...(current.hero_urls || []), ...urls];

    await saveHomepageConfig({
      hero_url: current.hero_url,                 // keep single hero if you still want it
      hero_urls: merged,
      featured_product_ids: current.featured_product_ids,
      faq_ids: current.faq_ids,
    });

    res.json({ success: true, hero_urls: merged });
  } catch (e) {
    console.error('POST /homepage/heroes error:', e);
    res.status(500).json({ success: false, error: 'Failed to upload hero images' });
  }
});

// Replace the whole hero_urls array
app.put('/homepage/heroes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { hero_urls = [] } = req.body || {};
    const current = await loadHomepageConfig();
    await saveHomepageConfig({
      hero_url: current.hero_url,
      hero_urls: Array.isArray(hero_urls) ? hero_urls : [],
      featured_product_ids: current.featured_product_ids,
      faq_ids: current.faq_ids,
    });
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /homepage/heroes error:', e);
    res.status(500).json({ success: false, error: 'Failed to save hero URLs' });
  }
});

// DELETE /homepage/heroes/:index → remove one image by array index
app.delete('/homepage/heroes/:index', requireAuth, requireAdmin, async (req, res) => {
  try {
    const idx = Number(req.params.index);
    const current = await loadHomepageConfig();
    const arr = Array.isArray(current.hero_urls) ? [...current.hero_urls] : [];
    if (Number.isNaN(idx) || idx < 0 || idx >= arr.length) {
      return res.status(400).json({ success: false, error: 'Invalid index' });
    }
    arr.splice(idx, 1);
    await saveHomepageConfig({
      hero_url: current.hero_url,
      hero_urls: arr,
      featured_product_ids: current.featured_product_ids,
      faq_ids: current.faq_ids,
    });
    res.json({ success: true, hero_urls: arr });
  } catch (e) {
    console.error('DELETE /homepage/heroes/:index error:', e);
    res.status(500).json({ success: false, error: 'Failed to delete hero image' });
  }
});


// ---------- FAQs ADMIN (CRUD) ----------
// ---------- FAQs: public (read-only) ----------
// ---------- PUBLIC FAQS ----------
app.get('/api/faqs', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, q, a, COALESCE(sort_order, 0) AS sort_order
      FROM faqs
      WHERE enabled = 1
      ORDER BY COALESCE(sort_order, 0), id
    `);
    res.json({ items: rows });
  } catch (e) {
    console.error('GET /api/faqs error:', e);
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});

app.get('/api/faqs-admin', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, q, a, enabled, COALESCE(sort_order,0) AS sort_order
      FROM faqs
      ORDER BY COALESCE(sort_order,0), id
    `);
    res.json({ items: rows });
  } catch (e) {
    console.error('GET /api/faqs-admin error:', e);
    res.status(500).json({ error: 'Failed to load FAQs' });
  }
});




app.post('/api/faqs-admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { q, a, enabled = 1, sort_order = 0 } = req.body || {};
    if (!q || !a) return res.status(400).json({ error: 'q and a are required' });

    const [result] = await pool.query(
      `INSERT INTO faqs (q, a, enabled, sort_order) VALUES (?, ?, ?, ?)`,
      [q, a, Number(enabled) ? 1 : 0, Number(sort_order) || 0]
    );

    res.status(201).json({ id: result.insertId, q, a, enabled: !!enabled, sort_order: Number(sort_order) || 0 });
  } catch (e) {
    console.error('POST /api/faqs-admin error:', e);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

app.put('/api/faqs-admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { q, a, enabled, sort_order } = req.body || {};

    const fields = [];
    const vals = [];

    if (q != null)        { fields.push('q = ?');          vals.push(q); }
    if (a != null)        { fields.push('a = ?');          vals.push(a); }
    if (enabled != null)  { fields.push('enabled = ?');    vals.push(enabled ? 1 : 0); }
    if (sort_order != null) { fields.push('sort_order = ?'); vals.push(Number(sort_order) || 0); }

    if (!fields.length) return res.status(400).json({ error: 'No changes' });

    vals.push(id);
    await pool.query(`UPDATE faqs SET ${fields.join(', ')} WHERE id = ?`, vals);

    res.json({ success: true });
  } catch (e) {
    console.error('PUT /api/faqs-admin/:id error:', e);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});




app.delete('/api/faqs-admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM faqs WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/faqs-admin/:id error:', e);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});





// Create FAQ
// Create FAQ (legacy path but now consistent)
app.post('/faqs-admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { q, a, is_active = 1, sort_order = 0 } = req.body || {};
    if (!q || !a) return res.status(400).json({ error: 'q and a are required' });

    const enabled = Number(is_active) ? 1 : 0; // map is_active -> enabled

    const [result] = await pool.query(
      `INSERT INTO faqs (q, a, enabled, sort_order) VALUES (?, ?, ?, ?)`,
      [q, a, enabled, Number(sort_order) || 0]
    );
    res.status(201).json({ id: result.insertId, q, a, enabled: !!enabled, sort_order: Number(sort_order) || 0 });
  } catch (e) {
    console.error('POST /faqs-admin error:', e);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

app.put('/faqs-admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { q, a, is_active, sort_order } = req.body || {};

    const fields = [];
    const vals = [];
    if (q != null) { fields.push('q = ?'); vals.push(q); }
    if (a != null) { fields.push('a = ?'); vals.push(a); }
    if (is_active != null) { fields.push('enabled = ?'); vals.push(Number(is_active) ? 1 : 0); }
    if (sort_order != null) { fields.push('sort_order = ?'); vals.push(Number(sort_order) || 0); }

    if (!fields.length) return res.status(400).json({ error: 'No changes' });
    vals.push(id);
    await pool.query(`UPDATE faqs SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /faqs-admin/:id error:', e);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});


// Delete FAQ
app.delete('/faqs-admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM faqs WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /faqs-admin/:id error:', e);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Bulk reorder (drag & drop)
app.patch('/faqs-admin/reorder', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: 'ids[] required' });
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (let i = 0; i < ids.length; i++) {
        await conn.query('UPDATE faqs SET sort_order = ? WHERE id = ?', [i, ids[i]]);
      }
      await conn.commit();
      res.json({ success: true });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error('PATCH /faqs-admin/reorder error:', e);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

/* ----------------------ABOUT US --------------------*/
async function loadAbout() {
  const [[pageRows], [imgRows]] = await Promise.all([
    pool.query(`SELECT heading, body FROM about_page WHERE id = 1 LIMIT 1`),
    pool.query(`
      SELECT id, url, title, position, sort_order
      FROM about_images
      WHERE enabled = 1
      ORDER BY sort_order, id
    `)
  ]);
  const page = pageRows[0] || { heading: 'About Us', body: '' };
  return { heading: page.heading || 'About Us', body: page.body || '', images: imgRows || [] };
}

async function loadAboutAdmin() {
  const [[pageRows], [imgRows]] = await Promise.all([
    pool.query(`SELECT heading, body FROM about_page WHERE id = 1 LIMIT 1`),
    pool.query(`
      SELECT id, url, title, position, sort_order, enabled
      FROM about_images
      ORDER BY sort_order, id
    `)
  ]);
  const page = pageRows[0] || { heading: 'About Us', body: '' };
  return { heading: page.heading || 'About Us', body: page.body || '', images: imgRows || [] };
}

async function saveAbout({ heading, body }) {
  const [exists] = await pool.query(`SELECT id FROM about_page WHERE id = 1 LIMIT 1`);
  if (exists.length) {
    await pool.query(`UPDATE about_page SET heading=?, body=? WHERE id=1`, [heading || '', body || '']);
  } else {
    await pool.query(`INSERT INTO about_page (id, heading, body) VALUES (1, ?, ?)`, [heading || '', body || '']);
  }
}
// ----------- ABOUT: Public -----------
app.get('/api/about', async (_req, res) => {
  try {
    const data = await loadAbout();
    res.json(data); // {heading, body, images:[...]}
  } catch (e) {
    console.error('GET /api/about error:', e);
    res.status(500).json({ error: 'Failed to load About page' });
  }
});

// ----------- ABOUT: Admin -----------
app.get('/api/about-admin', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const data = await loadAboutAdmin();
    res.json(data);
  } catch (e) {
    console.error('GET /api/about-admin error:', e);
    res.status(500).json({ error: 'Failed to load About admin' });
  }
});

app.put('/api/about-admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { heading = '', body = '' } = req.body || {};
    await saveAbout({ heading, body });
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /api/about-admin error:', e);
    res.status(500).json({ error: 'Failed to save About text' });
  }
});

// Upload image (optional – to store files on server)
app.post('/api/about-images-admin/upload', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const ext = (req.file.mimetype && req.file.mimetype.split('/')[1]) || 'bin';
    const filename = `about_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer);
    const url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    res.json({ success: true, url });
  } catch (e) {
    console.error('POST /api/about-images-admin/upload error:', e);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Create image
app.post('/api/about-images-admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { url, title = '', position = 'center', enabled = 1 } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url required' });
    // next sort_order
    const [maxRow] = await pool.query(`SELECT COALESCE(MAX(sort_order), -1) AS m FROM about_images`);
    const nextOrder = Number(maxRow[0].m) + 1;
    const [ins] = await pool.query(
      `INSERT INTO about_images (url, title, position, sort_order, enabled) VALUES (?, ?, ?, ?, ?)`,
      [url, title, position, nextOrder, enabled ? 1 : 0]
    );
    res.status(201).json({ id: ins.insertId });
  } catch (e) {
    console.error('POST /api/about-images-admin error:', e);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Update image (dynamic fields)
app.put('/api/about-images-admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { url, title, position, enabled, sort_order } = req.body || {};
    const fields = [], vals = [];
    if (url != null)       { fields.push('url=?');        vals.push(url); }
    if (title != null)     { fields.push('title=?');      vals.push(title); }
    if (position != null)  { fields.push('position=?');   vals.push(position); }
    if (enabled != null)   { fields.push('enabled=?');    vals.push(enabled ? 1 : 0); }
    if (sort_order != null){ fields.push('sort_order=?'); vals.push(Number(sort_order)||0); }

    if (!fields.length) return res.status(400).json({ error: 'No changes' });
    vals.push(id);
    await pool.query(`UPDATE about_images SET ${fields.join(', ')} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (e) {
    console.error('PUT /api/about-images-admin/:id error:', e);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete image
app.delete('/api/about-images-admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM about_images WHERE id=?`, [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/about-images-admin/:id error:', e);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Reorder images in bulk
app.patch('/api/about-images-admin/reorder', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ error: 'ids[] required' });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (let i = 0; i < ids.length; i++) {
        await conn.query('UPDATE about_images SET sort_order=? WHERE id=?', [i, ids[i]]);
      }
      await conn.commit();
      res.json({ success: true });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error('PATCH /api/about-images-admin/reorder error:', e);
    res.status(500).json({ error: 'Failed to save order' });
  }
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






/* ---------------- CART (auth users) ---------------- */

// helper: get or create user cart
async function getOrCreateCartId(userId) {
  const [rows] = await pool.query(
    `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  if (rows.length) return rows[0].id;
  const [ins] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return ins.insertId;
}


// GET /api/cart → current user's cart with product info
app.get('/api/cart', requireAuth, async (req, res) => {
  try {
    const cartId = await getOrCreateCartId(req.user.userId);
    const [rows] = await pool.query(`
      SELECT ci.id, ci.product_id, ci.qty, ci.unit_price, ci.notes,
             p.name, (p.image IS NOT NULL) AS has_image
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.id DESC
    `, [cartId]);

    const items = rows.map(r => ({
      id: r.id,
      product_id: r.product_id,
      name: r.name,
      qty: r.qty,
      unit_price: Number(r.unit_price),
      notes: r.notes || "",
      image_url: r.has_image ? `/api/products/${r.product_id}/image` : null,
      subtotal: Number(r.unit_price) * r.qty
    }));

    const total = items.reduce((t, it) => t + it.subtotal, 0);
    res.json({ items, total });
  } catch (e) {
    console.error('GET /api/cart error', e);
    res.status(500).json({ error: 'Failed to load cart' });
  }
});

// POST /api/cart/items → add item
app.post('/api/cart/items', requireAuth, async (req, res) => {
  try {
    const { product_id, qty = 1, unit_price = 0, notes = "" } = req.body || {};
    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    const cartId = await getOrCreateCartId(req.user.userId);

    // If same product+notes exists, just bump qty (simple consolidation)
    const [exist] = await pool.query(
      'SELECT id, qty FROM cart_items WHERE cart_id=? AND product_id=? AND (notes <=> ?)',
      [cartId, product_id, notes || null]
    );
    if (exist.length) {
      const row = exist[0];
      await pool.query('UPDATE cart_items SET qty = qty + ? WHERE id=?', [Number(qty) || 1, row.id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, qty, unit_price, notes) VALUES (?, ?, ?, ?, ?)',
        [cartId, product_id, Number(qty) || 1, Number(unit_price) || 0, notes || null]
      );
    }
    res.json({ success: true });
  } catch (e) {
    console.error('POST /api/cart/items error', e);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PATCH /api/cart/items/:id → update qty or notes
app.patch('/api/cart/items/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { qty, notes } = req.body || {};
    const cartId = await getOrCreateCartId(req.user.userId);

    const fields = [];
    const vals = [];
    if (qty != null) { fields.push('qty=?'); vals.push(Math.max(1, Number(qty))); }
    if (notes != null) { fields.push('notes=?'); vals.push(notes || null); }
    if (!fields.length) return res.status(400).json({ error: 'No changes' });

    vals.push(cartId, id);
    await pool.query(`UPDATE cart_items SET ${fields.join(', ')} WHERE cart_id=? AND id=?`, vals);
    res.json({ success: true });
  } catch (e) {
    console.error('PATCH /api/cart/items/:id error', e);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/items/:id
app.delete('/api/cart/items/:id', requireAuth, async (req, res) => {
  try {
    const cartId = await getOrCreateCartId(req.user.userId);
    await pool.query('DELETE FROM cart_items WHERE cart_id=? AND id=?', [cartId, req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/cart/items/:id error', e);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// POST /api/cart/sync → merge local guest items into user cart (on login or visit)
app.post('/api/cart/sync', requireAuth, async (req, res) => {
  try {
    const { items = [] } = req.body || {};
    const cartId = await getOrCreateCartId(req.user.userId);

    for (const it of items) {
      const { product_id, qty = 1, unit_price = 0, notes = "" } = it || {};
      if (!product_id) continue;
      const [exist] = await pool.query(
        'SELECT id FROM cart_items WHERE cart_id=? AND product_id=? AND (notes <=> ?)',
        [cartId, product_id, notes || null]
      );
      if (exist.length) {
        await pool.query('UPDATE cart_items SET qty = qty + ? WHERE id=?', [Number(qty)||1, exist[0].id]);
      } else {
        await pool.query(
          'INSERT INTO cart_items (cart_id, product_id, qty, unit_price, notes) VALUES (?, ?, ?, ?, ?)',
          [cartId, product_id, Number(qty)||1, Number(unit_price)||0, notes || null]
        );
      }
    }

    res.json({ success: true });
  } catch (e) {
    console.error('POST /api/cart/sync error', e);
    res.status(500).json({ error: 'Failed to sync cart' });
  }
});





//para sa job order //
// Add these endpoints after your existing routes

// GET /api/orders - Get all orders
app.get('/api/orders', async (_req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.*, 
        GROUP_CONCAT(
          JSON_OBJECT(
            'id', i.id,
            'name', i.name,
            'qty', i.qty,
            'unit_price', i.unit_price
          )
        ) as items_json
      FROM orders o
      LEFT JOIN order_items i ON o.id = i.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    const result = orders.map(order => ({
      ...order,
      items: order.items_json ? JSON.parse(`[${order.items_json}]`) : []
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_name,
      email,
      phone,
      method,
      address,
      items,
      total,
      downpayment,
      payment_method
    } = req.body;

    // Start transaction
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      // Insert order
      const [orderResult] = await conn.query(
        `INSERT INTO orders (
          customer_name, email, phone, method, address,
          total, downpayment, payment_method
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer_name, email, phone, method, address, total, downpayment, payment_method]
      );

      // Insert order items
      for (const item of items) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, name, qty, unit_price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderResult.insertId, item.id, item.name, item.qty, item.unit_price]
        );
      }

      await conn.commit();
      res.status(201).json({ 
        success: true, 
        orderId: orderResult.insertId 
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('POST /api/orders error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.post('/homepage/heroes', requireAuth, requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, error: 'No files uploaded' });

    const urls = [];
    for (const f of req.files) {
      const ext = (f.mimetype && f.mimetype.split('/')[1]) || 'bin';
      const filename = `hero_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const filepath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filepath, f.buffer);
      urls.push(`${req.protocol}://${req.get('host')}/uploads/${filename}`);
    }

    const current = await loadHomepageConfig();
    const merged = [...(current.hero_urls || []), ...urls];

    await saveHomepageConfig({
      hero_url: current.hero_url,
      hero_urls: merged,
      featured_product_ids: current.featured_product_ids,
      faq_ids: current.faq_ids,
    });

    res.json({ success: true, hero_urls: merged }); // ← key fixed
  } catch (e) {
    console.error('POST /homepage/heroes error:', e);
    res.status(500).json({ success: false, error: 'Failed to upload hero images' });
  }
});


/* ---------------- Start server ---------------- */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});