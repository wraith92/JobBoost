-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "targetRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];
