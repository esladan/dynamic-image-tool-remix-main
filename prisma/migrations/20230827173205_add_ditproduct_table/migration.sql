-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT
);

-- CreateTable
CREATE TABLE "DitProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productHandle" TEXT NOT NULL,
    "productData" TEXT NOT NULL,
    "image" TEXT,
    "colorTypes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DitProduct_productId_key" ON "DitProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "DitProduct_productHandle_key" ON "DitProduct"("productHandle");
