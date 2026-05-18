-- Migration 001: Add portfolio_url and age to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS age INTEGER;
