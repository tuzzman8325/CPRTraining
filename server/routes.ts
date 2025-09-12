import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertClassSchema, insertRegistrationSchema, insertDiscountCodeSchema } from "@shared/schema";

// Use testing keys in development, live keys in production
const stripeSecretKey = process.env.NODE_ENV === 'development' 
  ? process.env.TESTING_STRIPE_SECRET_KEY 
  : process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(`Missing required Stripe secret: ${process.env.NODE_ENV === 'development' ? 'TESTING_STRIPE_SECRET_KEY' : 'STRIPE_SECRET_KEY'}`);
}

console.log(`Using Stripe in ${process.env.NODE_ENV} mode`);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-08-27.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // Check for admin credentials
      if (username === "admin" && password === "admin123") {
        return res.json({ 
          success: true, 
          user: { username: "admin", role: "admin" },
          message: "Admin login successful"
        });
      }

      // Try to find user in storage
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ 
        success: true, 
        user: { username: user.username, role: "user" },
        message: "Login successful"
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ 
        success: true, 
        user: { username: user.username, role: "user" },
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Class management routes
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getClasses();
      console.log("Database query result:", classes);
      console.log("Number of classes found:", classes.length);
      res.json({ success: true, classes });
    } catch (error) {
      console.error("Get classes error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/classes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const classData = await storage.getClassById(id);
      
      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }

      res.json({ success: true, class: classData });
    } catch (error) {
      console.error("Get class error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      
      res.status(201).json({ 
        success: true, 
        class: newClass,
        message: "Class created successfully"
      });
    } catch (error) {
      console.error("Create class error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid class data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/classes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertClassSchema.partial().parse(req.body);
      
      const updatedClass = await storage.updateClass(id, updates);
      
      if (!updatedClass) {
        return res.status(404).json({ error: "Class not found" });
      }

      res.json({ 
        success: true, 
        class: updatedClass,
        message: "Class updated successfully"
      });
    } catch (error) {
      console.error("Update class error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid class data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteClass(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Class not found" });
      }

      res.json({ 
        success: true,
        message: "Class deleted successfully"
      });
    } catch (error) {
      console.error("Delete class error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Registration routes
  app.get("/api/registrations", async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json({ success: true, registrations });
    } catch (error) {
      console.error("Get registrations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/registrations/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const registrations = await storage.getRegistrationsByUser(userId);
      res.json({ success: true, registrations });
    } catch (error) {
      console.error("Get user registrations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/registrations/class/:classId", async (req, res) => {
    try {
      const { classId } = req.params;
      const registrations = await storage.getRegistrationsByClass(classId);
      res.json({ success: true, registrations });
    } catch (error) {
      console.error("Get class registrations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/registrations", async (req, res) => {
    try {
      console.log("Creating registration with data:", req.body);
      const registrationData = insertRegistrationSchema.parse(req.body);
      console.log("Parsed registration data:", registrationData);
      
      // Check if class exists and has availability
      const classData = await storage.getClassById(registrationData.classId);
      if (!classData) {
        console.log("Class not found:", registrationData.classId);
        return res.status(404).json({ error: "Class not found" });
      }
      
      if (classData.available <= 0) {
        console.log("Class is full:", classData);
        return res.status(400).json({ error: "Class is full" });
      }

      console.log("Creating registration...");
      const registration = await storage.createRegistration(registrationData);
      console.log("Registration created:", registration);
      
      res.status(201).json({ 
        success: true, 
        registration,
        message: "Registration created successfully"
      });
    } catch (error) {
      console.error("Create registration error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid registration data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/registrations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertRegistrationSchema.partial().parse(req.body);
      
      const updatedRegistration = await storage.updateRegistration(id, updates);
      
      if (!updatedRegistration) {
        return res.status(404).json({ error: "Registration not found" });
      }

      res.json({ 
        success: true, 
        registration: updatedRegistration,
        message: "Registration updated successfully"
      });
    } catch (error) {
      console.error("Update registration error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid registration data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/registrations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRegistration(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Registration not found" });
      }

      res.json({ 
        success: true,
        message: "Registration cancelled successfully"
      });
    } catch (error) {
      console.error("Delete registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Discount Code routes
  app.get("/api/discount-codes", async (req, res) => {
    try {
      const discountCodes = await storage.getDiscountCodes();
      res.json({ success: true, discountCodes });
    } catch (error) {
      console.error("Get discount codes error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/discount-codes", async (req, res) => {
    try {
      const discountCodeData = insertDiscountCodeSchema.parse(req.body);
      const discountCode = await storage.createDiscountCode(discountCodeData);
      
      res.status(201).json({ 
        success: true, 
        discountCode,
        message: "Discount code created successfully"
      });
    } catch (error) {
      console.error("Create discount code error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid discount code data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/validate-discount-code", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Discount code is required" });
      }
      
      const validation = await storage.validateDiscountCode(code);
      
      if (validation.valid) {
        res.json({ 
          success: true, 
          valid: true,
          discountCode: validation.discountCode 
        });
      } else {
        res.json({ 
          success: true, 
          valid: false,
          reason: validation.reason 
        });
      }
    } catch (error) {
      console.error("Validate discount code error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/discount-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertDiscountCodeSchema.partial().parse(req.body);
      
      const updatedDiscountCode = await storage.updateDiscountCode(id, updates);
      
      if (!updatedDiscountCode) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      res.json({ 
        success: true, 
        discountCode: updatedDiscountCode,
        message: "Discount code updated successfully"
      });
    } catch (error) {
      console.error("Update discount code error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid discount code data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/discount-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDiscountCode(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Discount code not found" });
      }

      res.json({ 
        success: true,
        message: "Discount code deleted successfully"
      });
    } catch (error) {
      console.error("Delete discount code error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/discount-codes/use", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Discount code is required" });
      }
      
      const success = await storage.useDiscountCode(code);
      
      if (success) {
        res.json({ 
          success: true,
          message: "Discount code used successfully"
        });
      } else {
        res.status(400).json({ 
          success: false,
          error: "Failed to use discount code"
        });
      }
    } catch (error) {
      console.error("Use discount code error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Stripe payment endpoint for class registration
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, classId, classTitle } = req.body;
      
      if (!amount || !classId) {
        return res.status(400).json({ error: "Amount and class ID are required" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          classId,
          classTitle: classTitle || "CPR Training Class"
        }
      });
      
      res.json({ 
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ 
        error: "Error creating payment intent", 
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
