CREATE TABLE "weekly_moves" (
	"week" text NOT NULL,
	"platform" text NOT NULL,
	"moves" integer NOT NULL,
	"reports" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "weekly_moves_week_platform_moves_pk" PRIMARY KEY("week","platform","moves")
);
--> statement-breakpoint
-- A tally with no person in it (see schema.ts), so no row-level security, like lesson_cache and scene_cache.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'life_api') THEN
    GRANT SELECT, INSERT, UPDATE ON "weekly_moves" TO life_api;
  END IF;
END $$;
