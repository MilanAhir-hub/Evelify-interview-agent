import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import jwt from 'jsonwebtoken';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import crypto from 'crypto';

// Set environment variables for testing
process.env.JWT_SECRET = 'test-secret';
process.env.RAZORPAY_KEY_SECRET = 'razorpay-secret';

vi.mock('../config/firebaseAdmin.js', () => {
  return {
    default: {
      auth: () => ({
        verifyIdToken: async () => ({ email: 'test@example.com' })
      })
    }
  };
});

// Mock Razorpay
vi.mock('razorpay', () => {
  return {
    default: class MockRazorpay {
      orders = {
        create: async (options: any) => {
          return {
            id: 'order_12345',
            amount: options.amount,
            currency: options.currency,
            receipt: options.receipt,
            status: 'created'
          };
        }
      };
    }
  };
});

// Mock connectDB to do nothing
vi.mock('../config/connectDB.js', () => {
  return {
    default: async () => {}
  };
});

// Mock DB queries for Payment and User
vi.mock('../models/payment.model.js', () => {
  const mockPaymentRecord = {
    _id: 'payment-record-id',
    userId: 'mock-user-123',
    razorpayOrderId: 'order_12345',
    razorpayPaymentId: undefined as string | undefined,
    razorpaySignature: undefined as string | undefined,
    amount: 9900,
    credits: 50,
    tierId: 'tier_50',
    status: 'created',
    save: vi.fn().mockImplementation(function (this: any) {
      return this;
    })
  };

  const mockPaidRecord = {
    ...mockPaymentRecord,
    status: 'paid',
    razorpayPaymentId: 'pay_already_verified'
  };

  return {
    default: {
      create: vi.fn().mockImplementation(async (data: any) => ({
        ...data,
        _id: 'new-payment-id',
        save: vi.fn()
      })),
      findOne: vi.fn().mockImplementation(async (query: any) => {
        if (query.razorpayPaymentId === 'pay_already_verified') {
          return mockPaidRecord;
        }
        if (query.razorpayPaymentId === 'pay_duplicate') {
          return mockPaidRecord;
        }
        if (query.razorpayOrderId === 'order_12345') {
          return { ...mockPaymentRecord }; // Return a clone so we can modify status in individual tests
        }
        if (query.razorpayOrderId === 'order_paid_already') {
          return { ...mockPaymentRecord, status: 'paid' };
        }
        if (query.razorpayOrderId === 'order_wrong_amount') {
          return { ...mockPaymentRecord, amount: 500 };
        }
        if (query.razorpayOrderId === 'order_wrong_user') {
          return { ...mockPaymentRecord, userId: 'other-user-456' };
        }
        return null;
      })
    }
  };
});

vi.mock('../models/user.model.js', () => {
  const mockUser = {
    _id: 'mock-user-123',
    name: 'Test User',
    email: 'test@example.com',
    credits: 10,
    save: vi.fn().mockImplementation(function (this: any) {
      return this;
    })
  };
  return {
    default: {
      findById: vi.fn().mockImplementation(async (id: string) => {
        if (id === 'mock-user-123') {
          return mockUser;
        }
        return null;
      })
    }
  };
});

describe('Payment API Tests', () => {
  let authToken: string;

  beforeEach(() => {
    authToken = jwt.sign({ id: 'mock-user-123' }, process.env.JWT_SECRET!);
    vi.clearAllMocks();
  });

  describe('POST /api/payment/create-order', () => {
    it('should successfully create razorpay order and persist payment record', async () => {
      const res = await request(app)
        .post('/api/payment/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tierId: 'tier_50' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.id).toBe('order_12345');
      expect(Payment.create).toHaveBeenCalled();
    });

    it('should fail if pricing tier ID is missing or invalid', async () => {
      const res = await request(app)
        .post('/api/payment/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tierId: 'invalid_tier' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail if user is not authenticated', async () => {
      const res = await request(app)
        .post('/api/payment/create-order')
        .send({ tierId: 'tier_50' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/payment/verify', () => {
    const validSignature = (orderId: string, paymentId: string) => {
      return crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    };

    it('should fail signature verification if payment verification fields are missing', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_12345'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should block duplicate payment validation (replay protection)', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_12345',
          razorpay_payment_id: 'pay_duplicate',
          razorpay_signature: 'dummy_sig',
          tierId: 'tier_50'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Payment has already been processed');
    });

    it('should reject payment verification if order record is not found in database', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_not_found',
          razorpay_payment_id: 'pay_new',
          razorpay_signature: 'dummy_sig',
          tierId: 'tier_50'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Payment record not found');
    });

    it('should fail verification if payment order belongs to a different user', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_wrong_user',
          razorpay_payment_id: 'pay_new',
          razorpay_signature: 'dummy_sig',
          tierId: 'tier_50'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized payment order ownership');
    });

    it('should fail verification if payment amount does not match pricing tier', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_wrong_amount',
          razorpay_payment_id: 'pay_new',
          razorpay_signature: 'dummy_sig',
          tierId: 'tier_50'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid payment amount match');
    });

    it('should fail verification if payment order status is already paid', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: 'order_paid_already',
          razorpay_payment_id: 'pay_new',
          razorpay_signature: 'dummy_sig',
          tierId: 'tier_50'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Payment order already marked as paid');
    });

    it('should successfully verify authentic signature and update credits', async () => {
      const orderId = 'order_12345';
      const paymentId = 'pay_new';
      const signature = validSignature(orderId, paymentId);

      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          tierId: 'tier_50'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Payment successful');
    });

    it('should fail verification and set payment status to failed with invalid signature', async () => {
      const orderId = 'order_12345';
      const paymentId = 'pay_new';
      const signature = 'invalid_signature_matches';

      const res = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          tierId: 'tier_50'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid payment signature');
    });
  });
});
