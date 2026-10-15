# Surf Signals

A web application for learning and practicing Surf Life Saving Australia (SLSA) signals through interactive flashcard training.

## Overview

Surf Signals helps lifesavers and trainees master the hand signals used in surf lifesaving operations. Users can test their knowledge by identifying signals from images or practice performing signals themselves.

### Features

- **Identify Mode**: See a signal image and select the correct name from multiple choices
- **Perform Mode**: Given a signal name, perform it; the camera checks arm position and movement, or you can self-assess
- **Progress Tracking**: Monitor accuracy and improvement over time with detailed statistics
- **Study Sessions**: Configurable sessions with customizable signal counts and category filters
- **Signal Categories**: Beach-to-water and water-to-beach signals
- **Guest Mode**: Practise without an account; progress is kept in the browser and imported on sign-in
- **Admin**: Edit pose hints and upload signal images (stored in Vercel Blob)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (credentials provider)
- **Styling**: Tailwind CSS
- **Pose detection**: MediaPipe Tasks Vision (in-browser)
- **Hosting**: Vercel (Postgres via Neon, images via Vercel Blob, Vercel Analytics)
- **Testing**: Vitest (unit tests), Playwright (E2E tests), GitHub Actions CI

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login and signup pages
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/      # Authenticated routes
│   │   ├── dashboard/    # User dashboard with stats
│   │   ├── history/      # Session history
│   │   └── study/
│   │       ├── identify/ # Identify mode study page
│   │       └── perform/  # Perform mode study page
│   ├── api/
│   │   ├── attempts/     # Record study attempts
│   │   ├── auth/         # NextAuth routes
│   │   ├── signals/      # Signal data API
│   │   └── stats/        # User statistics
│   └── layout.tsx
├── components/
│   ├── FlashCard.tsx     # Main flashcard component
│   ├── NavBar.tsx        # Navigation bar
│   ├── ProgressBar.tsx   # Progress indicator
│   ├── SessionProvider.tsx
│   ├── SessionSetup.tsx  # Configure study session
│   ├── SessionSummary.tsx # Results after session
│   └── SignalImage.tsx   # Signal image display
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── localStorage.ts   # Client-side storage
│   └── prisma.ts         # Prisma client instance
├── types/
│   └── index.ts          # TypeScript type definitions
└── __tests__/            # Unit tests
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Seed data (14 signals + admin user)
e2e/                      # Playwright E2E tests
```

## Database Schema

- **User**: Registered users with email/password authentication
- **Signal**: Lifesaving signals with name, description, image URL, optional video URL, and category
- **Attempt**: Individual study attempts tracking signal, mode, and correctness
- **StudySession**: Groups of attempts in a single study session with overall stats

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Environment Variables

Copy `.env.example` to `.env` and fill it in. The essentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/surf_signals"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Installation

```bash
# Install dependencies
npm install

# Set up database
npm run db:deploy    # Apply migrations
npm run db:seed      # Seed with signal data

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema changes to database |
| `npm run db:seed` | Seed database with signals |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run unit tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |

## Signal Categories

Signals are grouped by direction. The source of truth is `prisma/seed.ts`; images live in `public/signals/`.

### Beach to Water (8)
Given from the beach to people in the water:
- Attract Attention *(waving)*
- Pick Up Swimmers
- Proceed Further Out to Sea
- Go to the Right or Left
- Remain Stationary
- Message Understood, All Clear
- Pick Up or Adjust Buoys *(circling)*
- Return to Shore

### Water to Beach (6)
Given from the water back to the beach:
- Assistance Required *(waving)*
- Shore Signal Received and Understood
- Emergency Evacuation Alarm
- Submerged Victim Missing
- All Clear / OK
- Powercraft Wishes to Return to Shore *(circling)*

## Pose Detection

Perform mode uses MediaPipe Pose Landmarker in the browser (`src/lib/pose/`). Each signal has one or more definitions in `signalDefinitions.ts` (arm positions, hands touching, extra checks, and optional `motion: "wave" | "circle"`). Motion is judged over the last ~2 seconds of frames, relative to shoulder width (`motion.ts`). A signal matches only when every criterion is met for several consecutive frames.

Some signals share an arm position and can't be told apart by the camera (e.g. Return to Shore and Message Understood). After a match the app lists those lookalikes so the user can check the description.
