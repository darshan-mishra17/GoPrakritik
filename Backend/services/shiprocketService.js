import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';
let token = null;

export const authenticate = async () => {
  if (token) return token;
  const res = await axios.post(`${SHIPROCKET_API}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD
  });
  token = res.data.token;
  return token;
};

export const createOrder = async (data) => {
  const auth = await authenticate();
  const res = await axios.post(`${SHIPROCKET_API}/orders/create/adhoc`, data, {
    headers: { Authorization: `Bearer ${auth}` }
  });
  return res.data;
};

export const getLabel = async (shipmentId) => {
  const auth = await authenticate();
  const res = await axios.get(`${SHIPROCKET_API}/courier/generate/label?shipment_id=${shipmentId}`, {
    headers: { Authorization: `Bearer ${auth}` }
  });
  return res.data;
};
