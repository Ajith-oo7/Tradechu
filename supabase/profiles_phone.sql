-- Extend profiles for Expo phone OTP login
-- Run after schema.sql

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text;

-- Phone auth users: allow profile insert on first verify
-- (RLS policies from schema.sql already cover insert own)
