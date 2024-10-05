import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid', error: err });
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;
