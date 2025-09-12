import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const classTypeEnum = pgEnum("class_type", ["BLS", "Heartsaver"]);
export const registrationStatusEnum = pgEnum("registration_status", ["pending", "confirmed", "cancelled"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email"),
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

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  classId: varchar("class_id").notNull().references(() => classes.id),
  status: registrationStatusEnum("status").notNull().default("pending"),
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  amountPaid: integer("amount_paid"), // Amount in cents
  registrationDate: date("registration_date").notNull().default(sql`CURRENT_DATE`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  registrationDate: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;
