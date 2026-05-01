CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"total" integer NOT NULL,
	"address" jsonb NOT NULL,
	"status" text DEFAULT 'Pending',
	"items" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"category" text,
	"image" text,
	"stock" integer DEFAULT 100,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"mobile" text NOT NULL UNIQUE,
	"name" text,
	"email" text,
	"created_at" timestamp DEFAULT now()
);
