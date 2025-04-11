import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';

import User from './Models/User.js';
import { Product } from './Models/Product.js'; // Make sure this path is correct
import connectDB from './db/connection.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;

const createTestData = async () => {
  // Create test product
  const testProduct = await Product.create({
    productName: "Test Product",
    category: "Herbal",
    description: "Test description...",
    priceVariants: [{ unit: "100g", price: 50 }],
    benefits: [{ description: "Test benefit" }],
    organicProcessingMethod: "Test method",
    traditionalMethods: "Test traditional method",
    usage: "Test usage"
  });

  // Create test user
  await User.create({
    name: "Ravi Sharma",
    email: "ravi.sharma@example.com",
    phone: "9876543210",
    password: "testpassword123",
    addresses: [
      {
        fullName: "Ravi Sharma",
        phone: "9876543210",
        pincode: "560001",
        house: "Flat 202",
        area: "MG Road",
        landmark: "Near Metro Station",
        city: "Bangalore",
        state: "Karnataka",
        type: "Home"
      }
    ],
    orderHistory: [
      {
        orderId: new mongoose.Types.ObjectId(),
        items: [
          {
            productId: testProduct._id,
            productName: testProduct.productName,
            unit: testProduct.priceVariants[0].unit,
            price: testProduct.priceVariants[0].price,
            quantity: 2,
            productType: "Product"
          }
        ],
        totalAmount: testProduct.priceVariants[0].price * 2,
        paymentStatus: "Paid",
        deliveryStatus: "Delivered",
        orderDate: new Date("2024-04-01T10:30:00Z")
      }
    ],
    isAdmin: false
  });

  console.log("Test product and user created successfully");
};

(async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');

    await createTestData();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Initialization failed:', err);
    process.exit(1);
  }
})();
