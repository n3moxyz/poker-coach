-- CreateTable
CREATE TABLE "PokerHand" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "smallBlind" INTEGER NOT NULL,
    "bigBlind" INTEGER NOT NULL,
    "handHistory" JSONB NOT NULL,
    "result" TEXT NOT NULL,
    "chipsDelta" INTEGER NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "overallGrade" TEXT,
    "coachingSummary" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PokerHand_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PokerHand" ADD CONSTRAINT "PokerHand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
