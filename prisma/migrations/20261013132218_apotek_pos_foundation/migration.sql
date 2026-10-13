-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('BEBAS', 'BEBAS_TERBATAS', 'KERAS');

-- CreateEnum
CREATE TYPE "PayMethod" AS ENUM ('CASH', 'QRIS', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PayStatus" AS ENUM ('LUNAS', 'PENDING');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'ADJUST');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('OWNER', 'APOTEKER', 'KASIR');

-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "buyPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'BEBAS',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "requiresPrescription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supplier" TEXT;

-- CreateTable
CREATE TABLE "StockBatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchNo" TEXT NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "buyPrice" DECIMAL(12,2),
    "supplier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notaNo" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "payMethod" "PayMethod" NOT NULL,
    "payStatus" "PayStatus" NOT NULL DEFAULT 'LUNAS',
    "paid" DECIMAL(12,2) NOT NULL,
    "change" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "prescriptionNo" TEXT,
    "doctorName" TEXT,
    "isReturned" BOOLEAN NOT NULL DEFAULT false,
    "returnedReason" TEXT,
    "returnedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sellPrice" DECIMAL(12,2) NOT NULL,
    "buyPrice" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchId" TEXT,
    "type" "MovementType" NOT NULL,
    "qtyChange" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "refSaleId" TEXT,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "userId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'KASIR',
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "StockBatch_userId_expiredAt_idx" ON "StockBatch"("userId", "expiredAt");

-- CreateIndex
CREATE INDEX "StockBatch_productId_expiredAt_idx" ON "StockBatch"("productId", "expiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "StockBatch_productId_batchNo_key" ON "StockBatch"("productId", "batchNo");

-- CreateIndex
CREATE INDEX "Sale_userId_createdAt_idx" ON "Sale"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_userId_notaNo_key" ON "Sale"("userId", "notaNo");

-- CreateIndex
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");

-- CreateIndex
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_userId_productId_createdAt_idx" ON "StockMovement"("userId", "productId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_refSaleId_idx" ON "StockMovement"("refSaleId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_entity_createdAt_idx" ON "AuditLog"("userId", "entity", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "StaffMember_ownerId_idx" ON "StaffMember"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_userId_sku_key" ON "Product"("userId", "sku");

-- AddForeignKey
ALTER TABLE "StockBatch" ADD CONSTRAINT "StockBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItem" ADD CONSTRAINT "SaleItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "StockBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "StockBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_refSaleId_fkey" FOREIGN KEY ("refSaleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

