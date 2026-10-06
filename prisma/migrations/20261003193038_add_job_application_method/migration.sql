-- CreateEnum
CREATE TYPE "ApplicationMethod" AS ENUM ('UNKNOWN', 'EMAIL', 'FRANCE_TRAVAIL', 'PARTNER', 'EXTERNAL_SITE', 'MANUAL');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "applicationMethod" "ApplicationMethod" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "applicationUrl" TEXT,
ADD COLUMN     "contactEmail" TEXT;
