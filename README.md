# Athletix - One Platform for Every Sports Event

Athletix is a modern, premium full-stack SaaS Sports Event Registration System built with **React (Vite + TypeScript)**, **Tailwind CSS**, **NestJS**, **Prisma ORM**, **PostgreSQL**, and **Midtrans Snap API**.

## Monorepo Structure

```
athletix/
├── frontend/      # React (Vite, TypeScript, Tailwind CSS, TanStack Query, Recharts)
├── backend/       # NestJS (TypeScript, Prisma ORM, PostgreSQL, JWT Auth, Swagger)
└── docker-compose.yml # PostgreSQL DB Container setup
```

## Quickstart Guide

### 1. Database Setup (Docker)
Ensure Docker is installed and running, then start the PostgreSQL instance:
```bash
docker-compose up -d
```
Connection string: `postgresql://athletix_user:athletix_secret_password_2026@localhost:5432/athletix?schema=public`

### 2. Backend Configuration & Seeding
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```
- **API Documentation**: Available via Swagger UI at `http://localhost:3000/api/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Access the web application at `http://localhost:5173`

---
## Roles & Test Credentials (Auto-seeded)

- **Super Admin**: `admin@athletix.com` / `Password@123`
- **Organizers**: 
  - `organizer1@athletix.com` / `Password@123` (Jakarta Running Hub)
  - `organizer2@athletix.com` / `Password@123` (Nusa Cycling Club)
  - `organizer3@athletix.com` / `Password@123` (Garuda Smash Badminton)
- **Participants**: `participant1@athletix.com` to `participant10@athletix.com` / `Password@123`
