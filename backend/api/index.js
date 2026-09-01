import app from '../app.js';
import connectDB from '../config/database.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error in serverless execution.',
    });
  }
}
