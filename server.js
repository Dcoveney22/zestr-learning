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

// POST /api/auth/redeem — validate access code, create or update account
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
      SELECT v.*, e.name AS experience_name, e.delivery_type,
             e.duration_days, e.slug AS experience_slug
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

    const durationDays = voucher.duration_days || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Check if user already exists
    const [existing] = await sql`
      SELECT id, email FROM learning_users
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    let user;

    if (existing) {
      // User exists — verify password before adding bundle
      const passwordHash = await hashPassword(password);
      const [verified] = await sql`
        SELECT id FROM learning_users
        WHERE email = ${email.toLowerCase()}
        AND password_hash = ${passwordHash}
        LIMIT 1
      `;
      if (!verified) {
        return res.status(401).json({
          error:
            "An account with this email already exists. Please enter your existing password to add this bundle.",
          existingAccount: true,
        });
      }
      user = existing;
    } else {
      // New user — create account
      const passwordHash = await hashPassword(password);
      const [created] = await sql`
        INSERT INTO learning_users (email, password_hash, voucher_code, experience_slug, expires_at, marketing_opt_in)
        VALUES (${email.toLowerCase()}, ${passwordHash}, ${voucher.code}, ${voucher.experience_slug}, ${expiresAt.toISOString()}, true)
        RETURNING id, email, created_at
      `;
      user = created;
    }

    // Add bundle to learning_bundles
    const [bundle] = await sql`
      INSERT INTO learning_bundles (user_id, voucher_code, experience_slug, expires_at)
      VALUES (${user.id}, ${voucher.code}, ${voucher.experience_slug}, ${expiresAt.toISOString()})
      ON CONFLICT (voucher_code) DO NOTHING
      RETURNING *
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
      },
      bundle: {
        experience_name: voucher.experience_name,
        experience_slug: voucher.experience_slug,
        duration_days: durationDays,
        expires_at: expiresAt,
      },
    });
  } catch (err) {
    console.error("❌ redeem error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const passwordHash = await hashPassword(password);

    const [user] = await sql`
      SELECT id, email FROM learning_users
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
      user: { id: user.id, email: user.email },
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
      SELECT id, email, created_at FROM learning_users
      WHERE id = ${req.user.userId} LIMIT 1
    `;
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// BUNDLES
// ============================================================

// GET /api/bundles — get all bundles for the logged in user
app.get("/api/bundles", authMiddleware, async (req, res) => {
  try {
    const bundles = await sql`
      SELECT lb.id, lb.voucher_code, lb.experience_slug, lb.expires_at, lb.created_at,
             e.name AS experience_name
      FROM learning_bundles lb
      JOIN experiences e ON e.slug = lb.experience_slug
      WHERE lb.user_id = ${req.user.userId}
      ORDER BY lb.created_at DESC
    `;

    const now = new Date();
    const enriched = bundles.map((b) => {
      const expires = new Date(b.expires_at);
      const isExpired = now > expires;
      const daysRemaining = Math.max(
        0,
        Math.ceil((expires - now) / (1000 * 60 * 60 * 24)),
      );
      return { ...b, is_expired: isExpired, days_remaining: daysRemaining };
    });

    res.json(enriched);
  } catch (err) {
    console.error("❌ bundles error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bundle/:bundleId — get single bundle with progress
app.get("/api/bundle/:bundleId", authMiddleware, async (req, res) => {
  try {
    const [bundle] = await sql`
      SELECT lb.*, e.name AS experience_name, e.full_description
      FROM learning_bundles lb
      JOIN experiences e ON e.slug = lb.experience_slug
      WHERE lb.id = ${req.params.bundleId}
        AND lb.user_id = ${req.user.userId}
      LIMIT 1
    `;

    if (!bundle) return res.status(404).json({ error: "Bundle not found" });

    const now = new Date();
    const expires = new Date(bundle.expires_at);
    const isExpired = now > expires;
    const daysRemaining = Math.max(
      0,
      Math.ceil((expires - now) / (1000 * 60 * 60 * 24)),
    );

    const progress = await sql`
      SELECT episode_slug, listened_at FROM learning_progress
      WHERE bundle_id = ${bundle.id}
    `;

    res.json({
      bundle: {
        ...bundle,
        is_expired: isExpired,
        days_remaining: daysRemaining,
      },
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

app.post("/api/progress", authMiddleware, async (req, res) => {
  try {
    const { episodeSlug, bundleId } = req.body;
    if (!episodeSlug || !bundleId) {
      return res
        .status(400)
        .json({ error: "episodeSlug and bundleId required" });
    }

    // Verify bundle belongs to user
    const [bundle] = await sql`
      SELECT id FROM learning_bundles
      WHERE id = ${bundleId} AND user_id = ${req.user.userId}
      LIMIT 1
    `;
    if (!bundle) return res.status(403).json({ error: "Not authorised" });

    await sql`
      INSERT INTO learning_progress (user_id, bundle_id, episode_slug)
      VALUES (${req.user.userId}, ${bundleId}, ${episodeSlug})
      ON CONFLICT (user_id, episode_slug) DO NOTHING
    `;

    res.json({ success: true });
  } catch (err) {
    console.error("❌ progress error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bundles/add — add a new bundle to existing account
app.post("/api/bundles/add", authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code required" });

    // Look up the voucher
    const [voucher] = await sql`
      SELECT v.*, e.name AS experience_name, e.delivery_type,
             e.duration_days, e.slug AS experience_slug
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

    // Check this user doesn't already have this bundle
    const [existing] = await sql`
      SELECT id FROM learning_bundles
      WHERE user_id = ${req.user.userId}
        AND experience_slug = ${voucher.experience_slug}
      LIMIT 1
    `;
    if (existing) {
      return res
        .status(409)
        .json({ error: "You already have access to this bundle" });
    }

    const durationDays = voucher.duration_days || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Add bundle
    const [bundle] = await sql`
      INSERT INTO learning_bundles (user_id, voucher_code, experience_slug, expires_at)
      VALUES (${req.user.userId}, ${voucher.code}, ${voucher.experience_slug}, ${expiresAt.toISOString()})
      RETURNING *
    `;

    // Mark voucher as used
    await sql`
      UPDATE vouchers SET status = 'used', used_at = NOW()
      WHERE code = ${voucher.code}
    `;

    res.json({
      success: true,
      bundle: {
        id: bundle.id,
        experience_name: voucher.experience_name,
        experience_slug: voucher.experience_slug,
        expires_at: expiresAt,
        duration_days: durationDays,
      },
    });
  } catch (err) {
    console.error("❌ add bundle error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// STATIC + HEALTH
// ============================================================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "zestr-learning" });
});

app.use(express.static(path.join(__dirname, "client/dist")));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () =>
  console.log(`🎧 Learning server running on port ${PORT}`),
);
