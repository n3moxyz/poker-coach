-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isPlacementTest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "placementTestCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "placementTestScore" INTEGER;
