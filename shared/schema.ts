import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, pgEnum, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const classTypeEnum = pgEnum("class_type", ["BLS", "Heartsaver", "ACLS", "BLS/AED"]);

// Dynamic class types table for flexible type management
export const classTypes = pgTable("class_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // e.g., "BLS", "Heartsaver", "First Aid"
  displayName: text("display_name").notNull(), // e.g., "Basic Life Support", "Heartsaver CPR/AED"
  description: text("description"), // Optional detailed description
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`NOW()`),
});
export const registrationStatusEnum = pgEnum("registration_status", ["pending", "confirmed", "cancelled"]);
export const clientStatusEnum = pgEnum("client_status", ["active", "update", "expired"]);

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Updated users table for Replit Auth compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"), // user or admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: classTypeEnum("type").notNull(), // Keep for backward compatibility
  classTypeId: varchar("class_type_id").references(() => classTypes.id), // New flexible reference
  description: text("description"), // Detailed class description
  image: text("image"), // File path or external URL for class image
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

// Email settings table for configurable email preferences
export const emailSettings = pgTable("email_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderEmail: text("sender_email").notNull().default("noreply@example.com"),
  replyToEmail: text("reply_to_email"), // Reply-to email address (optional, defaults to senderEmail)
  businessName: text("business_name").notNull().default("CPR Training Center"),
  businessPhone: text("business_phone"), // Business phone number
  businessAddress: text("business_address"), // Business address/location
  emailSignature: text("email_signature").default("Thank you for choosing our professional CPR training services!"),
  confirmationEmailTemplate: text("confirmation_email_template"), // Custom email template (optional, uses default if null)
  enableEmailConfirmations: boolean("enable_email_confirmations").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`NOW()`),
});

// Replit Auth user schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertClassTypeSchema = createInsertSchema(classTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
}).partial({
  classTypeId: true, // Make optional for backward compatibility
  description: true,
  image: true,
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

export const insertEmailSettingsSchema = createInsertSchema(emailSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertClassType = z.infer<typeof insertClassTypeSchema>;
export type ClassType = typeof classTypes.$inferSelect;

export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertEmailSettings = z.infer<typeof insertEmailSettingsSchema>;
export type EmailSettings = typeof emailSettings.$inferSelect;
