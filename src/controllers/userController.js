import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (_, res) => {
  const users = await prisma.user.findMany();

  res.json(
    users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
  );
};
