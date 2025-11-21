//import fs from 'fs';
//console.log("Routes folder content:", fs.readdirSync('./src/routes'));

import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import cors from 'cors';

import analyzeRoutes from './routes/analyze.routes.js';
import projectsRouter from './routes/projects.routes.js';
import connectionsRouter from './routes/connections.routes.js';
import fieldMappingsRouter from './routes/field-mappings.routes.js';
import projectPhasesRouter from './routes/project-phases.routes.js';
import rcaConfigRouter from './routes/rca-config.routes.js';

import db from './database/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------------------
// Middleware
// -----------------------------------------------
app.use(cors());
app.use(express.json());
app.locals.db = db;

// Debug incoming path
app.use((req, res, next) => {
  console.log(">>> Incoming request path:", req.path, "url:", req.originalUrl);
  next();
});

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] ${duration}ms`);
  });
  next();
});

// -----------------------------------------------
// Health Check
// -----------------------------------------------
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'RevNova API is running!',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// -----------------------------------------------
// API ROUTES
// -----------------------------------------------
console.log(">>> Mounting Projects Router...");
app.use('/api/v1', projectsRouter);

console.log(">>> Mounting Connections Router...");
app.use('/api/v1', connectionsRouter);

console.log(">>> Mounting Field Mappings Router...");
app.use('/api/v1', fieldMappingsRouter);

console.log(">>> Mounting Analyze Router...");
app.use('/api/v1', analyzeRoutes);

console.log(">>> Mounting Project Phases Router...");
app.use('/api/v1', projectPhasesRouter);

console.log(">>> Mounting RCA Config Router...");
app.use('/api/v1', rcaConfigRouter);

// -----------------------------------------------
// TEST ROUTE MATCH (simulated request)
// -----------------------------------------------
console.log(">>> TEST ROUTE MATCH:");
console.log(
  "  GET /api/v1/projects =>",
  app._router?.handle(
    { method: 'GET', url: '/api/v1/projects' },
    { end: (msg: any) => console.log("  MATCH RESULT:", msg) },
    () => console.log("  NEXT() CALLED (no match)")
  )
);

// -----------------------------------------------
// Error Handler
// -----------------------------------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Global error handler:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// -----------------------------------------------
// 404 Handler
// -----------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// -----------------------------------------------
// Start Server
// -----------------------------------------------
app.listen(PORT, () => {
  console.log(">>> ACTUAL SERVER ADDRESS:", PORT);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`📊 Analyze Endpoint: POST http://localhost:${PORT}/api/v1/projects/:id/analyze`);
});

export default app;
