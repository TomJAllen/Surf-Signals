# Surf Signals

A web application for learning and practicing Surf Life Saving Australia (SLSA) signals through interactive flashcard training.

## Overview

Surf Signals helps lifesavers and trainees master the hand signals used in surf lifesaving operations. Users can test their knowledge by identifying signals from images or practice performing signals themselves.

### Features

- **Identify Mode**: See a signal image and select the correct name from multiple choices
- **Perform Mode**: Given a signal name, practice performing it physically and compare with reference images
- **Progress Tracking**: Monitor accuracy and improvement over time with detailed statistics
- **Study Sessions**: Configurable sessions with customizable signal counts and category filters
- **Signal Categories**: Water signals, Land signals, and IRB (Inflatable Rescue Boat) signals

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (credentials provider)
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit tests), Playwright (E2E tests)

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
│   │   ├── analytics/    # Analytics tracking
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
│   ├── analytics.ts      # Analytics utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── localStorage.ts   # Client-side storage
│   └── prisma.ts         # Prisma client instance
├── types/
│   └── index.ts          # TypeScript type definitions
└── __tests__/            # Unit tests
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Seed data (16 signals)
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

Create a `.env` file with:

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
npm run db:push      # Push schema to database
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

### Water Signals (3)
Signals given in or from the water:
- Assistance Required
- All Clear
- Pick Up Swimmers

### Land Signals (8)
Signals given from the beach/shore:
- Return to Shore
- Go Further Out
- Move Left / Move Right
- Remain Stationary
- Message Received/Understood
- Investigate
- Stop

### IRB Signals (5)
Signals for Inflatable Rescue Boat operations:
- Increase Speed
- Decrease Speed
- Turn Left / Turn Right
- Stop Engine
