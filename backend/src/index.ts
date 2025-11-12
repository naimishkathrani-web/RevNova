import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import analyzeRoutes from './routes/analyze.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'RevNova API is running!',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Routes
app.use('/api/v1', analyzeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`📊 Analyze endpoint: POST http://localhost:${PORT}/api/v1/projects/:id/analyze`);
});

export default app;
