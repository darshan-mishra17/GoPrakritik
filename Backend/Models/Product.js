import mongoose from 'mongoose';
const { Schema } = mongoose;

// Sub-schema for pricing variants
const priceVariantSchema = new Schema({
  unit: { type: String, required: true },
  price: { type: Number, required: true }
});

// Sub-schema for benefits
const benefitSchema = new Schema({
  description: { type: String, required: true }
});

// Main product schema
const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Dairy', 'Spice', 'Herbal', 'Sweetener', 'Seasoning', 'Personal Care'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priceVariants: [priceVariantSchema],
  benefits: [benefitSchema],
  organicProcessingMethod: {
    type: String,
    required: true
  },
  traditionalMethods: {
    type: String,
    required: true
  },
  usage: {
    type: String,
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// For products with variant benefits like spices
const variantBenefitSchema = new Schema({
  variantName: { type: String, required: true },
  benefits: [benefitSchema]
});

const spiceProductSchema = new Schema({
  ...productSchema.obj,
  variantBenefits: [variantBenefitSchema]
});

// For attar/perfume products
const attarProductSchema = new Schema({
  ...productSchema.obj,
  fragranceNotes: [String],
  intensity: {
    type: String,
    enum: ['Light', 'Medium', 'Strong']
  }
});

// Create base Product model
const Product = mongoose.model('Product', productSchema);

// Create discriminators
const SpiceProduct = Product.discriminator('SpiceProduct', spiceProductSchema);
const AttarProduct = Product.discriminator('AttarProduct', attarProductSchema);

// Export all models
export default Product;
export { SpiceProduct, AttarProduct };
