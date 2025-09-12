import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClassSchema, insertRegistrationSchema } from "@shared/schema";

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
      const registrationData = insertRegistrationSchema.parse(req.body);
      
      // Check if class exists and has availability
      const classData = await storage.getClassById(registrationData.classId);
      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }
      
      if (classData.available <= 0) {
        return res.status(400).json({ error: "Class is full" });
      }

      const registration = await storage.createRegistration(registrationData);
      
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

  const httpServer = createServer(app);

  return httpServer;
}
