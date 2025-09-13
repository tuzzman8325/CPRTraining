import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, pgEnum, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const classTypeEnum = pgEnum("class_type", ["BLS", "Heartsaver"]);
export const registrationStatusEnum = pgEnum("registration_status", ["pending", "confirmed", "cancelled"]);
export const clientStatusEnum = pgEnum("client_status", ["active", "update", "expired"]);

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
  userId: varchar("user_id").references(() => users.id),
  classId: varchar("class_id").notNull().references(() => classes.id),
  status: registrationStatusEnum("status").notNull().default("pending"),
  paymentIntentId: text("payment_intent_id"), // Stripe payment intent ID
  amountPaid: integer("amount_paid"), // Amount in cents
  registrationDate: date("registration_date").notNull().default(sql`CURRENT_DATE`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  discountCodeId: varchar("discount_code_id").references(() => discountCodes.id), // Reference to discount code used
});

export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 9 }).notNull().unique(), // Format: ABCD-EFGH
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  usedCount: integer("used_count").notNull().default(0),
  maxUses: integer("max_uses"), // null means unlimited uses
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
  description: text("description"), // Optional description for the code
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  registrationDate: date("registration_date").notNull(), // Date of first course registration
  lastCourseDate: date("last_course_date").notNull(), // Date of most recent course completion
  completedCourses: text("completed_courses").array().notNull().default(sql`ARRAY[]::text[]`), // Array of completed course types
  certificationStatus: clientStatusEnum("certification_status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`NOW()`),
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
}).partial({
  userId: true,
  discountCodeId: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
  usedCount: true,
  createdBy: true, // Let backend assign this
}).extend({
  expiresAt: z.string().min(1, "Expiration date is required"), // Accept any date string
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  registrationDate: z.string().min(1, "Registration date is required"),
  lastCourseDate: z.string().min(1, "Last course date is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
