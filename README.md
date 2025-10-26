# 🏨 Dolly Hotel — Next.js Hotel Management System

A modern, production-grade **hotel booking and management platform** built with **Next.js**, offering dynamic room categories, pricing, galleries, and an admin management system.

---

## ✨ Recent Updates (December 2024)

### 🎉 Major Enhancements

* ✅ **Fixed Favicon Issue** — Now works seamlessly across all domains
* ✅ **Migrated to UploadThing** — Replaced Cloudinary for faster, more stable file handling
* ✅ **Improved Error Handling** — Added safe fallbacks for missing media assets
* ✅ **Vercel Optimization** — Enhanced performance on serverless environments
* ✅ **Reliable File Uploads** — No more unwanted auto-deletions


## ⚖️ Legal Notice

This project, **Dolly Hotel – Next.js Hotel Management System**, and all associated files, assets, and documentation are the **intellectual property** of the **Lodge digital Development Team**.

Unauthorized reproduction, distribution, modification, or use of this codebase — in part or in whole — **for commercial, educational, or professional purposes** without **prior written consent** from the project maintainers is strictly prohibited.

> 🚨 Any individual, company, or organization found using this template or its derivatives **without explicit permission** will be subject to **legal action** under applicable intellectual property and copyright laws.

For licensing inquiries, permissions, or professional use, please **contact the project owner or authorized representative before use**.

📧 **Contact:** [[your-email@example.com](mailto:dollyhotel001@gmail.com)]

---

## 🚀 Core Features

### 🌐 Public User Features

* **Home Page** — Hero video/slider highlighting hotel visuals
* **Room Categories** — Detailed view of room types with real-time availability
* **Pricing Page** — Transparent hourly pricing structure
* **Gallery Page** — Filterable photo gallery (Exterior, Rooms, Dining, Amenities)
* **Contact Section** — Essential booking and contact details
* **Public Access** — No user registration required

### 🔒 Admin Portal

* **Secure Login (JWT Auth)** — Single admin access only
* **Category Management** — Create, edit, and remove room categories
* **Price Management** — Manage hourly rates dynamically
* **Gallery Management** — Upload images/videos and tag them by category
* **Room Availability Tracking** — Manage room count in real-time
* **File Uploads** — Supports images (≤ 4MB) and videos (≤ 64MB)

---

## 🧰 Tech Stack

| Layer                    | Technology                                    |
| ------------------------ | --------------------------------------------- |
| **Frontend**             | Next.js 15 (App Router), React 19, TypeScript |
| **Backend**              | Next.js API Routes (Serverless)               |
| **Database**             | PostgreSQL (Neon) with Prisma ORM             |
| **Auth**                 | JWT with HTTP-only cookies                    |
| **Storage**              | UploadThing                                   |
| **Styling**              | Tailwind CSS                                  |
| **Validation**           | Zod                                           |
| **Client Data Fetching** | SWR                                           |
| **Hosting**              | Vercel                                        |

---

## ⚙️ Prerequisites

* **Node.js 18+**
* **PostgreSQL** (Neon recommended)
* **UploadThing Account** (Free tier works fine)

---

## ⚡ Quick Start

### 1️⃣ Clone & Install

```bash
git clone <repository-url>
cd dolly-final
npm install
```

### 2️⃣ Environment Setup

Create a `.env.local` file:

```env
# UploadThing (Required)
UPLOADTHING_SECRET=sk_live_xxxxxxxxxxxxxxxxxxxxx
UPLOADTHING_APP_ID=your_app_id

# Database
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# App URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Admin Auth
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

> 🔗 Get keys from [UploadThing Dashboard](https://uploadthing.com/dashboard)

You can also copy the example environment file:

```bash
cp .env.example .env
```

---

### 3️⃣ Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

---

### 4️⃣ Start Development

```bash
npm run dev
```

Now open 👉 [http://localhost:3000](http://localhost:3000)

---

## 🧩 Database Models Overview

### **Admin**

* Single superuser with hashed password authentication

### **HotelCategory**

* Represents room types
* Includes specs (AC, WiFi, TV, etc.) and available room count

### **Price**

* Hourly pricing for each category
* Supports 2, 4, and 24-hour rates (stored in cents)

### **GalleryImage**

* Categorized images (Exterior, Rooms, Dining, Amenities)
* Metadata stored in database for fast access

---

## 🔌 API Endpoints

### Public APIs

```bash
GET /api/categories
GET /api/prices
GET /api/prices?categoryId=1
GET /api/gallery
GET /api/gallery?category=Rooms
```

### Admin APIs (JWT Required)

```bash
# Auth
POST /api/auth
DELETE /api/auth

# Categories
GET /api/admin/categories
POST /api/admin/categories
PUT /api/admin/categories/:id
DELETE /api/admin/categories/:id

# Prices
GET /api/admin/prices
POST /api/admin/prices

# Gallery
GET /api/admin/gallery
POST /api/admin/gallery
DELETE /api/admin/gallery/:id
```

---

## 🏕️ Room Categories

1. **Attached AC + Single Bed** — AC, attached bathroom, WiFi, TV, Geyser, CCTV, Parking
2. **Attached Non-AC Single Bed** — Fan cooling, attached bathroom, essential amenities
3. **Non-Attached Single Bed** — Shared bathroom, basic amenities

---

## 🖼️ Gallery Categories

* **Exterior** — Hotel facade and surroundings
* **Rooms** — Interiors and furnishings
* **Dining** — Restaurant and food visuals
* **Amenities** — Common facilities and reception area

---

## 🔐 Admin Access

**Default Credentials:**

```bash
Email: admin@dollyhotel.com
Password: admin123
```

**Admin Privileges:**

* Manage categories, pricing, and gallery
* Track room availability
* View booking inquiries

---

## 🎬 Hardcoded Videos

* **Home Page:** Rotating 60s promotional video
* **Room Categories:** One video per category

Defined in `/lib/config.ts` and streamed via Cloudinary.

---

## 🧪 Testing

```bash
npm test
# or
npm run test:coverage
```

---

## 📱 Responsiveness

Fully optimized for:

* Desktop (≥1024px)
* Tablet (768–1023px)
* Mobile (≤767px)

---

## 🔄 Data Flow Overview

1. Public pages → SSR with API caching
2. Admin dashboard → Client-side + SWR revalidation
3. Authentication → JWT + HTTP-only cookies
4. File uploads → UploadThing direct uploads

---

## 🚀 Deployment

### Production Variables

```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Commands

```bash
npm run build
npm start
```

---

## 🔁 Migration Highlights (From Express + React)

* Replaced **Express** backend with **Next.js API Routes**
* Adopted **Server Components** for performance
* Shifted to **Prisma ORM**
* Rewritten in **TypeScript**
* Secured with **HTTP-only JWT cookies**

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch
3. Make your changes + add tests
4. Submit a pull request

---

## 📜 License

Released under the **MIT License**

---

## 🆘 Support

For issues:

1. Check existing GitHub issues
2. Open a new issue with detailed context (logs, env setup, etc.)

---

## 🧭 Roadmap / TODO

* [ ] Email notifications for bookings
* [ ] Real-time availability sync
* [ ] Booking calendar integration
* [ ] Dedicated mobile API endpoints
* [ ] Advanced analytics dashboard

---

**Keep Building. Keep Shipping.** 🚀
**– The Lodge Digital Dev Team**
