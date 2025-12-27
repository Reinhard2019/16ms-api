/*
  Warnings:

  - You are about to drop the column `resource` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "resource",
ADD COLUMN     "assets" JSONB;
