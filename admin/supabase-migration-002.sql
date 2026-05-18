-- Migration 002: Add title, place, date to gallery
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS place TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS photo_date DATE;
