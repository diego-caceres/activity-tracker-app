# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an activity tracker application built with Next.js that tracks daily todos, habits, and notes. It uses Upstash Redis for data persistence and supports exporting data to Parquet format.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

The development server runs on http://localhost:3000.

## Architecture

### Data Layer (`lib/data.ts`)

The core data management layer uses Upstash Redis with a key-based architecture:

- **Todos**: `todo:day:YYYY-MM-DD` - Stores array of todos for each day
- **Habits**: `habit:day:YYYY-MM-DD` - Stores habit events (logs) for each day
- **Scores**: `score:day:YYYY-MM-DD` - Stores daily score as integer (incremented via `incrby`)
- **Notes**: `notes:day:YYYY-MM-DD` - Stores daily note content
- **Settings**:
  - `settings:habits` - Habit definitions (global)
  - `settings:recurring_todos` - Templates for recurring todos

### Recurring Todos

Recurring todos are implemented via templates stored in `settings:recurring_todos`. When a date is accessed for the first time (via `getTodos`), the system automatically creates instances of all recurring todo templates for that date. Each instance gets a new UUID.

### Habit Scoring System

Habits have types (`healthy` or `unhealthy`) and associated scores. When a habit event is logged:
1. A `HabitEvent` is created with a snapshot of the habit's score at logging time
2. The daily score is updated via Redis `incrby` with the score delta
3. Events are immutable - if a habit definition changes, old events retain their original score

### Server Actions (`app/actions.ts`)

All mutations go through Next.js Server Actions marked with `'use server'`. These actions:
- Modify data via `lib/data.ts` functions
- Call `revalidatePath('/')` to trigger UI refresh
- Handle both todos and habits

### Components

- **DailyLog**: Manages todos and daily notes for a specific date
- **HabitTracker**: Displays habit buttons and tracks habit events. Uses predefined habits from `lib/constants.ts`
- **ScoreGrid**: Calendar view showing daily scores (fetched efficiently for current + previous month only)
- **DateNavigation**: Date picker for navigating between days
- **TodoList**: Component for rendering the todo list UI

### Page Data Loading (`app/page.tsx`)

The main page is server-rendered with `dynamic = 'force-dynamic'`. It:
- Accepts optional `?date=YYYY-MM-DD` search param
- Fetches main view data (todos, habits, score, note) for the selected date in parallel
- Fetches calendar scores efficiently (only current month + previous month, not 365 days)
- Passes data as props to client components

### Export API (`app/api/export/route.ts`)

GET endpoint at `/api/export?date=YYYY-MM-DD` that:
- Exports todos, habits, and score for a given date
- Generates a Parquet file using `@dsnp/parquetjs`
- Returns the file as a download with proper content headers
- Cleans up temp files after generation

## Environment Variables

Required environment variables (add to `.env.local` for local development):

```
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

The app will warn in console if these are missing but won't crash (Redis calls will fail).

For deployment, see `.env.example` for the template and `DEPLOYMENT.md` for detailed deployment instructions.

## TypeScript Paths

The project uses `@/*` path alias to reference the root directory (configured in `tsconfig.json`).

## Key Dependencies

- **Next.js 16**: App Router with React Server Components
- **@upstash/redis**: Serverless Redis client (REST-based)
- **date-fns**: Date manipulation and formatting
- **@dsnp/parquetjs**: Parquet file generation for exports
- **lucide-react**: Icon library
- **Tailwind CSS v4**: Styling with class-based dark mode
- **next-themes**: Theme switching (light/dark mode)

## Deployment

This application is ready for deployment on Vercel. See `DEPLOYMENT.md` for comprehensive deployment instructions including:
- Upstash Redis setup
- Vercel deployment via Dashboard or CLI
- Environment variable configuration
- Custom domain setup
- Troubleshooting guide
