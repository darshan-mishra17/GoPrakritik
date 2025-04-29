// services/shiprocketService.js
import axios from 'axios';

const SHIPROCKET_API_KEY = process.env.SHIPROCKET_API_KEY;
const SHIPROCKET_SECRET = process.env.SHIPROCKET_SECRET;
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let authToken = '';

// Function to authenticate with Shiprocket
async function authenticate() {
  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: 'your_shiprocket_email',
      password: 'your_shiprocket_password'
    });
    authToken = response.data.token;
    return authToken;
  } catch (error) {
    console.error('Shiprocket authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

// Function to create shipment
async function createShipment(orderData) {
  if (!authToken) {
    await authenticate();
  }
  
  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, orderData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Shiprocket shipment creation failed:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get shipping rates
async function getShippingRates(pickupPostcode, deliveryPostcode, weight, dimensions) {
  if (!authToken) {
    await authenticate();
  }

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/courier/serviceability`, {
      pickup_postcode: pickupPostcode,
      delivery_postcode: deliveryPostcode,
      weight: weight,
      length: dimensions.length,
      width: dimensions.width,
      height: dimensions.height
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get shipping rates:', error.response?.data || error.message);
    throw error;
  }
}

export default {
  authenticate,
  createShipment,
  getShippingRates
};
