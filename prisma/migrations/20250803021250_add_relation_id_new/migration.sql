/*
  Warnings:

  - Added the required column `userIdNew` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoIdNew` to the `VideoToExampleCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "userIdNew" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VideoToExampleCategory" ADD COLUMN     "videoIdNew" TEXT NOT NULL;