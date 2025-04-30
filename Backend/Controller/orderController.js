// controllers/orderController.js
import Order from '../Models/Order.js';
import Product from '../Models/Product.js';
import shiprocketService from '../services/shiprocketService.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      itemsPrice, 
      taxPrice, 
      shippingPrice, 
      totalPrice 
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Calculate order weight
    let totalWeight = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product ${item.product} not found` 
        });
      }
      totalWeight += product.weight * item.qty;
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      totalWeight
    });

    const createdOrder = await order.save();

    // Prepare Shiprocket payload
    const shiprocketPayload = {
      order_id: createdOrder._id.toString(),
      order_date: new Date().toISOString(),
      pickup_location: 'Primary',
      billing_customer_name: shippingAddress.fullName,
      billing_address: shippingAddress.address,
      billing_address_2: shippingAddress.address2 || '',
      billing_city: shippingAddress.city,
      billing_pincode: shippingAddress.postalCode,
      billing_state: shippingAddress.state,
      billing_country: 'India',
      billing_email: req.user.email,
      billing_phone: shippingAddress.phone,
      shipping_is_billing: true,
      order_items: await Promise.all(orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        return {
          name: product.name,
          sku: product.sku || '',
          units: item.qty,
          selling_price: item.price,
          discount: '',
          tax: '',
          hsn: product.hsn || ''
        };
      })),
      payment_method: paymentMethod,
      shipping_charges: shippingPrice,
      total_discount: 0,
      sub_total: itemsPrice,
      length: 10,
      breadth: 10,
      height: 10,
      weight: totalWeight
    };

    // Create shipment in Shiprocket
    const shipment = await shiprocketService.createShipment(shiprocketPayload);

    // Update order with shipment details
    createdOrder.shipmentId = shipment.shipment_id;
    createdOrder.airwayBillNumber = shipment.awb;
    await createdOrder.save();

    return res.status(201).json({
      success: true,
      order: createdOrder,
      shipmentDetails: shipment
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

export default createOrder;