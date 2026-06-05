-- CreateEnum
CREATE TYPE "TeacherStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "college" TEXT NOT NULL DEFAULT '',
    "department" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT,
    "addedByUserId" TEXT,
    "status" "TeacherStatus" NOT NULL DEFAULT 'PENDING',
    "avgGrading" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgAttendance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgDifficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRecommend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgExamFocus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherReview" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseName" TEXT NOT NULL DEFAULT '',
    "grading" INTEGER NOT NULL,
    "attendance" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "recommend" INTEGER NOT NULL,
    "examFocus" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "MaterialStatus" NOT NULL DEFAULT 'PENDING',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialFile" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "mimeType" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Teacher_status_name_idx" ON "Teacher"("status", "name");

-- CreateIndex
CREATE INDEX "Teacher_college_name_idx" ON "Teacher"("college", "name");

-- CreateIndex
CREATE INDEX "TeacherReview_teacherId_status_createdAt_idx" ON "TeacherReview"("teacherId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherReview_userId_createdAt_idx" ON "TeacherReview"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Course_teacherId_name_idx" ON "Course"("teacherId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_teacherId_key" ON "Course"("name", "teacherId");

-- CreateIndex
CREATE INDEX "StudyMaterial_courseId_status_createdAt_idx" ON "StudyMaterial"("courseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "StudyMaterial_userId_createdAt_idx" ON "StudyMaterial"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MaterialFile_materialId_idx" ON "MaterialFile"("materialId");

-- AddForeignKey
ALTER TABLE "TeacherReview" ADD CONSTRAINT "TeacherReview_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherReview" ADD CONSTRAINT "TeacherReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialFile" ADD CONSTRAINT "MaterialFile_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "StudyMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
