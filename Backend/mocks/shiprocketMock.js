import express from 'express';

const mockRouter = express.Router();

// Mock Shiprocket Auth
mockRouter.post('/v1/external/auth/login', (req, res) => {
  return res.json({ token: 'mocked-token-12345' });
});

// Mock Shiprocket Create Order
mockRouter.post('/v1/external/orders/create/adhoc', (req, res) => {
  return res.json({
    order_id: 999999,
    shipment_id: 888888,
    tracking_url: 'https://tracking.shiprocket.in/mocked-tracking-id'
  });
});

// Mock Shiprocket Label Generation
mockRouter.get('/v1/external/courier/generate/label', (req, res) => {
  return res.json({
    label_url: 'https://shiprocket.fake.label.url/label.pdf'
  });
});

export default mockRouter;
