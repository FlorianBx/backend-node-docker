import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

export const comparePasswords = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId, role, secret, expiresIn) => {
  return jwt.sign({ userId, role }, secret, { expiresIn });
};

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
