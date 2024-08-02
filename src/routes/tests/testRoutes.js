import { Router } from 'express';

const router = Router();

router.get('/', (_, res) => {
  res.json({ message: 'Hello World, my friend ! 🍻' });
});

export default router;
