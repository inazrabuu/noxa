/*
  Warnings:

  - Added the required column `files` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipPath` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "files" JSONB NOT NULL,
ADD COLUMN     "zipPath" TEXT NOT NULL;
