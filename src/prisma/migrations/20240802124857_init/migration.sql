/*
  Warnings:

  - You are about to drop the `MenuItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrderItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_OrderItems" DROP CONSTRAINT "_OrderItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderItems" DROP CONSTRAINT "_OrderItems_B_fkey";

-- DropTable
DROP TABLE "MenuItem";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "_OrderItems";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "Role";
