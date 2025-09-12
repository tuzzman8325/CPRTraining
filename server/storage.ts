import { type User, type InsertUser, type Class, type InsertClass, type Registration, type InsertRegistration } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private classes: Map<string, Class>;
  private registrations: Map<string, Registration>;

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.registrations = new Map();
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
      status: insertRegistration.status || "pending",
      paymentIntentId: insertRegistration.paymentIntentId || null,
      amountPaid: insertRegistration.amountPaid || null,
      phone: insertRegistration.phone || null,
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
}

export const storage = new MemStorage();
