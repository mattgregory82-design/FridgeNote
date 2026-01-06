# FridgeNote - Smart Shopping List Scanner

## Overview

FridgeNote is a React-based web application that enables users to scan shopping lists using OCR (Optical Character Recognition) technology, organize items by store categories, compare prices across UK supermarket chains, and locate nearby stores. The application features a modern, responsive design using shadcn/ui components and provides a complete shopping assistant experience.

## User Preferences

Preferred communication style: Simple, everyday language.
UK formatting: Uses British spelling (organised not organized), £ currency symbol, miles instead of kilometres.

## System Architecture

The application follows a full-stack TypeScript architecture with a clear separation between client and server components:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks with local storage persistence
- **Data Fetching**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful endpoints for CRUD operations
- **Development**: Hot module reloading with Vite integration

## Key Components

### Core Features
1. **Camera Capture**: Mobile-first camera interface for scanning shopping lists
2. **OCR Processing**: Tesseract.js integration for text recognition from images
3. **Item Organization**: Automatic categorization by store aisle layout
4. **Price Comparison**: Real-time price comparison across UK supermarket chains
5. **Store Locator**: Geolocation-based store finder with distance calculations
6. **Multi-language Support**: Language selector component (framework prepared)

### Database Schema
- **Shopping Lists**: Stores list metadata and items as JSON
- **Stores**: UK supermarket locations with coordinates and opening hours
- **Products**: Price data across multiple supermarket chains (Tesco, Sainsbury's, ASDA, Morrisons)

### UI Components
- Comprehensive shadcn/ui component library implementation
- Responsive design with mobile-first approach
- Custom components for OCR results, organized views, and price comparison
- Dark/light mode support via CSS variables

## Data Flow

1. **Image Capture**: User captures or uploads image of shopping list
2. **OCR Processing**: Tesseract.js processes image and extracts text items
3. **Item Parsing**: Text is cleaned and structured into shopping items with confidence scores
4. **Categorization**: Items are automatically categorized by store aisle/section
5. **Price Lookup**: Product prices are fetched from database for comparison
6. **Store Location**: Geolocation API finds nearby stores with distance calculations
7. **Persistence**: Shopping lists and user preferences saved to local storage

## External Dependencies

### Frontend Dependencies
- **OCR**: Tesseract.js for client-side text recognition
- **UI Components**: Radix UI primitives via shadcn/ui
- **Styling**: Tailwind CSS with custom design tokens
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date formatting
- **Geolocation**: Browser Geolocation API

### Backend Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with Zod validation
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Development**: tsx for TypeScript execution

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Strict type checking enabled
- **Linting**: ESLint configuration
- **Hot Reload**: Vite HMR with error overlay
- **Deployment**: Production build with static asset serving

## Deployment Strategy

### Development
- Vite dev server with Express API integration
- Hot module reloading for rapid development
- Automatic TypeScript compilation
- Development-specific logging and error handling

### Production
- Static asset compilation via Vite build
- Express server serves both API and static files
- Database migrations via Drizzle Kit
- Environment-based configuration for database connections

### Environment Configuration
- `NODE_ENV` for development/production modes
- `DATABASE_URL` for PostgreSQL connection
- Replit-specific optimizations and development tools

The application is designed to be mobile-first with progressive enhancement, supporting both online and offline capabilities through local storage persistence and client-side OCR processing.

## Recent Changes (6 Jan 2026)

### Guided 3-Step UX Flow
✓ Converted app into guided flow: Capture → Review → Organised
✓ Advanced tabs (Price Compare, Find Stores, Order Online) hidden until list confirmed
✓ Auto-navigation to Review tab after items are captured/entered
✓ Added "Continue to Organised List" button in Review step
✓ Added "Add item" input bar at top of Organised View (Enter key support)
✓ Implemented real manual entry with comma/newline parsing
✓ Fixed camera lifecycle - stream stops on component unmount
✓ Install prompt now only shows after user confirms their list

### PWA Implementation
✓ Added Progressive Web App (PWA) support for installable mobile experience
✓ Created manifest.json with app metadata, icons, and shortcuts
✓ Implemented service worker (sw.js) with offline caching strategy
✓ Added cache-first strategy for static assets, network-first for API calls
✓ Created install prompt component for mobile users
✓ Generated custom app icons (192x192 and 512x512 PNG)
✓ Added PWA meta tags for iOS and Android compatibility

### iOS Safari Camera Fixes
✓ Added iOS-safe video attributes: playsInline, muted, autoPlay
✓ Programmatically set playsinline attribute for Safari compatibility
✓ Relaxed facingMode constraint to { ideal: "environment" } with fallback
✓ Explicit play() call after setting srcObject for iOS PWA
✓ Made preview area clickable to start camera (improved UX)
✓ Clear error message with upload fallback when camera fails

### Bug Fixes
✓ Fixed Express trust proxy configuration for Replit environment
✓ Fixed error handler that was causing crashes by rethrowing errors
✓ Fixed React infinite loop in OrganisedView with fingerprint-based change detection
✓ Updated Tesseract.js API calls to v5+ syntax

## Previous Changes (17 Jan 2025)

✓ Updated all UI text to use British English spelling (organised, optimise)
✓ Changed currency formatting to use £ (Pound Sterling) symbols
✓ Updated distance measurements to display in miles instead of kilometres  
✓ Replaced DollarSign icons with PoundSterling icons for price comparison
✓ Fixed TypeScript compilation errors in storage layer
✓ Renamed OrganizedView to OrganisedView component for consistency
✓ Added PostgreSQL database with Neon serverless integration
✓ Created DatabaseStorage class to replace in-memory storage
✓ Implemented database seeding with UK stores and product price data
✓ Successfully migrated from MemStorage to persistent database storage
✓ Added comprehensive "Order Online" tab with delivery and collection options for UK supermarkets
✓ Fixed React hooks errors to ensure proper app functionality
✓ Changed app name from ShopScan to FridgeNote as requested
✓ Fixed infinite loop issue in OrganisedView component
✓ Implemented comprehensive security measures including HTTPS enforcement, XSS protection, CSRF tokens, and input sanitization
✓ Added rate limiting and secure headers via Helmet middleware
✓ Created SafeText component for secure rendering of user-generated content
✓ Validated that all API credentials are server-side only with no sensitive data exposure