ALTER TABLE "ai_usage" ADD COLUMN "tier" text DEFAULT 'fast' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD COLUMN "outcome" text DEFAULT 'ok' NOT NULL;