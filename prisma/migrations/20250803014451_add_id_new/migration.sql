/*
  Warnings:

  - A unique constraint covering the columns `[idNew]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idNew]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "idNew" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "idNew" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_idNew_key" ON "User"("idNew");

-- CreateIndex
CREATE UNIQUE INDEX "Video_idNew_key" ON "Video"("idNew");
