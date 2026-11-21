CREATE TABLE "subscriptions" (
	"user_id" text PRIMARY KEY NOT NULL,
	"product" text NOT NULL,
	"period" text NOT NULL,
	"store" text NOT NULL,
	"sandbox" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"renews" boolean DEFAULT true NOT NULL,
	"billing_issue" boolean DEFAULT false NOT NULL,
	"event_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Life's own record of each subscription (fix F-20). No row-level security, like account_closures: RevenueCat's
-- webhook writes it with no session, and it holds a product and dates, never a price, receipt or card.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'life_api') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON "subscriptions" TO life_api;
  END IF;
END $$;
