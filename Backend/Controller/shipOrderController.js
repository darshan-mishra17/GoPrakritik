// controllers/orderController.js
const { createOrder } = require('../services/shiprocketService');

const placeOrder = async (req, res) => {
  try {
    const orderDetails = req.body;

    // Save orderDetails to your database (MongoDB) here

    // Prepare data for Shiprocket
    const shiprocketOrderData = {
      order_id: orderDetails._id,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: 'Primary',
      billing_customer_name: orderDetails.customerName,
      billing_last_name: '',
      billing_address: orderDetails.address,
      billing_city: orderDetails.city,
      billing_pincode: orderDetails.pincode,
      billing_state: orderDetails.state,
      billing_country: 'India',
      billing_email: orderDetails.email,
      billing_phone: orderDetails.phone,
      order_items: orderDetails.items.map((item) => ({
        name: item.name,
        sku: item.sku,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: orderDetails.paymentMethod,
      shipping_charges: orderDetails.shippingCharges,
      sub_total: orderDetails.subTotal,
      length: orderDetails.packageDimensions.length,
      breadth: orderDetails.packageDimensions.breadth,
      height: orderDetails.packageDimensions.height,
      weight: orderDetails.packageDimensions.weight,
    };

    // Create order in Shiprocket
    const shiprocketResponse = await createOrder(shiprocketOrderData);

    // Update your order in the database with Shiprocket details if needed

    res.status(200).json({
      message: 'Order placed successfully',
      shiprocket: shiprocketResponse,
    });
  } catch (error) {
    console.error('Order Placement Error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

module.exports = {
  placeOrder,
};
