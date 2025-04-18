import mongoose from 'mongoose';
const { Schema } = mongoose;

// Ordered Item Subschema
const orderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  unit: { type: String, required: true },           // e.g., "1 L", "500g"
  price: { type: Number, required: true },          // price at the time of purchase
  quantity: { type: Number, required: true },
  productType: { type: String },                    // Product / SpiceProduct / AttarProduct
}, { _id: false });


const deliveryAddressSchema = new Schema({
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

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  deliveryAddress: deliveryAddressSchema,
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  deliveryStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    default: 'COD'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
