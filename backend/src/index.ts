// backend/src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import analyzeRoutes from "./routes/analyze.routes";
import db from "./database/db";

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------
// 🧩 Global Middleware
// ----------------------------------------------------
app.use(cors());
app.use(express.json());

// Make DB available everywhere
app.locals.db = db;

// Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] ${duration}ms`);
  });
  next();
});

// ----------------------------------------------------
// 🧠 Health Check
// ----------------------------------------------------
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "RevNova API is running!",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});

// ----------------------------------------------------
// 📊 Mount API Routes
// ----------------------------------------------------
app.use("/api/v1", analyzeRoutes);

// ----------------------------------------------------
// ❌ NOT FOUND Handler
// ----------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler (no ESLint unused-variable warnings)
app.use((err: any, _req: Request, res: Response) => {
  console.error('❌ Global error handler:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// ----------------------------------------------------
// 🚀 START SERVER ONLY OUTSIDE JEST
// ----------------------------------------------------
let server: any = null;

if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`📊 Analyze Endpoint: POST http://localhost:${PORT}/api/v1/projects/:id/analyze`);
  });
}

export { app, server };
export default app;
