import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SHIPROCKET_API = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5001/mock-shiprocket/v1/external'
  : 'https://apiv2.shiprocket.in/v1/external';


//const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';
let token = null;

// Create a custom axios instance
const shiprocketAxios = axios.create({
  baseURL: SHIPROCKET_API,
  timeout: 10000, // 10 seconds timeout
});

// Handle auth token
export const authenticate = async () => {
  try {
    if (token) return token;
    const res = await shiprocketAxios.post('/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });
    token = res.data.token;
    return token;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

// Create a new order
export const createOrder = async (data) => {
  try {
    const auth = await authenticate();
    const res = await shiprocketAxios.post('/orders/create/adhoc', data, {
      headers: { Authorization: `Bearer ${auth}` }
    });
    return res.data;
  } catch (error) {
    console.error('Create order error:', error.response?.data || error.message);
    throw new Error('Failed to create order on Shiprocket');
  }
};

// Get label/tracking
export const getLabel = async (shipmentId) => {
  try {
    const auth = await authenticate();
    const res = await shiprocketAxios.get(`/courier/generate/label?shipment_id=${shipmentId}`, {
      headers: { Authorization: `Bearer ${auth}` }
    });
    return res.data;
  } catch (error) {
    console.error('Get label error:', error.response?.data || error.message);
    throw new Error('Failed to generate label from Shiprocket');
  }
};