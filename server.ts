import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createBackendApp } from "./src/backend/app";

dotenv.config();

const PORT = 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

async function startServer() {
  // Initialize backend Express application
  const app = createBackendApp();

  // Vite middleware for development vs static build serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Tourism AI] Express Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Admin Bootstrap] ROLE_ADMIN account ready: username='${ADMIN_USERNAME}'`);
  });
}

startServer();
