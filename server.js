import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET;

app.get('/', (_, res) => {
  res.status(200).send({message: 'Hello World, buddy !'});
})

app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role }
  });
  res.json(user);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.sendStatus(401);
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
  res.json({ message: 'Logged in successfully' });
});

// MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


// PROTECTED ROUTES
app.get('/users', authenticateToken, async (_, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/menu', async (req, res) => {
  const items = await prisma.menuItem.findMany();
  res.json(items);
});

app.post('/menu', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.sendStatus(403);
  const item = await prisma.menuItem.create({ data: req.body });
  res.json(item);
});

app.get('/orders', authenticateToken, async (req, res) => {
  const orders = await prisma.order.findMany();
  res.json(orders);
});

app.post('/orders', authenticateToken, async (req, res) => {
  const order = await prisma.order.create({ data: { items: req.body.items, status: 'PENDING' } });
  res.json(order);
});

app.put('/orders/:id', authenticateToken, async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: { status }
  });
  res.json(order);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

