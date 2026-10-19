-- Saved results for mnemonic and radio tests
CREATE TABLE "DrillResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drill" TEXT NOT NULL,
    "item" TEXT,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "mistakes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrillResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DrillResult_userId_createdAt_idx" ON "DrillResult"("userId", "createdAt");

ALTER TABLE "DrillResult" ADD CONSTRAINT "DrillResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Same lockdown as docs/supabase-hardening.sql: no access through Supabase's public API
ALTER TABLE "DrillResult" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE "DrillResult" FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE "DrillResult" FROM authenticated';
  END IF;
END $$;
