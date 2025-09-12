import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const classTypeEnum = pgEnum("class_type", ["BLS", "Heartsaver"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: classTypeEnum("type").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  duration: text("duration").notNull(),
  capacity: integer("capacity").notNull(),
  available: integer("available").notNull(),
  price: integer("price").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;
