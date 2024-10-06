import { PrismaClient } from '@prisma/client';
import * as authService from '../services/authService.js';
import { NODE_ENV, JWT_SECRET, JWT_REFRESH_SECRET } from '../config.js';
import {
  ValidationError,
  UnauthorizedError,
} from '../middlewares/errorMiddleware.js';

const prisma = new PrismaClient();

export const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const hashedPassword = await authService.hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      !(await authService.comparePasswords(password, user.password))
    ) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = authService.generateToken(
      user.id,
      user.role,
      JWT_SECRET,
      '15m',
    );
    const refreshToken = authService.generateToken(
      user.id,
      user.role,
      JWT_REFRESH_SECRET,
      '7d',
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Include tokens in response body only for testing environments
    if (NODE_ENV === 'development') {
      res.accessToken = accessToken;
      res.refreshToken = refreshToken;
    }

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during logout' });
  }
};

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token not found' });
  }

  try {
    const decoded = authService.verifyToken(refreshToken, JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = authService.generateToken(
      user.id,
      user.role,
      JWT_SECRET,
      '15m',
    );
    const newRefreshToken = authService.generateToken(
      user.id,
      user.role,
      JWT_REFRESH_SECRET,
      '7d',
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: 'Tokens refreshed successfully' });
  } catch (error) {
    return res.status(401).json({ error: `Invalid refresh token : ${error}` });
  }
};
