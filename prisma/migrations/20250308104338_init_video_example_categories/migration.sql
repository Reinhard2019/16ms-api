-- CreateTable
CREATE TABLE "VideoExampleCategories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoExampleCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoToExampleCategory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "videoId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "VideoToExampleCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoToExampleCategory" ADD CONSTRAINT "VideoToExampleCategory_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoToExampleCategory" ADD CONSTRAINT "VideoToExampleCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VideoExampleCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
