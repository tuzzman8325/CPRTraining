# CPR Training Business Web Application

## Overview

This is a comprehensive web application for a CPR training business offering American Heart Association (AHA) certified courses. The platform enables students to browse available training courses (BLS Provider and Heartsaver CPR), view class schedules through an interactive calendar, register for classes, and manage their training records. The application also includes an administrative dashboard for instructors to manage classes, student registrations, and business operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system following healthcare industry standards
- **State Management**: React Context for authentication state, TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with secure credential validation
- **API Design**: RESTful API endpoints following Express routing patterns
- **Data Storage**: In-memory storage for development with MemStorage implementation

### Component Architecture
- **Design System**: Professional healthcare-focused design with AHA-inspired color palette (deep red primary, clean white, professional navy)
- **Layout System**: Consistent spacing using Tailwind units (2, 4, 6, 8) for professional appearance
- **Responsive Design**: Mobile-first approach with hamburger navigation and adaptive layouts
- **Accessibility**: Focus on semantic HTML and ARIA compliance through Radix UI components

### Data Models
- **Users**: Authentication with username/password, role-based access (user/admin)
- **Classes**: Course information including BLS Provider and Heartsaver CPR with pricing, capacity, and scheduling
- **Calendar**: Interactive class scheduling with availability tracking

### Security & Authentication
- **Role-Based Access**: Separate user and admin roles with protected routes
- **Protected Routes**: Administrative features restricted to authenticated admin users
- **Session Management**: Secure session handling with proper logout functionality

### Business Logic
- **Course Management**: Two primary course types (BLS Provider for healthcare professionals, Heartsaver for community members)
- **Class Registration**: Students can browse, view details, and register for upcoming classes
- **Administrative Dashboard**: Comprehensive management interface for instructors to oversee operations
- **Professional Branding**: AHA certification emphasis with proper medical training industry standards

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form for modern React development
- **Routing & Navigation**: Wouter for lightweight client-side routing
- **Build Tools**: Vite for development server and production builds, esbuild for server bundling

### UI & Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling Framework**: Tailwind CSS for utility-first styling approach
- **Design System**: shadcn/ui for pre-built, customizable component implementations
- **Typography**: Google Fonts (Inter, Open Sans) for professional appearance

### Backend & Database
- **Database**: Neon PostgreSQL serverless database for production data storage
- **ORM**: Drizzle ORM with Drizzle Kit for database schema management and migrations
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

### Development & DevOps
- **Development Environment**: Replit-specific plugins for cloud development
- **Code Quality**: TypeScript for static type checking across the entire codebase
- **Package Management**: npm with comprehensive dependency management

### Future Integration Points
- **Payment Processing**: Stripe integration prepared for secure class registration payments
- **Email Services**: Email notification system for class confirmations and reminders
- **Calendar Integration**: External calendar sync capabilities for student convenience