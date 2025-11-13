// backend/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import analyzeRoutes from './routes/analyze.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------------------------
// 🧩 Global Middleware
// -----------------------------------------------
app.use(cors());
app.use(express.json());

// 📌 Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} [${res.statusCode}] ${duration}ms`);
  });
  next();
});

// -----------------------------------------------
// 🧠 Health Check
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
// 📊 Mount Main API Routes
// -----------------------------------------------
app.use('/api/v1', analyzeRoutes);

// -----------------------------------------------
// ⚠️ Global Error Handler
// -----------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Global error handler:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// -----------------------------------------------
// ❌ Handle Unknown Routes
// -----------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// -----------------------------------------------
// 🚀 Start Server
// -----------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`📊 Analyze Endpoint: POST http://localhost:${PORT}/api/v1/projects/:id/analyze`);
});

export default app;
