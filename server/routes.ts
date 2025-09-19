import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertClassSchema, insertClassTypeSchema, insertRegistrationSchema, insertDiscountCodeSchema, insertClientSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { EmailService } from "./email-service";

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

// Initialize email service
const emailService = new EmailService();

// Configure multer for image uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'attached_assets', 'uploads');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded images statically
  const uploadsPath = path.join(process.cwd(), 'attached_assets', 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/assets/uploads', express.static(uploadsPath));

  // Set up Replit Auth middleware
  await setupAuth(app);

  // Image upload route
  app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Return the relative path that can be used in the frontend
      const imagePath = `/assets/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        imagePath,
        message: 'Image uploaded successfully'
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      
      // Handle multer errors specifically
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
      }
      
      res.status(500).json({ 
        error: error.message || 'Failed to upload image' 
      });
    }
  });

  // Replit Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin-only routes middleware
  const requireAdmin = async (req: any, res: any, next: any) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Shared utility for enriching registrations with discount code data
  async function enrichRegistrationsWithDiscountCodes(registrations: any[]) {
    try {
      const discountCodes = await storage.getDiscountCodes();
      
      // Create maps for fast lookup by both id and code
      const discountCodesByCodeId = new Map();
      const discountCodesByCode = new Map();
      
      discountCodes.forEach(dc => {
        discountCodesByCodeId.set(dc.id, dc);
        discountCodesByCode.set(dc.code, dc);
      });
      
      return registrations.map(registration => {
        let discountCode = null;
        
        // Try to find discount code by discountCodeId first
        if (registration.discountCodeId) {
          discountCode = discountCodesByCodeId.get(registration.discountCodeId);
        }
        
        // If not found by ID, try by code string (for backward compatibility)
        if (!discountCode && registration.discountCode) {
          discountCode = discountCodesByCode.get(registration.discountCode);
        }
        
        // Handle historical data: If no discount code found but registration has characteristics of discount code usage
        // (confirmed status with null payment info), show a generic discount code indicator
        if (!discountCode && registration.status === 'confirmed' && (!registration.amountPaid && !registration.paymentIntentId)) {
          discountCode = {
            code: 'DISCOUNT-USED',
            description: 'Discount code applied (legacy)'
          };
        }
        
        const result = {
          ...registration,
          discountCode: discountCode ? {
            code: discountCode.code,
            description: discountCode.description
          } : null
        };
        
        
        return result;
      });
    } catch (error) {
      console.error('ERROR in enrichment function:', error);
      // Return original registrations if enrichment fails
      return registrations;
    }
  }

  // User management routes (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ success: true, users });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const currentUserId = (req.user as any)?.claims?.sub;
      
      if (!role || (role !== "user" && role !== "admin")) {
        return res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'" });
      }
      
      // Prevent self-demotion to avoid admin lockout
      if (currentUserId === id && role === "user") {
        return res.status(400).json({ 
          error: "You cannot demote your own account to prevent admin lockout. Another admin must perform this action." 
        });
      }
      
      const updatedUser = await storage.updateUserRole(id, role);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        success: true, 
        user: updatedUser,
        message: `User role updated to ${role}` 
      });
    } catch (error) {
      console.error("Update user role error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = (req.user as any)?.claims?.sub;
      
      // Prevent self-deletion to avoid admin lockout
      if (currentUserId === id) {
        return res.status(400).json({ 
          error: "You cannot delete your own account to prevent admin lockout. Another admin must perform this action." 
        });
      }
      
      const result = await storage.deleteUser(id);
      
      if (!result.success) {
        if (result.error) {
          // Return specific constraint error with appropriate status code
          const statusCode = result.registrationCount && result.registrationCount > 0 ? 409 : 404;
          return res.status(statusCode).json({ 
            error: result.error,
            registrationCount: result.registrationCount 
          });
        }
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        success: true,
        message: "User deleted successfully"
      });
    } catch (error) {
      console.error("Delete user error:", error);
      // Handle any uncaught foreign key constraint errors
      if (error instanceof Error && error.message.includes('foreign key constraint')) {
        return res.status(409).json({ 
          error: "Cannot delete user due to existing data dependencies. Please remove all related data first." 
        });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Class Type management routes
  app.get("/api/class-types", async (req, res) => {
    try {
      const classTypes = await storage.getClassTypes();
      res.json({ success: true, classTypes });
    } catch (error) {
      console.error("Get class types error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/class-types/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const classType = await storage.getClassTypeById(id);
      
      if (!classType) {
        return res.status(404).json({ error: "Class type not found" });
      }

      res.json({ success: true, classType });
    } catch (error) {
      console.error("Get class type error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/class-types", requireAdmin, async (req, res) => {
    try {
      const classTypeData = insertClassTypeSchema.parse(req.body);
      const newClassType = await storage.createClassType(classTypeData);
      
      res.status(201).json({ 
        success: true, 
        classType: newClassType,
        message: "Class type created successfully"
      });
    } catch (error) {
      console.error("Create class type error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid class type data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/class-types/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertClassTypeSchema.partial().parse(req.body);
      
      const updatedClassType = await storage.updateClassType(id, updates);
      
      if (!updatedClassType) {
        return res.status(404).json({ error: "Class type not found" });
      }

      res.json({ 
        success: true, 
        classType: updatedClassType,
        message: "Class type updated successfully"
      });
    } catch (error) {
      console.error("Update class type error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid class type data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/class-types/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteClassType(id);
      
      if (!result.success) {
        if (result.classCount && result.classCount > 0) {
          return res.status(409).json({ 
            error: result.error,
            classCount: result.classCount 
          });
        }
        return res.status(404).json({ error: "Class type not found" });
      }

      res.json({ 
        success: true,
        message: "Class type deleted successfully"
      });
    } catch (error) {
      console.error("Delete class type error:", error);
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

  // Put specific routes before parameterized routes
  app.get("/api/classes/grouped-by-type", async (req, res) => {
    try {
      const groupedClasses = await storage.getClassesGroupedByType();
      res.json({ success: true, groupedClasses });
    } catch (error) {
      console.error("Get grouped classes error:", error);
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

  app.post("/api/classes", requireAdmin, async (req, res) => {
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

  app.put("/api/classes/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/classes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.deleteClass(id);
      
      if (!result.success) {
        if (result.error) {
          // Return specific constraint error with appropriate status code
          const statusCode = result.registrationCount && result.registrationCount > 0 ? 409 : 404;
          return res.status(statusCode).json({ 
            error: result.error,
            registrationCount: result.registrationCount 
          });
        }
        return res.status(404).json({ error: "Class not found" });
      }

      res.json({ 
        success: true,
        message: "Class deleted successfully"
      });
    } catch (error) {
      console.error("Delete class error:", error);
      // Handle any uncaught foreign key constraint errors
      if (error instanceof Error && error.message.includes('foreign key constraint')) {
        return res.status(409).json({ 
          error: "Cannot delete class due to existing registrations. Please cancel all registrations first." 
        });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Registration routes
  app.get("/api/registrations", requireAdmin, async (req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      const enrichedRegistrations = await enrichRegistrationsWithDiscountCodes(registrations);
      
      // Force fresh response (disable caching during development)
      res.set('Cache-Control', 'no-store');
      res.json({ success: true, registrations: enrichedRegistrations });
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

      // Create/Update Client Record
      console.log("Processing client record...");
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const classDate = classData.date; // Class date for certification tracking
      const courseType = classData.type; // BLS or Heartsaver
      
      // Check if client already exists by email
      let client = await storage.getClientByEmail(registrationData.email);
      
      if (client) {
        console.log("Updating existing client:", client.id);
        // Update existing client - add course to completedCourses and update lastCourseDate
        const updatedCompletedCourses = [...client.completedCourses];
        if (!updatedCompletedCourses.includes(courseType)) {
          updatedCompletedCourses.push(courseType);
        }
        
        // Calculate certification status based on 2-year rule
        const lastCourseDateObj = new Date(classDate);
        const currentDateObj = new Date(currentDate);
        const daysDiff = (currentDateObj.getTime() - lastCourseDateObj.getTime()) / (1000 * 3600 * 24);
        const certificationStatus = daysDiff <= 730 ? "active" : "expired"; // 2 years = 730 days
        
        await storage.updateClient(client.id, {
          phone: registrationData.phone || client.phone,
          lastCourseDate: classDate,
          completedCourses: updatedCompletedCourses,
          certificationStatus: certificationStatus as "active" | "update" | "expired"
        });
        console.log("Client updated successfully");
      } else {
        console.log("Creating new client record");
        // Create new client record
        const newClientData = {
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: registrationData.email,
          phone: registrationData.phone,
          registrationDate: currentDate,
          lastCourseDate: classDate,
          completedCourses: [courseType],
          certificationStatus: "active" as "active" | "update" | "expired"
        };
        
        client = await storage.createClient(newClientData);
        console.log("New client created:", client.id);
      }

      // Handle discount code processing if provided
      if (registrationData.discountCodeId) {
        console.log("Processing discount code:", registrationData.discountCodeId);
        
        // Validate discount code
        const discountCodes = await storage.getDiscountCodes();
        const discountCode = discountCodes.find(dc => dc.id === registrationData.discountCodeId);
        if (!discountCode || !discountCode.isActive) {
          return res.status(400).json({ error: "Invalid or inactive discount code" });
        }
        
        // Check if discount code has reached usage limit
        if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
          return res.status(400).json({ error: "Discount code usage limit reached" });
        }
        
        // Check if discount code has expired
        if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
          return res.status(400).json({ error: "Discount code has expired" });
        }
        
        console.log("Discount code validated successfully");
        
        // Set payment-related fields for free registration
        registrationData.paymentIntentId = null;
        registrationData.amountPaid = null;
        registrationData.status = 'confirmed';
      }

      console.log("Creating registration...");
      const registration = await storage.createRegistration(registrationData);
      console.log("Registration created:", registration);
      
      // Send confirmation email after successful registration
      try {
        console.log("Attempting to send confirmation email...");
        
        // Get discount code details if applicable
        let discountCode = null;
        if (registrationData.discountCodeId) {
          const discountCodes = await storage.getDiscountCodes();
          discountCode = discountCodes.find(dc => dc.id === registrationData.discountCodeId) || null;
        }
        
        // Calculate payment amount (convert from cents to dollars for email display)
        const paymentAmount = registrationData.amountPaid ? registrationData.amountPaid / 100 : undefined;
        
        // Load email settings for dynamic configuration
        const emailSettings = await storage.getEmailSettings().catch((error) => {
          console.warn('[EMAIL_SETTINGS] Failed to load email settings, using defaults:', error);
          return null;
        });
        
        // Check if email confirmations are enabled before sending
        if (emailSettings && emailSettings.enableEmailConfirmations) {
          // Send confirmation email in fire-and-forget pattern (non-blocking)
          console.log(`[EMAIL_QUEUE] Queuing confirmation email for ${registration.email} (Registration: ${registration.id})`);
          emailService.sendRegistrationConfirmation({
            registration,
            classData,
            discountCode,
            paymentAmount,
            emailSettings
          }).then((result) => {
          if (result.success) {
            console.log(`[EMAIL_SUCCESS] Confirmation email sent to ${registration.email} (Registration: ${registration.id}, Message ID: ${result.messageId})`);
          } else {
            console.error(`[EMAIL_ERROR] Failed to send confirmation email to ${registration.email} (Registration: ${registration.id}): ${result.error}`);
          }
          }).catch((emailError) => {
            console.error(`[EMAIL_ERROR] Email service error for ${registration.email} (Registration: ${registration.id}):`, emailError);
          });
          
          console.log(`[EMAIL_QUEUE] Email queued for background processing`);
        } else {
          console.log(`[EMAIL_SKIP] Email confirmations disabled - skipping email for ${registration.email} (Registration: ${registration.id})`);
        }
      } catch (emailError) {
        // Log email error but don't break the registration process
        console.error(`[EMAIL_ERROR] Failed to queue confirmation email to ${registration.email}:`, emailError);
        console.error("Registration was successful but email queueing failed");
      }
      
      res.status(201).json({ 
        success: true, 
        registration,
        clientId: client.id,
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

  app.put("/api/registrations/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/registrations/:id", requireAdmin, async (req, res) => {
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

  // Discount Code routes (Admin only)
  app.get("/api/discount-codes", requireAdmin, async (req, res) => {
    try {
      const discountCodes = await storage.getDiscountCodes();
      res.json({ success: true, discountCodes });
    } catch (error) {
      console.error("Get discount codes error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/discount-codes", requireAdmin, async (req, res) => {
    try {
      const discountCodeData = insertDiscountCodeSchema.parse(req.body);
      
      // Convert date string to full ISO datetime
      const expiresAtDate = discountCodeData.expiresAt.includes('T') 
        ? discountCodeData.expiresAt 
        : `${discountCodeData.expiresAt}T23:59:59.999Z`;
      
      // Ensure admin user exists, then assign createdBy
      let adminUser = await storage.getUserByUsername('admin@system.local');
      if (!adminUser) {
        adminUser = await storage.createUser({
          email: 'admin@system.local',
          firstName: 'System',
          lastName: 'Admin',
          role: 'admin'
        });
      }
      
      const discountCodeWithCreator = {
        ...discountCodeData,
        expiresAt: expiresAtDate,
        createdBy: adminUser.id
      };
      
      const discountCode = await storage.createDiscountCode(discountCodeWithCreator);
      
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

  app.put("/api/discount-codes/:id", requireAdmin, async (req, res) => {
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

  app.delete("/api/discount-codes/:id", requireAdmin, async (req, res) => {
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

  // Client Management routes (Admin only)
  app.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json({ success: true, clients });
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClientById(id);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json({ success: true, client });
    } catch (error) {
      console.error("Get client error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/clients/email/:email", requireAdmin, async (req, res) => {
    try {
      const { email } = req.params;
      const client = await storage.getClientByEmail(decodeURIComponent(email));
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json({ success: true, client });
    } catch (error) {
      console.error("Get client by email error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = insertClientSchema.partial().parse(req.body);
      
      const updatedClient = await storage.updateClient(id, updates);
      
      if (!updatedClient) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json({ 
        success: true, 
        client: updatedClient,
        message: "Client updated successfully"
      });
    } catch (error) {
      console.error("Update client error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid client data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      
      // Calculate certification status from lastCourseDate
      const storage_any = storage as any;
      const certificationStatus = storage_any.calculateCertificationStatus ? 
        storage_any.calculateCertificationStatus(clientData.lastCourseDate) : 
        "active";
      
      const newClient = await storage.createClient({
        ...clientData,
        certificationStatus
      });
      
      res.status(201).json({ 
        success: true, 
        client: newClient,
        message: "Client created successfully"
      });
    } catch (error) {
      console.error("Create client error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid client data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/clients/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json({ success: true, message: "Client deleted successfully" });
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/classes/:classId/roster", async (req, res) => {
    try {
      const { classId } = req.params;
      
      // Get class details
      const classData = await storage.getClassById(classId);
      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }

      // Get all registrations for this class
      const registrations = await storage.getRegistrationsByClass(classId);
      const enrichedRegistrations = await enrichRegistrationsWithDiscountCodes(registrations);

      // Force fresh response (disable caching during development)
      res.set('Cache-Control', 'no-store');
      res.json({ 
        success: true, 
        classData,
        registrations: enrichedRegistrations
      });
    } catch (error) {
      console.error("Get class roster error:", error);
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

  // Email Settings endpoints
  app.get("/api/email-settings", requireAdmin, async (req, res) => {
    try {
      const emailSettings = await storage.getEmailSettings();
      res.json({ 
        success: true, 
        emailSettings 
      });
    } catch (error) {
      console.error("Get email settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/email-settings", requireAdmin, async (req, res) => {
    try {
      // Validate the request body using zod schema
      const updates = insertEmailSettingsSchema.partial().parse(req.body);
      
      const updatedSettings = await storage.updateEmailSettings(updates);
      
      res.json({ 
        success: true, 
        emailSettings: updatedSettings,
        message: "Email settings updated successfully"
      });
    } catch (error) {
      console.error("Update email settings error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid email settings data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email Settings test endpoint
  app.post("/api/email-settings/test", requireAdmin, async (req, res) => {
    try {
      const { testRecipient } = req.body;
      
      if (!testRecipient) {
        return res.status(400).json({ error: "Test recipient email is required" });
      }
      
      // Validate email format using the EmailService validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const dangerousChars = /[\r\n\0]/;
      
      if (!emailRegex.test(testRecipient) || dangerousChars.test(testRecipient) || testRecipient.length > 254) {
        return res.status(400).json({ error: "Invalid or unsafe email format" });
      }
      
      // Get current email settings
      const emailSettings = await storage.getEmailSettings();
      
      // Create a mock registration data for testing
      const mockRegistrationData = {
        registration: {
          id: "test-registration-" + Date.now(),
          firstName: "Test",
          lastName: "User",
          email: testRecipient,
          phone: "(555) 123-4567",
          classId: "test-class",
          userId: null,
          discountCodeId: null,
          paymentIntentId: "pi_test_" + Date.now(),
          amountPaid: 8500, // $85.00 in cents
          status: "confirmed" as const,
          registrationDate: new Date().toISOString().split('T')[0],
        },
        classData: {
          id: "test-class",
          title: "Test CPR Training Class",
          type: "BLS" as const,
          classTypeId: "test-type",
          description: "This is a test email for your CPR training system configuration.",
          image: null,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          time: "10:00 AM",
          duration: "4 hours",
          capacity: 12,
          available: 8,
          price: 8500 // $85.00 in cents
        },
        paymentAmount: 85.00, // Amount in dollars (converted from cents in registration route)
        emailSettings
      };
      
      // Send the test email
      const emailResult = await emailService.sendRegistrationConfirmation(mockRegistrationData);
      
      if (emailResult.success) {
        res.json({ 
          success: true,
          message: `Test email sent successfully to ${testRecipient}`,
          messageId: emailResult.messageId
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: emailResult.error || "Failed to send test email. Please check your email configuration."
        });
      }
    } catch (error: any) {
      console.error("Send test email error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to send test email", 
        message: error.message 
      });
    }
  });

  // Legacy email testing endpoint (keeping for backward compatibility)
  app.post("/api/send-test-email", requireAdmin, async (req, res) => {
    try {
      const { testRecipient } = req.body;
      
      if (!testRecipient) {
        return res.status(400).json({ error: "Test recipient email is required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(testRecipient)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Get current email settings
      const emailSettings = await storage.getEmailSettings();
      
      // Create a mock registration data for testing
      const mockRegistrationData = {
        registration: {
          id: "test-registration",
          firstName: "Test",
          lastName: "User",
          email: testRecipient,
          phone: "(555) 123-4567",
          emergencyContact: "Emergency Contact",
          emergencyPhone: "(555) 987-6543",
          classId: "test-class",
          userId: null,
          discountCode: null,
          discountCodeId: null,
          paymentIntentId: null,
          amountPaid: null,
          status: "confirmed" as const,
          registrationDate: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        classData: {
          id: "test-class",
          title: "Test CPR Training Class",
          type: "BLS" as const,
          classTypeId: "test-type",
          description: "This is a test email for your CPR training system configuration.",
          image: null,
          date: new Date().toISOString().split('T')[0],
          time: "10:00",
          duration: "4 hours",
          capacity: 12,
          available: 8,
          price: 8500 // $85.00 in cents
        },
        paymentAmount: 85
      };
      
      // Add email settings to mock data (emailSettings already loaded above)
      mockRegistrationData.emailSettings = emailSettings;
      
      // Send the test email
      const emailSent = await emailService.sendRegistrationConfirmation(mockRegistrationData);
      
      if (emailSent) {
        res.json({ 
          success: true,
          message: `Test email sent successfully to ${testRecipient}`
        });
      } else {
        res.status(500).json({ 
          error: "Failed to send test email. Please check your email configuration." 
        });
      }
    } catch (error: any) {
      console.error("Send test email error:", error);
      res.status(500).json({ 
        error: "Failed to send test email", 
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
