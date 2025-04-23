import Order from '../Models/Order.js';
import { createOrder, getLabel } from '../services/shiprocketService.js';

export const placeOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const newOrder = await Order.create(orderData);

    const shiprocketPayload = {
      order_id: newOrder._id.toString(),
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: orderData.pickupLocation || "Primary",
      billing_customer_name: orderData.customerName,
      billing_address: orderData.address,
      billing_city: orderData.city,
      billing_pincode: orderData.pincode,
      billing_state: orderData.state,
      billing_country: "India",
      billing_email: orderData.email,
      billing_phone: orderData.phone,
      order_items: orderData.items.map(i => ({
        name: i.name,
        sku: i.sku,
        units: i.quantity,
        selling_price: i.price
      })),
      payment_method: orderData.paymentMethod,
      shipping_charges: orderData.shippingCharges,
      sub_total: orderData.subTotal,
      length: orderData.package.length,
      breadth: orderData.package.breadth,
      height: orderData.package.height,
      weight: orderData.package.weight
    };

    const srResponse = await createOrder(shiprocketPayload);
    const labelInfo = await getLabel(srResponse.shipment_id);

    newOrder.shiprocketOrderId = srResponse.order_id;
    newOrder.shipmentId = srResponse.shipment_id;
    newOrder.trackingUrl = labelInfo.label_url;
    await newOrder.save();

    res.status(200).json({ success: true, order: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
