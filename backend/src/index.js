import express from 'express';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'RevNova API is running!',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
});
export default app;
//# sourceMappingURL=index.js.map