CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"job" text NOT NULL,
	"model" text NOT NULL,
	"location" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_micros" bigint DEFAULT 0 NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandit_arm" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"context_key" text,
	"arm" text,
	"alpha" double precision,
	"beta" double precision
);
--> statement-breakpoint
CREATE TABLE "baseline" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"metric" text,
	"window_days" integer,
	"mean" double precision,
	"sd" double precision
);
--> statement-breakpoint
CREATE TABLE "body_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"height_cm" double precision,
	"weight_kg" double precision,
	"waist_cm" double precision,
	"body_fat_pct" double precision,
	"sex_at_birth" text,
	"activity_level" text,
	"ethnicity_for_ranges" text,
	"units" jsonb
);
--> statement-breakpoint
CREATE TABLE "daily_health" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"date" text,
	"sleep" jsonb,
	"readiness" jsonb,
	"load" jsonb,
	"signals" jsonb,
	"steps" integer,
	"water_ml" integer
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"platform" text NOT NULL,
	"name" text,
	"push_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"kind" text,
	"expires" text,
	"act_from" text,
	"file_ref" text,
	"fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "food_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"at" text,
	"items" jsonb,
	"photo_ref" text,
	"confirmed" boolean,
	"fit_score" double precision,
	"fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "food_target" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"goal" text,
	"target_weight" double precision,
	"pace" double precision,
	"kcal" double precision,
	"protein" double precision,
	"carbs" double precision,
	"fat" double precision,
	"fibre" double precision,
	"exercise_addback" text
);
--> statement-breakpoint
CREATE TABLE "habit" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"name" text,
	"cue" text,
	"schedule" jsonb,
	"strength" double precision,
	"auto_complete" boolean,
	"fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "habit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"habit_id" text NOT NULL,
	"date" text NOT NULL,
	"done" boolean,
	"source" jsonb
);
--> statement-breakpoint
CREATE TABLE "health_sample" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"type" text,
	"start" text,
	"end" text,
	"value" double precision,
	"unit" text,
	"source" jsonb,
	"device" text,
	"confidence" double precision
);
--> statement-breakpoint
CREATE TABLE "important_date" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"person_id" text,
	"date" text,
	"kind" text,
	"reminder" jsonb
);
--> statement-breakpoint
CREATE TABLE "learning_record" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"topic" text,
	"source" jsonb,
	"level" text,
	"guess" jsonb,
	"puzzles" jsonb,
	"teach_back" jsonb,
	"fsrs" jsonb,
	"led_to" jsonb
);
--> statement-breakpoint
CREATE TABLE "lesson_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"body" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"text" text,
	"embedding" jsonb,
	"source" jsonb,
	"last_used" text
);
--> statement-breakpoint
CREATE TABLE "mission" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"title" text,
	"area" text,
	"stage" text,
	"value" jsonb,
	"due" text,
	"fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "mission_step" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"mission_id" text NOT NULL,
	"state" text,
	"drafts" jsonb,
	"fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "nudge" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"at" text,
	"kind" text,
	"outcome" text,
	"fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "oauth_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"scope" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"name" text,
	"relation" text,
	"contact_ref" text,
	"fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "plan_day" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"date" text,
	"moves" jsonb
);
--> statement-breakpoint
CREATE TABLE "prefs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"look" text,
	"sounds" boolean,
	"haptics" boolean,
	"hand_drawn" boolean,
	"hide_numbers" boolean,
	"notifications" jsonb,
	"private_mode" boolean,
	"fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"name" text,
	"date_of_birth" text,
	"where" jsonb,
	"work" jsonb,
	"household" integer,
	"pay_day" integer,
	"chronotype" jsonb,
	"values" jsonb,
	"big_five" jsonb,
	"level" integer,
	"chapter" text,
	"core_fields" jsonb
);
--> statement-breakpoint
CREATE TABLE "record" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"kind" text,
	"fields" jsonb,
	"source" jsonb,
	"confidence" double precision
);
--> statement-breakpoint
CREATE TABLE "saved_meal" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text,
	"name" text,
	"items" jsonb,
	"default_portion" double precision
);
--> statement-breakpoint
CREATE TABLE "scene_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"body" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sync_ops" (
	"seq" bigserial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"user_id" text NOT NULL,
	"device_id" text,
	"table_name" text NOT NULL,
	"row_id" text NOT NULL,
	"op" text NOT NULL,
	"payload" jsonb NOT NULL,
	"at" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sync_ops_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandit_arm" ADD CONSTRAINT "bandit_arm_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "baseline" ADD CONSTRAINT "baseline_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_profile" ADD CONSTRAINT "body_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_health" ADD CONSTRAINT "daily_health_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_entry" ADD CONSTRAINT "food_entry_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_target" ADD CONSTRAINT "food_target_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit" ADD CONSTRAINT "habit_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_log" ADD CONSTRAINT "habit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_sample" ADD CONSTRAINT "health_sample_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "important_date" ADD CONSTRAINT "important_date_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_record" ADD CONSTRAINT "learning_record_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memory" ADD CONSTRAINT "memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission" ADD CONSTRAINT "mission_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_step" ADD CONSTRAINT "mission_step_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nudge" ADD CONSTRAINT "nudge_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_tokens" ADD CONSTRAINT "oauth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_day" ADD CONSTRAINT "plan_day_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prefs" ADD CONSTRAINT "prefs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record" ADD CONSTRAINT "record_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_meal" ADD CONSTRAINT "saved_meal_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_ops" ADD CONSTRAINT "sync_ops_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "ai_usage_user_at" ON "ai_usage" USING btree ("user_id","at");--> statement-breakpoint
CREATE INDEX "bandit_arm_user" ON "bandit_arm" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "baseline_user" ON "baseline" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "body_profile_user" ON "body_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_health_user" ON "daily_health" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "devices_user" ON "devices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "document_user" ON "document" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "food_entry_user" ON "food_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "food_target_user" ON "food_target" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "habit_user" ON "habit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "habit_log_user" ON "habit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "health_sample_user" ON "health_sample" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "health_sample_user_type_start" ON "health_sample" USING btree ("user_id","type","start");--> statement-breakpoint
CREATE INDEX "important_date_user" ON "important_date" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "learning_record_user" ON "learning_record" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "memory_user" ON "memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mission_user" ON "mission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mission_step_user" ON "mission_step" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "nudge_user" ON "nudge" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "oauth_tokens_user_provider" ON "oauth_tokens" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "person_user" ON "person" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "plan_day_user" ON "plan_day" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prefs_user" ON "prefs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profile_user" ON "profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "record_user" ON "record" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_meal_user" ON "saved_meal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sync_ops_user_seq" ON "sync_ops" USING btree ("user_id","seq");--> statement-breakpoint
CREATE INDEX "verifications_identifier" ON "verifications" USING btree ("identifier");