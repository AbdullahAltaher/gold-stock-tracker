-- ============================================================
-- DHABAB — Gold & Stock Tracker: Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── watchlist ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol      TEXT NOT NULL,
  market      TEXT NOT NULL DEFAULT 'DFM',
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watchlist" ON watchlist USING (auth.uid() = user_id);

-- ── transactions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('stock', 'gold')),
  -- Stock fields
  symbol        TEXT,
  market        TEXT,
  quantity      NUMERIC,
  price_aed     NUMERIC,
  -- Gold fields
  carat         TEXT CHECK (carat IN ('24K','22K','21K','18K')),
  weight_grams  NUMERIC,
  total_aed     NUMERIC,
  -- Common
  notes         TEXT,
  purchased_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions" ON transactions USING (auth.uid() = user_id);

-- ── gold_settings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gold_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  multiplier  NUMERIC NOT NULL DEFAULT 1.013,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gold_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gold settings" ON gold_settings USING (auth.uid() = user_id);

-- ── Function: auto-create profile on signup ──────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  INSERT INTO public.gold_settings (user_id, multiplier)
  VALUES (NEW.id, 1.013);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
