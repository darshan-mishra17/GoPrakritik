import mongoose from 'mongoose';
const { Schema } = mongoose;

// Address Subschema
const addressSchema = new Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  house: { type: String, required: true },
  area: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  type: { type: String, enum: ['Home', 'Work'], default: 'Home' }
});

// Cart Item Schema (for storing product references)
const cartItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  selectedSize: {  // Optional: If your products have sizes (e.g., S, M, L)
    type: String,
    default: null
  },

  selectedColor: {  // Optional: If your products have color variants
    type: String,
    default: null
  },
  
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // Prevents Mongoose from auto-generating IDs for subdocuments

// Main User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  addresses: [addressSchema],
  cart: [cartItemSchema],  // Stores user's cart items
  wishlist: [{  // Optional: If you want a wishlist feature
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userSchema.index({ email: 1, phone: 1 });

const User = mongoose.model('User', userSchema);

export default User;