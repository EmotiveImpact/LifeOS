-- Row-level security on every table that holds one person's rows (BUILD_V26 Phase 21).
-- The API sets app.user_id inside each request's transaction (src/db/client.ts withUser). FORCE makes the rule
-- apply to the table owner too, so the API's own role can't read or write another person's rows. Outside withUser
-- the setting is empty and no rows match.

ALTER TABLE "profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profile" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "profile_owner" ON "profile" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "body_profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "body_profile" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "body_profile_owner" ON "body_profile" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "health_sample" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "health_sample" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "health_sample_owner" ON "health_sample" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "daily_health" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "daily_health" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "daily_health_owner" ON "daily_health" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "baseline" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "baseline" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "baseline_owner" ON "baseline" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "food_entry" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "food_entry" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "food_entry_owner" ON "food_entry" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "food_target" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "food_target" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "food_target_owner" ON "food_target" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "saved_meal" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "saved_meal" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "saved_meal_owner" ON "saved_meal" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "habit" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "habit" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "habit_owner" ON "habit" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "habit_log" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "habit_log" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "habit_log_owner" ON "habit_log" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "record" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "record" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "record_owner" ON "record" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "mission" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mission" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "mission_owner" ON "mission" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "mission_step" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mission_step" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "mission_step_owner" ON "mission_step" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "person" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "person" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "person_owner" ON "person" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "important_date" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "important_date" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "important_date_owner" ON "important_date" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "document" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "document" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "document_owner" ON "document" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "learning_record" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "learning_record" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "learning_record_owner" ON "learning_record" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "plan_day" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "plan_day" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "plan_day_owner" ON "plan_day" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "nudge" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "nudge" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "nudge_owner" ON "nudge" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "bandit_arm" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bandit_arm" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "bandit_arm_owner" ON "bandit_arm" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "memory" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "memory" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "memory_owner" ON "memory" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "prefs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "prefs" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "prefs_owner" ON "prefs" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "devices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "devices" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "devices_owner" ON "devices" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "sync_ops" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sync_ops" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "sync_ops_owner" ON "sync_ops" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "oauth_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "oauth_tokens" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "oauth_tokens_owner" ON "oauth_tokens" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));--> statement-breakpoint
ALTER TABLE "ai_usage" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ai_usage" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "ai_usage_owner" ON "ai_usage" USING ("user_id" = current_setting('app.user_id', true)) WITH CHECK ("user_id" = current_setting('app.user_id', true));
--> statement-breakpoint
-- The API connects as its own role, life_api, created without BYPASSRLS before this runs (see review/phase-21/NOTES.md).
-- Migrations run as the database owner; the API role gets row access only, so it can never alter tables or skip
-- the policies above.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'life_api') THEN
    GRANT USAGE ON SCHEMA public TO life_api;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO life_api;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO life_api;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO life_api;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO life_api;
  END IF;
END $$;
