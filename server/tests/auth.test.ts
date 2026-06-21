import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import User from '../models/user.model.js';

// Mock Firebase Admin
vi.mock('../config/firebaseAdmin.js', () => {
  return {
    default: {
      auth: () => ({
        verifyIdToken: async (token: string) => {
          if (token === 'valid-token') {
            return {
              email: 'test@example.com',
              name: 'Test User',
              uid: 'firebase-uid-123'
            };
          }
          if (token === 'no-email-token') {
            return {
              name: 'Test User',
              uid: 'firebase-uid-123'
            };
          }
          throw new Error('Invalid token');
        }
      })
    }
  };
});

// Mock User Model
vi.mock('../models/user.model.js', () => {
  const mockUser = {
    _id: 'mock-user-id-123',
    name: 'Test User',
    email: 'test@example.com',
    credits: 100
  };
  return {
    default: {
      findOne: vi.fn().mockImplementation(async (query: any) => {
        if (query.email === 'test@example.com') {
          return mockUser;
        }
        return null;
      }),
      create: vi.fn().mockImplementation(async (data: any) => {
        return {
          _id: 'mock-user-id-new',
          name: data.name || 'User',
          email: data.email,
          credits: 100
        };
      })
    }
  };
});

// Mock connectDB to do nothing
vi.mock('../config/connectDB.js', () => {
  return {
    default: async () => {}
  };
});

describe('Authentication API Tests', () => {
  it('should successfully authenticate user with a valid Firebase ID token', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'valid-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.header['set-cookie']).toBeDefined();
    expect(res.header['set-cookie'][0]).toContain('token=');
  });

  it('should fail authentication if ID token is missing', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should fail authentication with an invalid Firebase ID token', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'invalid-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid Firebase token');
  });

  it('should fail if email is missing from the Firebase token', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'no-email-token' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Email not found');
  });

  it('should successfully clear token cookie on logout', async () => {
    const res = await request(app)
      .post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.header['set-cookie']).toBeDefined();
  });
});
