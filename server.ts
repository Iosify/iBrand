import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("ibrand.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    identity_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/drafts", (req, res) => {
    const drafts = db.prepare("SELECT * FROM drafts ORDER BY created_at DESC LIMIT 10").all();
    res.json(drafts.map(d => ({
      ...d,
      identity: JSON.parse(d.identity_json)
    })));
  });

  app.post("/api/drafts", (req, res) => {
    const { name, description, logo_url, identity } = req.body;
    const info = db.prepare(
      "INSERT INTO drafts (name, description, logo_url, identity_json) VALUES (?, ?, ?, ?)"
    ).run(name, description, logo_url, JSON.stringify(identity));
    res.json({ id: info.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
