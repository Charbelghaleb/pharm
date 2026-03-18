-- PharmaClear Foundation Schema
-- Core tables: pharmacies and users

-- Enums
CREATE TYPE pharmacy_type AS ENUM (
  'retail', 'specialty', 'ltc', 'compounding', '340b',
  'mail_order', 'hospital_outpatient', 'physician_office'
);

CREATE TYPE pms_system AS ENUM (
  'primerx', 'pioneerrx', 'qs1', 'liberty', 'bestrx',
  'rx30', 'datascan', 'computer_rx', 'other'
);

CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'enterprise');

CREATE TYPE user_role AS ENUM ('owner', 'pharmacist', 'technician', 'admin');

-- Pharmacies table
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  npi TEXT UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT CHECK (char_length(state) = 2),
  zip TEXT,
  phone TEXT,
  pharmacy_type pharmacy_type DEFAULT 'retail',
  pms_system pms_system DEFAULT 'other',
  subscription_tier subscription_tier DEFAULT 'starter',
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users table (linked to Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'technician',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_pharmacy ON users(pharmacy_id);
CREATE INDEX idx_pharmacies_npi ON pharmacies(npi);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pharmacies_updated_at
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Pharmacies: users can only see their own pharmacy
CREATE POLICY pharmacies_select ON pharmacies
  FOR SELECT TO authenticated
  USING (id IN (SELECT pharmacy_id FROM users WHERE users.id = auth.uid()));

CREATE POLICY pharmacies_update ON pharmacies
  FOR UPDATE TO authenticated
  USING (id IN (SELECT pharmacy_id FROM users WHERE users.id = auth.uid() AND users.role IN ('owner', 'admin')));

-- Users: can see users in their pharmacy
CREATE POLICY users_select ON users
  FOR SELECT TO authenticated
  USING (pharmacy_id IN (SELECT pharmacy_id FROM users u WHERE u.id = auth.uid()));

CREATE POLICY users_insert ON users
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY users_update ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid());
