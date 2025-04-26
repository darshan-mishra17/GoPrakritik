import express from 'express';
import connectDB from './db/connection.js';  
import dotenv from 'dotenv';
import cors from 'cors';
import productRoutes from './Router/productRouter.js';
import userRoutes from './Router/userRouter.js';
import orderRoutes from './Router/orderRouter.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5001', 'http://localhost:5173', 'https://accounts.google.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes 
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);


const PORT = process.env.PORT || 5001;

// Connect to DB first, then start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed', err);
});