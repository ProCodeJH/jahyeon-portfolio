/**
 * Auth Routes
 * JWT-based authentication with refresh tokens
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import argon2 from 'argon2';
import { nanoid } from 'nanoid';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Mock user store (would be database in production)
const users = new Map<string, {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  createdAt: Date;
}>();

// Refresh tokens store (would be Redis in production)
const refreshTokens = new Map<string, {
  userId: string;
  expiresAt: Date;
}>();

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = registerSchema.parse(request.body);

    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === body.email);
    if (existingUser) {
      return reply.status(409).send({
        error: true,
        message: 'User already exists',
        code: 'USER_EXISTS',
      });
    }

    // Hash password
    const hashedPassword = await argon2.hash(body.password);

    // Create user
    const user = {
      id: nanoid(),
      email: body.email,
      password: hashedPassword,
      name: body.name,
      role: 'owner' as const,
      createdAt: new Date(),
    };
    users.set(user.id, user);

    // Generate tokens
    const accessToken = fastify.jwt.sign(
      { userId: user.id, role: user.role },
      { expiresIn: '15m' }
    );
    const refreshToken = nanoid(64);
    refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Set cookie
    reply.setCookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  });

  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);

    // Find user
    const user = Array.from(users.values()).find(u => u.email === body.email);
    if (!user) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Verify password
    const valid = await argon2.verify(user.password, body.password);
    if (!valid) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate tokens
    const accessToken = fastify.jwt.sign(
      { userId: user.id, role: user.role },
      { expiresIn: '15m' }
    );
    const refreshToken = nanoid(64);
    refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Set cookie
    reply.setCookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  });

  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const { refreshToken } = request.body as { refreshToken: string };

    const tokenData = refreshTokens.get(refreshToken);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      return reply.status(401).send({
        error: true,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    }

    const user = users.get(tokenData.userId);
    if (!user) {
      return reply.status(401).send({
        error: true,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Generate new access token
    const accessToken = fastify.jwt.sign(
      { userId: user.id, role: user.role },
      { expiresIn: '15m' }
    );

    reply.setCookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return { accessToken };
  });

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const { refreshToken } = request.body as { refreshToken?: string };

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    reply.clearCookie('token');
    return { success: true };
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({
          error: true,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }
    }],
  }, async (request: FastifyRequest) => {
    const { userId } = request.user as { userId: string };
    const user = users.get(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  });
}
