-- AlterTable
ALTER TABLE "User" ADD COLUMN "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "intervalHours" INTEGER NOT NULL DEFAULT 2,
    "model" TEXT NOT NULL DEFAULT 'chatgpt',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "totalInr" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "PortfolioSnapshot_userId_createdAt_idx" ON "PortfolioSnapshot"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "NotificationLog_userId_createdAt_idx" ON "NotificationLog"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioSnapshot" ADD CONSTRAINT "PortfolioSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
