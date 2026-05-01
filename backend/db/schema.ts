import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  mobile: text().notNull().unique(),
  name: text(),
  email: text(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: text().notNull(),
  price: integer().notNull(),
  category: text(),
  image: text(),
  stock: integer().default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial().primaryKey(),
  total: integer().notNull(),
  address: jsonb().notNull(),
  status: text().default("Pending"),
  items: jsonb().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
