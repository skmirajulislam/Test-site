# Dolly Hotel — Next.js Hotel Management System

A modern hotel booking website built with Next.js, featuring room categories, pricing, gallery, and admin management.

## ✨ Recent Updates (December 2024)

### 🎉 Major Improvements
- ✅ **Fixed Favicon**: Now works on all domains including custom domains
- ✅ **Migrated to UploadThing**: Replaced Cloudinary for better reliability and performance
- ✅ **Enhanced Error Handling**: Added fallbacks for missing images/videos
- ✅ **Optimized for Vercel**: Better serverless performance
- ✅ **Improved File Uploads**: More stable, no auto-deletion issues

### 📚 New Documentation
- **`MIGRATION_COMPLETE.md`** - Quick summary of changes
- **`ENVIRONMENT_SETUP.md`** - Environment variables guide
- **`MIGRATION_GUIDE.md`** - Detailed migration documentation
- **`DEPLOYMENT_GUIDE.md`** - Production deployment instructions

## 🚀 Features

### Public Features
- **Home Page**: Hero video/slider showcasing hotel
- **Room Categories**: Display room types with availability and specs
- **Pricing**: Transparent hourly pricing for all room types
- **Gallery**: Photo gallery with category filtering (Exterior, Rooms, Dining, Amenities)
- **Contact**: Information and booking contact details
- **No User Registration**: All pages publicly accessible

### Admin Features
- **Single Admin Login**: Secure JWT authentication
- **Category Management**: CRUD for room categories and specifications
- **Price Management**: Manage hourly pricing
- **Gallery Management**: Upload images/videos with category tagging
- **Room Count Tracking**: Update availability
- **File Upload**: Support for images (4MB) and videos (64MB)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **File Storage**: UploadThing (formerly Cloudinary)
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Data Fetching**: SWR for client-side caching
- **Hosting**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- UploadThing account (free tier available)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd dolly-final
npm install
```

### 2. Environment Setup

Create `.env.local` with:

```env
# UploadThing (Required)
UPLOADTHING_SECRET=sk_live_xxxxxxxxxxxxxxxxxxxxx
UPLOADTHING_APP_ID=your_app_id

# Database (Required)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# App URLs (Required)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Admin Auth (Required)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

**Get UploadThing Keys**: https://uploadthing.com/dashboard

See `ENVIRONMENT_SETUP.md` for detailed instructions.

```bash
cp .env.example .env
```

Configure your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dollyhotel"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
ADMIN_EMAIL=admin@dollyhotel.com
ADMIN_PASSWORD=admin123

# Next.js
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

### Models

#### Admin
- Single admin user for management
- Bcrypt hashed passwords

#### HotelCategory
- Room categories (attach-ac-single, attach-nonac-single, nonattach-single)
- Specifications (AC, WiFi, TV, etc.)
- Room count for availability
- Optional hardcoded video URL

#### Price
- Hourly pricing per category
- Support for 2, 4, 24 hour rates
- Stored in cents for precision

#### GalleryImage
- Images categorized by: Exterior, Rooms, Dining, Amenities
- Cloudinary integration with public_id
- Optional association with room categories

## 🔧 API Endpoints

### Public APIs

```bash
GET /api/categories          # List all room categories
GET /api/prices              # Get all prices
GET /api/prices?categoryId=1 # Get prices for specific category
GET /api/gallery             # Get all gallery images
GET /api/gallery?category=Rooms # Get images by category
```

### Admin APIs (Authentication Required)

```bash
# Authentication
POST /api/auth               # Admin login
DELETE /api/auth             # Admin logout

# Categories
GET /api/admin/categories    # List categories (admin view)
POST /api/admin/categories   # Create category
PUT /api/admin/categories/:id # Update category
DELETE /api/admin/categories/:id # Delete category

# Prices
GET /api/admin/prices        # List all prices
POST /api/admin/prices       # Create price

# Gallery
GET /api/admin/gallery       # List all images
POST /api/admin/gallery      # Upload image
DELETE /api/admin/gallery/:id # Delete image
```

## 🎨 Room Categories

The system supports three predefined room categories:

1. **Attached AC + Single Bed**
   - Air conditioning
   - Attached bathroom
   - WiFi, TV, Geyser, CCTV, Parking

2. **Attached Non-AC Single Bed**
   - Fan cooling
   - Attached bathroom
   - WiFi, TV, Geyser, CCTV, Parking

3. **Non-Attached Single Bed**
   - Shared bathroom
   - Basic amenities
   - WiFi, Geyser, CCTV, Parking

## 🖼️ Gallery Categories

Images are organized into four categories:

- **Exterior**: Hotel building, entrance, surroundings
- **Rooms**: Room interiors, beds, furniture
- **Dining**: Restaurant areas, food (kept for visual purposes only)
- **Amenities**: Reception, facilities, common areas

## 🔐 Admin Access

**Default Admin Credentials:**
- Email: `admin@dollyhotel.com`
- Password: `admin123`

**Admin Functions:**
- Update room specifications and availability
- Manage hourly pricing
- Upload and categorize images
- View booking inquiries

## 🎬 Hardcoded Videos

Video content is hardcoded and cannot be changed through admin:

- **Home Slider**: Mixed content cycling every 60 seconds
- **Category Videos**: One video per room category (60 seconds each)

Videos are defined in `/lib/config.ts` and served from Cloudinary.

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔄 Data Flow

1. **Public Pages**: Server-side rendered with cached API calls
2. **Admin Pages**: Client-side with SWR for real-time updates
3. **Authentication**: HTTP-only cookies with JWT tokens
4. **File Uploads**: Direct to Cloudinary with database metadata

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
# ... other variables
```

### Build Commands

```bash
npm run build
npm start
```

## 📝 Migration from Express + React

This application replaces the traditional Express backend and React frontend with:

- **Next.js API Routes** instead of Express endpoints
- **Server Components** for better performance
- **Prisma ORM** instead of manual SQL
- **TypeScript** for better development experience
- **Modern Authentication** with secure cookies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and environment details

## 📋 TODO

- [ ] Add email notifications for bookings
- [ ] Implement real-time availability tracking
- [ ] Add booking calendar integration
- [ ] Mobile app API endpoints
- [ ] Advanced analytics dashboard

---

**Happy Coding!** 🎉
#   d o l l y - f i n a l 
 
 #   d o l l y - f i n a l 
 
 
