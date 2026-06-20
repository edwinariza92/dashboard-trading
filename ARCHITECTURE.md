# Trading Dashboard - Architecture

## Overview

Single-page application (SPA) for tracking and analyzing cryptocurrency trades. Built with React 19, TypeScript, and Vite. Uses Zustand for state management with localStorage persistence and optional Supabase cloud sync.

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | React | 19.2.6 |
| Language | TypeScript | ~6.0.2 |
| Build Tool | Vite | 8.0.12 |
| Styling | Tailwind CSS | 4.3.1 |
| State | Zustand | 5.0.14 |
| Routing | React Router DOM | 7.17.0 |
| Charts | Recharts | 3.8.1 |
| Icons | Lucide React | 1.18.0 |
| AI | Google Gemini | 2.8.0 |
| Backend | Supabase (optional) | 2.108.2 |

## Project Structure

```
trading-dashboard/
├── public/                          # Static assets
├── src/
│   ├── main.tsx                     # React entry point
│   ├── App.tsx                      # Router configuration
│   ├── index.css                    # Tailwind imports + theme
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx           # Main layout wrapper
│   │   │   └── Sidebar.tsx          # Navigation sidebar
│   │   │
│   │   ├── trades/
│   │   │   ├── TradeForm.tsx        # Create/edit trade modal
│   │   │   ├── TradeTable.tsx       # Trade history table
│   │   │   └── ScreenshotUploader.tsx # AI screenshot analysis
│   │   │
│   │   └── dashboard/
│   │       ├── EquityChart.tsx      # Equity curve chart
│   │       ├── MetricCards.tsx      # Summary metrics
│   │       ├── PerformanceCalendar.tsx # Monthly performance
│   │       ├── RMultipleDistribution.tsx # R-multiple histogram
│   │       ├── SetupPerformance.tsx # Performance by setup
│   │       └── BehavioralAnalytics.tsx # Behavioral metrics
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx            # Main dashboard view
│   │   ├── Trades.tsx               # Trade history + table
│   │   ├── Analytics.tsx            # Advanced analytics
│   │   ├── Login.tsx                # Authentication
│   │   └── Settings.tsx             # Config + data export
│   │
│   ├── store/
│   │   ├── tradeStore.ts            # Zustand trade state
│   │   └── authStore.ts             # Zustand auth state
│   │
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client init
│   │   ├── supabaseService.ts       # CRUD + auth helpers
│   │   └── gemini.ts                # Gemini Vision API service
│   │
│   ├── types/
│   │   └── trade.ts                 # Trade type definitions
│   │
│   ├── data/
│   │   └── seedTrades.ts            # Example trades for demo
│   │
│   └── utils/
│       ├── exportCsv.ts             # CSV export helper
│       └── useSize.ts               # ResizeObserver hook
│
├── .env.example                     # Environment variables template
├── package.json                     # Dependencies
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
└── ARCHITECTURE.md                  # This file
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Redirect → `/dashboard` | Default redirect |
| `/login` | Login | Email/password authentication |
| `/dashboard` | Dashboard | Main metrics + charts |
| `/trades` | Trades | Trade history + CRUD |
| `/analytics` | Analytics | Advanced analytics |
| `/settings` | Settings | Config, export, SQL schema |

## Data Model

### Trade Interface

```typescript
interface Trade {
  // Core
  id: string
  pair: string              // e.g., "BTC/USDT"
  exchange: string          // e.g., "Binance"
  side: 'long' | 'short'
  entryDate: string
  exitDate: string
  entryPrice: number
  exitPrice: number
  quantity: number
  stopLoss: number
  takeProfit: number
  fees: number
  fundingFees: number

  // Analysis
  setup: string             // breakout|reversal|scalping|trend_following|range|news|other
  tags: string[]
  notes: string

  // Computed
  result: number            // P&L
  rMultiple: number         // result / risk

  // Behavioral
  emotion: 'neutral' | 'anxious' | 'confident' | 'impatient' | 'fearful' | 'greedy'
  ruleAdherence: boolean
  revengeTrade: boolean
  mistakeType: '' | 'late-entry' | 'early-exit' | 'no-stop-loss' | 'moved-stop' | 'overtrade' | 'revenge' | 'fomo' | 'other'

  isExample?: boolean       // Marks seed data
}
```

### P&L Calculation

```
Long:  result = (exitPrice - entryPrice) * quantity - fees - fundingFees
Short: result = (entryPrice - exitPrice) * quantity - fees - fundingFees

risk = abs(entryPrice - stopLoss) * quantity
rMultiple = result / risk
```

## AI Integration: Screenshot Analysis

### Overview

Users can upload a trading screenshot and use Gemini Vision AI to automatically extract trade details (pair, prices, dates, etc.) and populate the trade form.

### Flow

```
Upload Screenshot → Convert to Base64 → Send to Gemini API → Parse JSON Response → Fill Form
```

### Components

| File | Purpose |
|------|---------|
| `src/lib/gemini.ts` | Gemini API client + prompt + data types |
| `src/components/trades/ScreenshotUploader.tsx` | Drag-and-drop upload UI + analysis trigger |

### Gemini Service (`src/lib/gemini.ts`)

- Uses `@google/genai` SDK
- Model: `gemini-2.0-flash`
- Accepts inline base64 images (max 20MB)
- Returns structured JSON with trade data
- Handles parsing and error recovery

### ScreenshotUploader Component

- Drag-and-drop or click-to-select
- Image preview before analysis
- Loading state with spinner
- Error display
- Calls `onAnalysisComplete` callback with extracted data

### Required Environment Variable

```
VITE_GEMINI_API_KEY=your-gemini-api-key
```

Get a free API key at: https://aistudio.google.com/apikey

## State Management

### Zustand Stores

**tradeStore** (`src/store/tradeStore.ts`):
- `trades: Trade[]` - All trades
- `addTrade(data)` - Create trade (computes result + rMultiple)
- `updateTrade(id, data)` - Update trade
- `deleteTrade(id)` - Delete trade
- `loadExamples()` - Load seed data
- `removeExamples()` - Remove seed data
- Persisted to localStorage

**authStore** (`src/store/authStore.ts`):
- `user: User | null` - Current user
- `signIn(email, password)` - Sign in via Supabase
- `signOut()` - Sign out

## Supabase Integration (Optional)

### Configuration

Set environment variables:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Features

- Email/password authentication
- Cloud sync of trades table
- Row-level security (user-scoped data)

### Database Schema

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  pair TEXT NOT NULL,
  exchange TEXT,
  side TEXT CHECK (side IN ('long', 'short')),
  entry_date TIMESTAMPTZ,
  exit_date TIMESTAMPTZ,
  entry_price NUMERIC,
  exit_price NUMERIC,
  quantity NUMERIC,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  fees NUMERIC DEFAULT 0,
  funding_fees NUMERIC DEFAULT 0,
  setup TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  result NUMERIC,
  r_multiple NUMERIC,
  emotion TEXT,
  rule_adherence BOOLEAN DEFAULT true,
  revenge_trade BOOLEAN DEFAULT false,
  mistake_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own trades
CREATE POLICY "Users can CRUD own trades"
  ON trades FOR ALL
  USING (auth.uid() = user_id);
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | No | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `VITE_GEMINI_API_KEY` | Yes* | Google Gemini API key |

*Required only for AI screenshot analysis feature. App works without it.
