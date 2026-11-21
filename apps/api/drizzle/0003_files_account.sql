CREATE TABLE "account_closures" (
	"user_id" text PRIMARY KEY NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"delete_after" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"kind" text NOT NULL,
	"content_type" text NOT NULL,
	"keep" boolean DEFAULT false NOT NULL,
	"delete_after" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "files_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "account_closures" ADD CONSTRAINT "account_closures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_closures_due" ON "account_closures" USING btree ("delete_after");--> statement-breakpoint
CREATE INDEX "files_user" ON "files" USING btree ("user_id");--> statement-breakpoint
-- Files belong to one person, like every other user table (see 0001_row_level_security.sql). account_closures has
-- no row-level security, like sessions: the sweep reads it across accounts, and it holds no personal content.
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "files" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "files_owner" ON "files" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'life_api') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "files", "account_closures" TO life_api;
  END IF;
END $$;
