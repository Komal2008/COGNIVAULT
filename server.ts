import express from "express";
import { createServer } from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./server/app.js";

const PORT = 3000;

async function startServer() {
  const httpServer = createServer(app);

  // Vite middleware in dev; static file serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Cognivault server running on http://localhost:${PORT}`);
  });
}

startServer();
