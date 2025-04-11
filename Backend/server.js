import express from 'express';  // Remove the '.js' extension
import connectDB from './db/connection.js';  // Add .js extension for local files
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Connect to DB first, then start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed', err);
});