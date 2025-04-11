import mongoose from "mongoose";

const benefitSchema = new mongoose.Schema({
  description: String
});

const pricingSchema = new mongoose.Schema({
  quantity: String,
  price: Number
});

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  productDescription: {
    type: String,
    required: true
  },
  benefits: [benefitSchema],
  organicProcessingMethod: String,
  traditionalMethods: String,
  usage: String,
  pricing: [pricingSchema],
  category: {
    type: String,
    enum: ['Dairy', 'Spices', 'Herbs', 'Sweeteners', 'Seasonings', 'Personal Care'],
    required: true
  },
  images: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);