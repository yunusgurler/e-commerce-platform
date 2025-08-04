# E-commerce Platform

## Project Description

This is a full-stack e-commerce application built to demonstrate a production-ish platform with customer shopping flows, admin management, and basic recommendation features. It includes user authentication, product browsing, category filtering, email verification, and an admin dashboard with sales/ customer statistics. Bonus features include seeded dummy data, related products (by embedding/view history), and frequently bought together suggestions.

## Technology Stack

**Frontend**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Ant Design (UI components)
- React Context API (auth/state)
- React Hook Form + Zod (form handling & validation)

**Backend**
- Node.js 18+
- Express.js
- TypeScript (recommended)
- MongoDB (Atlas or local) with Mongoose
- JWT-based authentication (access + refresh tokens)
- bcrypt (password hashing)
- Nodemailer (email verification / reset; Ethereal support for development)
- Zod (validation)
- CORS / basic security middleware

**Recommendation / Intelligence**
- OpenAI (text embeddings for related-by-embedding)
- Custom interaction tracking (views/purchases) for related/frequently-bought-together

## Demo Credentials

Use these seeded accounts for local testing:

- **Admin**
  - Email: `admin@example.com`
  - Password: `Password123!`

- **Customer**
  - Email: `user@example.com`
  - Password: `Password123!`

*(Email verification is pre-marked as verified for these seeded accounts.)*

## Installation Instructions

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB (Atlas connection string or local instance)
- (Optional) OpenAI API Key if using embedding-based recommendations

### Clone and Setup

```bash
# 1. Clone the repo and enter it
git clone https://github.com/yunusgurler/e-commerce-platform.git
cd e-commerce-platform

# 2. Copy example env files for both services
cp backend/.env.copy backend/.env
cp frontend/.env.copy frontend/.env

# 3. In one terminal, start the backend:
cd backend
npm install
npm run dev

# 4. In another terminal, start the frontend:
cd ../frontend
npm install
npm run dev

