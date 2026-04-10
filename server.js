import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();
const sql = neon(process.env.DATABASE_URL);
const JWT_SECRET = process.env.JWT_SECRET || "zestr-learning-secret";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ============================================================
// HELPERS
// ============================================================

async function hashPassword(password) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password + JWT_SECRET),
  );
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function makeToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "90d",
  });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ============================================================
// AUTH ROUTES
// ============================================================

// POST /api/auth/redeem — validate access code + create account
app.post("/api/auth/redeem", async (req, res) => {
  try {
    const { code, email, password } = req.body;
    if (!code || !email || !password) {
      return res
        .status(400)
        .json({ error: "Code, email and password required" });
    }

    // Look up the voucher
    const [voucher] = await sql`
      SELECT v.*, e.name AS experience_name, e.delivery_type, e.duration_days,
             e.slug AS experience_slug
      FROM vouchers v
      JOIN experiences e ON e.id = v.experience_id
      WHERE v.code = ${code.toUpperCase().trim()}
        AND v.status = 'issued'
        AND e.delivery_type = 'digital_learning'
      LIMIT 1
    `;

    if (!voucher) {
      return res
        .status(404)
        .json({ error: "Access code not found or already used" });
    }

    // Check if email already has an account
    const [existing] = await sql`
      SELECT id FROM learning_users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;
    if (existing) {
      return res.status(409).json({
        error: "An account with this email already exists. Please log in.",
      });
    }

    // Calculate expiry from today
    const durationDays = voucher.duration_days || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const passwordHash = await hashPassword(password);

    // Create the learning user
    const [user] = await sql`
      INSERT INTO learning_users (email, password_hash, voucher_code, experience_slug, expires_at, marketing_opt_in)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${voucher.code}, ${voucher.experience_slug}, ${expiresAt.toISOString()}, true)
      RETURNING id, email, voucher_code, experience_slug, expires_at, created_at
    `;

    // Mark voucher as used
    await sql`
      UPDATE vouchers SET status = 'used', used_at = NOW()
      WHERE code = ${voucher.code}
    `;

    const token = makeToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        experience_slug: user.experience_slug,
        expires_at: user.expires_at,
      },
      voucher: {
        experience_name: voucher.experience_name,
        duration_days: durationDays,
        expires_at: expiresAt,
      },
    });
  } catch (err) {
    console.error("❌ redeem error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login — returning user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const passwordHash = await hashPassword(password);

    const [user] = await sql`
      SELECT id, email, voucher_code, experience_slug, expires_at
      FROM learning_users
      WHERE email = ${email.toLowerCase()} AND password_hash = ${passwordHash}
      LIMIT 1
    `;

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = makeToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        experience_slug: user.experience_slug,
        expires_at: user.expires_at,
      },
    });
  } catch (err) {
    console.error("❌ login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, email, voucher_code, experience_slug, expires_at, created_at
      FROM learning_users
      WHERE id = ${req.user.userId}
      LIMIT 1
    `;
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// BUNDLE CONTENT
// ============================================================

// GET /api/bundle — get the user's bundle and episodes
app.get("/api/bundle", authMiddleware, async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, email, voucher_code, experience_slug, expires_at
      FROM learning_users WHERE id = ${req.user.userId} LIMIT 1
    `;
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check access hasn't expired
    const now = new Date();
    const expires = new Date(user.expires_at);
    const isExpired = now > expires;
    const daysRemaining = Math.max(
      0,
      Math.ceil((expires - now) / (1000 * 60 * 60 * 24)),
    );

    // Get episodes for this bundle from content config
    const [experience] = await sql`
      SELECT e.id, e.name, e.slug, e.full_description, e.duration_days
      FROM experiences e
      WHERE e.slug = ${user.experience_slug}
      LIMIT 1
    `;

    // Get progress
    const progress = await sql`
      SELECT episode_slug, listened_at
      FROM learning_progress
      WHERE user_id = ${user.id}
    `;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        expires_at: user.expires_at,
        is_expired: isExpired,
        days_remaining: daysRemaining,
      },
      experience,
      progress: progress.map((p) => p.episode_slug),
    });
  } catch (err) {
    console.error("❌ bundle error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PROGRESS
// ============================================================

// POST /api/progress — mark episode as listened
app.post("/api/progress", authMiddleware, async (req, res) => {
  try {
    const { episodeSlug } = req.body;
    if (!episodeSlug)
      return res.status(400).json({ error: "episodeSlug required" });

    await sql`
      INSERT INTO learning_progress (user_id, episode_slug)
      VALUES (${req.user.userId}, ${episodeSlug})
      ON CONFLICT (user_id, episode_slug) DO NOTHING
    `;

    res.json({ success: true });
  } catch (err) {
    console.error("❌ progress error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "zestr-learning" });
});

// ============================================================
// STATIC FILES
// ============================================================

app.use(express.static(path.join(__dirname, "client/dist")));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

// ============================================================
// START
// ============================================================

const PORT = process.env.PORT || 3002;
app.listen(PORT, () =>
  console.log(`🎧 Learning server running on port ${PORT}`),
);
