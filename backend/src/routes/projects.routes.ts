import express from 'express';

const router = express.Router();

router.get('/projects', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM projects ORDER BY id');

    return res.json({
      status: 'success',
      data: result.rows
    });

  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

console.log(">>> Router registered routes:", router.stack);

export default router;
