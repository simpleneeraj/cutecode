-- CreateEnum
CREATE TYPE "ShareTarget" AS ENUM ('SNIPPET', 'PRESENTATION', 'COLLECTION');

-- CreateEnum
CREATE TYPE "ShareVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PASSCODE', 'PRIVATE');

-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'PRO', 'PREMIUM');
ALTER TABLE "public"."User" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TABLE "Subscription" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TABLE "Subscription" ALTER COLUMN "scheduledPlan" TYPE "Plan_new" USING ("scheduledPlan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "User" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELED', 'EXPIRED');
ALTER TABLE "public"."Subscription" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "DunningAttempt" DROP CONSTRAINT "DunningAttempt_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "DunningAttempt" DROP CONSTRAINT "DunningAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "UsageEvent" DROP CONSTRAINT "UsageEvent_userId_fkey";

-- DropIndex
DROP INDEX "User_clerkId_idx";

-- DropIndex
DROP INDEX "User_clerkId_key";

-- DropIndex
DROP INDEX "WebhookEvent_status_idx";

-- AlterTable
ALTER TABLE "Snippet" DROP COLUMN "code",
DROP COLUMN "language",
DROP COLUMN "theme",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "elementId" TEXT NOT NULL,
ADD COLUMN     "encryptionHint" TEXT,
ADD COLUMN     "isE2EEncrypted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "presentationId" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "trialEnd",
DROP COLUMN "trialStart",
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clerkId",
DROP COLUMN "usageMonth",
DROP COLUMN "usageReset",
ADD COLUMN     "supabaseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "attempts",
DROP COLUMN "errorMessage",
DROP COLUMN "lastAttemptAt",
DROP COLUMN "status";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "DunningAttempt";

-- DropTable
DROP TABLE "IdempotencyKey";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "UsageEvent";

-- DropEnum
DROP TYPE "AuditAction";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "WebhookEventStatus";

-- CreateTable
CREATE TABLE "UserFollows" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFollows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "Presentation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 680,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "thumbnailUrl" TEXT,
    "slides" JSONB NOT NULL,
    "elements" JSONB NOT NULL,
    "slideElements" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "targetType" "ShareTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "snippetId" TEXT,
    "presentationId" TEXT,
    "visibility" "ShareVisibility" NOT NULL DEFAULT 'PUBLIC',
    "passcodeHash" TEXT,
    "isE2EEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "encryptionHint" TEXT,
    "maxViews" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "allowDownload" BOOLEAN NOT NULL DEFAULT true,
    "allowCopy" BOOLEAN NOT NULL DEFAULT true,
    "indexable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLinkView" (
    "id" TEXT NOT NULL,
    "shareLinkId" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "passcodeUsed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLinkView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLinkAccess" (
    "id" TEXT NOT NULL,
    "shareLinkId" TEXT NOT NULL,
    "grantedToUserId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ShareLinkAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnippetComment" (
    "id" TEXT NOT NULL,
    "snippetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SnippetComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnippetUpvote" (
    "id" TEXT NOT NULL,
    "snippetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SnippetUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnippetBookmark" (
    "id" TEXT NOT NULL,
    "snippetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SnippetBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFollows_followerId_idx" ON "UserFollows"("followerId");

-- CreateIndex
CREATE INDEX "UserFollows_followingId_idx" ON "UserFollows"("followingId");

-- CreateIndex
CREATE INDEX "Presentation_userId_idx" ON "Presentation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_slug_key" ON "ShareLink"("slug");

-- CreateIndex
CREATE INDEX "ShareLink_slug_idx" ON "ShareLink"("slug");

-- CreateIndex
CREATE INDEX "ShareLink_userId_idx" ON "ShareLink"("userId");

-- CreateIndex
CREATE INDEX "ShareLink_targetType_targetId_idx" ON "ShareLink"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "ShareLink_expiresAt_idx" ON "ShareLink"("expiresAt");

-- CreateIndex
CREATE INDEX "ShareLinkView_shareLinkId_viewedAt_idx" ON "ShareLinkView"("shareLinkId", "viewedAt");

-- CreateIndex
CREATE INDEX "ShareLinkAccess_grantedToUserId_idx" ON "ShareLinkAccess"("grantedToUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLinkAccess_shareLinkId_grantedToUserId_key" ON "ShareLinkAccess"("shareLinkId", "grantedToUserId");

-- CreateIndex
CREATE INDEX "SnippetComment_snippetId_createdAt_idx" ON "SnippetComment"("snippetId", "createdAt");

-- CreateIndex
CREATE INDEX "SnippetComment_userId_idx" ON "SnippetComment"("userId");

-- CreateIndex
CREATE INDEX "SnippetUpvote_snippetId_idx" ON "SnippetUpvote"("snippetId");

-- CreateIndex
CREATE UNIQUE INDEX "SnippetUpvote_snippetId_userId_key" ON "SnippetUpvote"("snippetId", "userId");

-- CreateIndex
CREATE INDEX "SnippetBookmark_snippetId_idx" ON "SnippetBookmark"("snippetId");

-- CreateIndex
CREATE INDEX "SnippetBookmark_userId_idx" ON "SnippetBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SnippetBookmark_snippetId_userId_key" ON "SnippetBookmark"("snippetId", "userId");

-- CreateIndex
CREATE INDEX "Snippet_presentationId_idx" ON "Snippet"("presentationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");

-- AddForeignKey
ALTER TABLE "UserFollows" ADD CONSTRAINT "UserFollows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollows" ADD CONSTRAINT "UserFollows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snippet" ADD CONSTRAINT "Snippet_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presentation" ADD CONSTRAINT "Presentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "Presentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLinkView" ADD CONSTRAINT "ShareLinkView_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLinkAccess" ADD CONSTRAINT "ShareLinkAccess_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLinkAccess" ADD CONSTRAINT "ShareLinkAccess_grantedToUserId_fkey" FOREIGN KEY ("grantedToUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnippetComment" ADD CONSTRAINT "SnippetComment_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnippetComment" ADD CONSTRAINT "SnippetComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnippetUpvote" ADD CONSTRAINT "SnippetUpvote_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnippetUpvote" ADD CONSTRAINT "SnippetUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnippetBookmark" ADD CONSTRAINT "SnippetBookmark_snippetId_fkey" FOREIGN KEY ("snippetId") REFERENCES "Snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnippetBookmark" ADD CONSTRAINT "SnippetBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

