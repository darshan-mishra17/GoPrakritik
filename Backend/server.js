import express from 'express';
import connectDB from './db/connection.js';  
import dotenv from 'dotenv';

import productRoutes from './Router/productRouter.js';

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);


const PORT = process.env.PORT || 5001;

// Connect to DB first, then start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed', err);
});