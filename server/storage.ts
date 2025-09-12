import { type User, type InsertUser, type Class, type InsertClass, type Registration, type InsertRegistration, type DiscountCode, type InsertDiscountCode } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, classes, registrations, discountCodes } from "@shared/schema";
import { eq, sql, and, lt } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Class CRUD operations
  getClasses(): Promise<Class[]>;
  getClassById(id: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, updates: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: string): Promise<boolean>;
  
  // Registration CRUD operations
  getRegistrations(): Promise<Registration[]>;
  getRegistrationsByUser(userId: string): Promise<Registration[]>;
  getRegistrationsByClass(classId: string): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistration(id: string, updates: Partial<InsertRegistration>): Promise<Registration | undefined>;
  deleteRegistration(id: string): Promise<boolean>;
  
  // Discount Code CRUD operations
  getDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: string, updates: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined>;
  deleteDiscountCode(id: string): Promise<boolean>;
  validateDiscountCode(code: string): Promise<{ valid: boolean; discountCode?: DiscountCode; reason?: string }>;
  useDiscountCode(code: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private classes: Map<string, Class>;
  private registrations: Map<string, Registration>;
  private discountCodes: Map<string, DiscountCode>;

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.registrations = new Map();
    this.discountCodes = new Map();
  }

  // Helper function to generate random discount code in ABCD-EFGH format
  private generateDiscountCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const part1 = Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const part2 = Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `${part1}-${part2}`;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  // Class CRUD operations
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async getClassById(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = randomUUID();
    const classData: Class = { ...insertClass, id };
    this.classes.set(id, classData);
    return classData;
  }

  async updateClass(id: string, updates: Partial<InsertClass>): Promise<Class | undefined> {
    const existingClass = this.classes.get(id);
    if (!existingClass) {
      return undefined;
    }
    
    const updatedClass: Class = { ...existingClass, ...updates };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.classes.delete(id);
  }

  // Registration CRUD operations
  async getRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  async getRegistrationsByUser(userId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.userId === userId
    );
  }

  async getRegistrationsByClass(classId: string): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      (registration) => registration.classId === classId
    );
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = randomUUID();
    const registration: Registration = { 
      ...insertRegistration, 
      id,
      userId: insertRegistration.userId || null,
      status: insertRegistration.status || "pending",
      paymentIntentId: insertRegistration.paymentIntentId || null,
      amountPaid: insertRegistration.amountPaid || null,
      phone: insertRegistration.phone || null,
      discountCodeId: insertRegistration.discountCodeId || null,
      registrationDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };
    this.registrations.set(id, registration);
    
    // Update class availability
    const classData = this.classes.get(insertRegistration.classId);
    if (classData && classData.available > 0) {
      const updatedClass = { ...classData, available: classData.available - 1 };
      this.classes.set(insertRegistration.classId, updatedClass);
    }
    
    return registration;
  }

  async updateRegistration(id: string, updates: Partial<InsertRegistration>): Promise<Registration | undefined> {
    const existingRegistration = this.registrations.get(id);
    if (!existingRegistration) {
      return undefined;
    }
    
    const updatedRegistration: Registration = { ...existingRegistration, ...updates };
    this.registrations.set(id, updatedRegistration);
    return updatedRegistration;
  }

  async deleteRegistration(id: string): Promise<boolean> {
    const registration = this.registrations.get(id);
    if (registration) {
      // Update class availability when registration is deleted
      const classData = this.classes.get(registration.classId);
      if (classData) {
        const updatedClass = { ...classData, available: classData.available + 1 };
        this.classes.set(registration.classId, updatedClass);
      }
    }
    return this.registrations.delete(id);
  }

  // Discount Code CRUD operations
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return Array.from(this.discountCodes.values());
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    return Array.from(this.discountCodes.values()).find(dc => dc.code === code);
  }

  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const id = randomUUID();
    const code = insertDiscountCode.code || this.generateDiscountCode();
    const discountCode: DiscountCode = {
      ...insertDiscountCode,
      id,
      code,
      expiresAt: new Date(insertDiscountCode.expiresAt),
      isActive: insertDiscountCode.isActive ?? true,
      usedCount: 0,
      maxUses: insertDiscountCode.maxUses || null,
      createdAt: new Date(),
      description: insertDiscountCode.description || null
    };
    this.discountCodes.set(id, discountCode);
    return discountCode;
  }

  async updateDiscountCode(id: string, updates: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const existing = this.discountCodes.get(id);
    if (!existing) return undefined;
    
    const updated: DiscountCode = { ...existing, ...updates };
    this.discountCodes.set(id, updated);
    return updated;
  }

  async deleteDiscountCode(id: string): Promise<boolean> {
    return this.discountCodes.delete(id);
  }

  async validateDiscountCode(code: string): Promise<{ valid: boolean; discountCode?: DiscountCode; reason?: string }> {
    const discountCode = await this.getDiscountCodeByCode(code);
    
    if (!discountCode) {
      return { valid: false, reason: "Invalid discount code" };
    }

    if (!discountCode.isActive) {
      return { valid: false, reason: "This discount code has been deactivated" };
    }

    if (new Date() > new Date(discountCode.expiresAt)) {
      return { valid: false, reason: "This discount code has expired" };
    }

    if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
      return { valid: false, reason: "This discount code has reached its usage limit" };
    }

    return { valid: true, discountCode };
  }

  async useDiscountCode(code: string): Promise<boolean> {
    const validation = await this.validateDiscountCode(code);
    if (!validation.valid || !validation.discountCode) return false;

    const updated = { ...validation.discountCode, usedCount: validation.discountCode.usedCount + 1 };
    this.discountCodes.set(validation.discountCode.id, updated);
    return true;
  }
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Class CRUD operations
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async getClassById(id: string): Promise<Class | undefined> {
    const result = await db.select().from(classes).where(eq(classes.id, id));
    return result[0];
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const result = await db.insert(classes).values(insertClass).returning();
    return result[0];
  }

  async updateClass(id: string, updates: Partial<InsertClass>): Promise<Class | undefined> {
    const result = await db.update(classes).set(updates).where(eq(classes.id, id)).returning();
    return result[0];
  }

  async deleteClass(id: string): Promise<boolean> {
    const result = await db.delete(classes).where(eq(classes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Registration CRUD operations
  async getRegistrations(): Promise<Registration[]> {
    return await db.select().from(registrations);
  }

  async getRegistrationsByUser(userId: string): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.userId, userId));
  }

  async getRegistrationsByClass(classId: string): Promise<Registration[]> {
    return await db.select().from(registrations).where(eq(registrations.classId, classId));
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const result = await db.insert(registrations).values(insertRegistration).returning();
    
    // Update class availability
    if (result[0]) {
      await db.execute(sql`UPDATE classes SET available = available - 1 WHERE id = ${insertRegistration.classId} AND available > 0`);
    }
    
    return result[0];
  }

  async updateRegistration(id: string, updates: Partial<InsertRegistration>): Promise<Registration | undefined> {
    const result = await db.update(registrations).set(updates).where(eq(registrations.id, id)).returning();
    return result[0];
  }

  async deleteRegistration(id: string): Promise<boolean> {
    const registration = await db.select().from(registrations).where(eq(registrations.id, id));
    if (registration[0]) {
      // Update class availability when registration is deleted
      await db.execute(sql`UPDATE classes SET available = available + 1 WHERE id = ${registration[0].classId}`);
    }
    
    const result = await db.delete(registrations).where(eq(registrations.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Helper function to generate random discount code in ABCD-EFGH format
  private generateDiscountCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const part1 = Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const part2 = Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `${part1}-${part2}`;
  }

  // Discount Code CRUD operations
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select().from(discountCodes);
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const result = await db.select().from(discountCodes).where(eq(discountCodes.code, code));
    return result[0];
  }

  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const codeValue = insertDiscountCode.code || this.generateDiscountCode();
    const result = await db.insert(discountCodes).values({
      ...insertDiscountCode,
      code: codeValue,
      expiresAt: new Date(insertDiscountCode.expiresAt),
    }).returning();
    return result[0];
  }

  async updateDiscountCode(id: string, updates: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const updateData: any = { ...updates };
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }
    const result = await db.update(discountCodes).set(updateData).where(eq(discountCodes.id, id)).returning();
    return result[0];
  }

  async deleteDiscountCode(id: string): Promise<boolean> {
    const result = await db.delete(discountCodes).where(eq(discountCodes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async validateDiscountCode(code: string): Promise<{ valid: boolean; discountCode?: DiscountCode; reason?: string }> {
    const discountCode = await this.getDiscountCodeByCode(code);
    
    if (!discountCode) {
      return { valid: false, reason: "Invalid discount code" };
    }

    if (!discountCode.isActive) {
      return { valid: false, reason: "This discount code has been deactivated" };
    }

    if (new Date() > new Date(discountCode.expiresAt)) {
      return { valid: false, reason: "This discount code has expired" };
    }

    if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
      return { valid: false, reason: "This discount code has reached its usage limit" };
    }

    return { valid: true, discountCode };
  }

  async useDiscountCode(code: string): Promise<boolean> {
    const validation = await this.validateDiscountCode(code);
    if (!validation.valid || !validation.discountCode) return false;

    await db.execute(
      sql`UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ${code}`
    );
    return true;
  }
}

export const storage = new DbStorage();
