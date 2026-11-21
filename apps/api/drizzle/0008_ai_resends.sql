ALTER TABLE "ai_usage" ADD COLUMN "request_id" text;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD COLUMN "repeat" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "ai_usage_user_request" ON "ai_usage" USING btree ("user_id","request_id");