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

const cartItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', 
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  selectedVariantIndex: {
    type: Number,
    default: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

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
    trim: true,
    minlength: 10,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
  },
  googleId: {
    type: String,
    // sparse: true
  },
  profilePicture: {
    type: String
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  addresses: [addressSchema],
  cart: [cartItemSchema],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
},
{
  timestamps: true
});

userSchema.index({ email: 1, phone: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

const User = mongoose.model('User', userSchema);

export default User;
