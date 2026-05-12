# 🪙 Dhabab — Gold & Stock Tracker

A full-stack UAE market tracker for gold prices (24K/22K/21K/18K) and stocks listed on DFM & ADX.
Built with **React + Vite**, **Supabase**, **Tailwind CSS v3**, and deployed on **Vercel**.

---

## Features

| Feature | Details |
|---|---|
| 🔐 Auth | Email/password via Supabase Auth |
| 📊 Dashboard | XAU/USD live price, gold carat summary, top movers |
| 📈 Stocks | DFM & ADX quotes via Yahoo Finance (SALIK, PARKN, EMAAR, DIB, etc.) |
| 🪙 Gold | 24K / 22K / 21K / 18K prices per gram, weight table |
| 📁 Portfolio | Add stock & gold buy transactions, P&L vs current price |
| ⚙️ Calibration | Local market multiplier — set manually or derive from a real purchase |
| 🌙 Dark theme | Custom Tailwind dark palette |

---

## Gold Price Formula

```
price_per_gram = (XAU/USD × 3.6725 ÷ 31.1035) × multiplier × carat_purity
```

- **XAU/USD** from `https://api.metals.live/v1/spot/gold` (free, no key)
- **AED/USD** fixed at 3.6725 (UAE peg)
- **Default multiplier**: `1.013` (calibrated from Sharjah Central Market)
- Calibration example: 20g of 24K for AED 10,860 → multiplier = 1.013

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd gold-stock-tracker
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. In the **SQL Editor**, run the contents of `supabase_schema.sql`
3. Copy your **Project URL** and **anon public key**

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Run locally

```bash
npm run dev
```

The Vite dev server proxies `/api/metals/*` → `api.metals.live` and `/api/yahoo/*` → `query1.finance.yahoo.com` to avoid CORS issues.

---

## Deploy to Vercel

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — `vercel.json` handles API rewrites and SPA routing automatically

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `profiles` | User display name, auto-created on signup |
| `watchlist` | User's saved stock symbols |
| `transactions` | Stock & gold buy history |
| `gold_settings` | Per-user market multiplier |

All tables have Row Level Security (RLS) — users only access their own rows.

---

## Tech Stack

- **React 18** + **Vite 5**
- **Tailwind CSS v3** — custom dark palette, gold gradient tokens
- **Supabase** — Postgres + Auth + RLS
- **React Router v6**
- **Recharts** — bar charts for portfolio
- **Lucide React** — icons
- **Vercel** — hosting + edge rewrites for CORS

---

## Stock Symbols (Yahoo Finance format)

| Symbol | Name | Market |
|---|---|---|
| SALIK.DFM | Salik | DFM |
| PARKN.DFM | Parkin | DFM |
| EMAAR.DFM | Emaar Properties | DFM |
| DIB.DFM | Dubai Islamic Bank | DFM |
| EMIRATES.DFM | Emirates NBD | DFM |
| DU.DFM | Emirates Integrated | DFM |
| DEWA.DFM | DEWA | DFM |
| FAB.ADX | First Abu Dhabi Bank | ADX |
| ETISALAT.ADX | e& (Etisalat) | ADX |
| ADNOC.ADX | ADNOC Distribution | ADX |

---

## License

MIT
