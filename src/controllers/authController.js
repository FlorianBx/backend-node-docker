import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../config.js';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, password: hashedPassword, role },
  });

  res.json({ message: 'User created successfully', email, role });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '1h',
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });

  res.json({ message: `Logged in successfully, ${user.email}` });
};

export const logout = async (_, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getUsers = async (_, res) => {
  const users = await prisma.user.findMany();

  res.json(users);
};
