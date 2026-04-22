-- AutoTracker Pro - Database Schema
-- Run this in your Supabase SQL Editor

DROP TABLE IF EXISTS public.users CASCADE; -- Force recreation to ensure correct setup
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'mechanic')) DEFAULT 'mechanic',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'mechanic'); -- Default to mechanic
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SYNC EXISTING USERS (Run this if you already have users in Auth)
INSERT INTO public.users (id, email, role)
SELECT id, email, 'mechanic'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT CHECK (type IN ('individual', 'company')) DEFAULT 'individual',
    name TEXT NOT NULL,
    tax_id TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    vin_code TEXT NOT NULL UNIQUE,
    plate_number TEXT NOT NULL UNIQUE,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Service Records Table
CREATE TABLE IF NOT EXISTS public.service_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    mechanic_id UUID, -- References users(id) if auth is enabled
    date DATE DEFAULT CURRENT_DATE,
    mileage INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    parts_cost DECIMAL(10, 2) DEFAULT 0,
    labor_cost DECIMAL(10, 2) DEFAULT 0,
    total_cost DECIMAL(10, 2) DEFAULT 0,
    payment_status TEXT CHECK (payment_status IN ('paid', 'pending')) DEFAULT 'pending',
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'consignment')) DEFAULT 'cash',
    payment_date TIMESTAMPTZ,
    status TEXT DEFAULT 'approved',
    previous_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ADD THESE IF TABLES ALREADY EXIST
-- ALTER TABLE service_records ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('paid', 'pending')) DEFAULT 'pending';
-- ALTER TABLE service_records ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'consignment')) DEFAULT 'cash';
-- ALTER TABLE service_records ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;

-- Enable Row Level Security (RLS) but for internal use you might want to allow all for now
-- or set up specific policies.
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Simple "Allow All" policies for rapid internal prototype (Harden these for production!)
DROP POLICY IF EXISTS "Enable read/write for all users" ON public.clients;
CREATE POLICY "Enable read/write for all users" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.vehicles;
CREATE POLICY "Enable read/write for all users" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read/write for all users" ON public.service_records;
CREATE POLICY "Enable read/write for all users" ON public.service_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for all users" ON public.users;
CREATE POLICY "Enable read for all users" ON public.users FOR SELECT USING (true);

-- IMPORTANT: RUN THIS TO SET YOURSELF AS ADMIN (Replace with your email)
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
