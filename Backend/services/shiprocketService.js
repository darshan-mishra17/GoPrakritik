// services/shiprocketService.js

const axios = require('axios');

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let authToken = null;

// Function to authenticate and retrieve token
const authenticate = async () => {
  try {
    const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    });
    authToken = response.data.token;
    return authToken;
  } catch (error) {
    console.error('Shiprocket Authentication Error:', error.response.data);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

// Function to create an order
const createOrder = async (orderData) => {
  try {
    // Ensure authentication
    if (!authToken) {
      await authenticate();
    }

    const response = await axios.post(
      `${SHIPROCKET_API_URL}/orders/create/adhoc`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Shiprocket Order Creation Error:', error.response.data);
    throw new Error('Failed to create order with Shiprocket');
  }
};

module.exports = {
  createOrder,
};
