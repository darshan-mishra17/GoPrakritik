import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  country: {
    type: String,
    default: "India"
  },
  pickupLocation: {
    type: String,
    default: "Primary"
  },
  items: [
    {
      name: String,
      sku: String,
      quantity: Number,
      price: Number
    }
  ],
  subTotal: Number,
  shippingCharges: Number,
  paymentMethod: {
    type: String,
    enum: ["COD", "Prepaid"]
  },
  package: {
    length: Number,
    breadth: Number,
    height: Number,
    weight: Number
  },
  shiprocketOrderId: String,
  shipmentId: String,
  trackingUrl: String
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
