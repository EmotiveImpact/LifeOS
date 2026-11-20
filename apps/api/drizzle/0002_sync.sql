ALTER TABLE "sync_ops" DROP CONSTRAINT "sync_ops_id_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "sync_ops_user_op" ON "sync_ops" USING btree ("user_id","id");--> statement-breakpoint
CREATE INDEX "sync_ops_user_row" ON "sync_ops" USING btree ("user_id","table_name","row_id");