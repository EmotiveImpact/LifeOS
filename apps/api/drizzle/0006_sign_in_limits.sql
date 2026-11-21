CREATE TABLE "auth_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "auth_limits_window" ON "auth_limits" USING btree ("window_start");--> statement-breakpoint
-- Keyed hashes and counts, no person (see schema.ts), so no row-level security, like weekly_moves.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'life_api') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "auth_limits" TO life_api;
  END IF;
END $$;
