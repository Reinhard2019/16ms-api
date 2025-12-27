/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idNew` on the `User` table. All the data in the column will be lost.
  - The primary key for the `Video` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idNew` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `userIdNew` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `videoIdNew` on the `VideoToExampleCategory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_userId_fkey";

-- DropForeignKey
ALTER TABLE "VideoToExampleCategory" DROP CONSTRAINT "VideoToExampleCategory_videoId_fkey";

-- DropIndex
DROP INDEX "User_idNew_key";

-- DropIndex
DROP INDEX "Video_idNew_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "idNew",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "Video" DROP CONSTRAINT "Video_pkey",
DROP COLUMN "idNew",
DROP COLUMN "userIdNew",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Video_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Video_id_seq";

-- AlterTable
ALTER TABLE "VideoToExampleCategory" DROP COLUMN "videoIdNew",
ALTER COLUMN "videoId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoToExampleCategory" ADD CONSTRAINT "VideoToExampleCategory_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
