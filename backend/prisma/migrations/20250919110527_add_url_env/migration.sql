-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "env" TEXT NOT NULL DEFAULT 'dev',
ADD COLUMN     "url" TEXT NOT NULL DEFAULT 'http://abc.xyz:3000',
ALTER COLUMN "status" SET DEFAULT 'created';
