CREATE TABLE "manual_review_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"platform" varchar(50),
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"user_id" integer,
	"assigned_to" integer,
	"priority" integer DEFAULT 0,
	"attempts" integer DEFAULT 0,
	"last_error" text,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "manual_review_queue_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customs_fee_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "manual_review_queue" ADD CONSTRAINT "manual_review_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_review_queue" ADD CONSTRAINT "manual_review_queue_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "manual_review_status_idx" ON "manual_review_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "manual_review_created_at_idx" ON "manual_review_queue" USING btree ("created_at");