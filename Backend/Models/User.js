import mongoose from 'mongoose';
const { Schema } = mongoose;

// Address Subschema
const addressSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  house: { type: String, required: true },
  area: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  type: { type: String, enum: ['Home', 'Work'], default: 'Home' }
}, { _id: false });

// Order History Subschema (with variant/unit info)
const orderHistorySchema = new Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      unit: { type: String, required: true },     // e.g., "500g", "1 L"
      price: { type: Number, required: true },     // price at time of order
      quantity: { type: Number, required: true },
      productType: { type: String }                // "Product", "SpiceProduct", "AttarProduct"
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  deliveryStatus: { type: String, enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Processing' },
  orderDate: { type: Date, default: Date.now }
}, { _id: false });

// User Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  addresses: [addressSchema],
  orderHistory: [orderHistorySchema],
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
