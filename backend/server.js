// backend/server.js — full API (CommonJS, Express 5 safe)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

/* ---------------- Auth helpers ---------------- */
function signToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(m[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/* ---------------- Basic health routes ---------------- */
app.get('/', (_req, res) => res.json({ message: 'SweetTreats backend is alive!' }));

app.get('/health', (_req, res) => res.json({ ok: true, time: Date.now() }));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: Date.now() }));


// DB health: confirms DB + admins table
app.get('/health/db', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM admins');
    res.json({ ok: true, admins: rows[0].count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* ---------------- AUTH ---------------- */

// (Optional) seed/register an admin (use once to create the first admin)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body || {};
    if (!name || !email || !password || password.length < 6) {
      return res.status(422).json({ error: 'Invalid input' });
    }
    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role]
    );
    res.status(201).json({ success: true });
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN -> returns { success, token, user }
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(422).json({ error: 'Invalid input' });

    const [rows] = await pool.execute(
      'SELECT id, name, email, role, password_hash FROM admins WHERE email = ?',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------- ADMINS (protected) ---------------- */

// current user info
app.get('/api/admins/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM admins WHERE id = ?',
      [req.user.sub]
    );
    res.json(rows[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// list admins
app.get('/api/admins', requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM admins ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// create admin
app.post('/api/admins', requireAuth, async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body || {};
    if (!name || !email || !password) return res.status(422).json({ error: 'Invalid input' });

    const [exists] = await pool.execute('SELECT id FROM admins WHERE email = ?', [email]);
    if (exists.length) return res.status(409).json({ error: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role]
    );
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---------------- Start server ---------------- */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});
