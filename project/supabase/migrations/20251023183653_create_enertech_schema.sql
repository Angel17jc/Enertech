/*
  # Enertech Platform - Energy Consumption Optimization System
  
  ## Overview
  Complete database schema for Enertech, a web platform for energy consumption optimization.
  Supports multi-language (ES/EN), user roles (admin/user), and comprehensive energy tracking.

  ## New Tables
  
  ### `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'user' or 'admin'
  - `preferred_language` (text) - 'es' or 'en'
  - `theme` (text) - 'light' or 'dark'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `devices`
  Electronic devices/appliances registered by users
  - `id` (uuid, PK) - Device identifier
  - `user_id` (uuid, FK) - Owner of the device
  - `name` (text) - Device name
  - `device_type` (text) - Type: 'refrigerator', 'air_conditioner', 'washing_machine', etc.
  - `watts` (integer) - Power consumption in watts
  - `hours_per_day` (decimal) - Average daily usage hours
  - `is_active` (boolean) - Whether device is currently tracked
  - `created_at` (timestamptz) - Registration date

  ### `consumption_records`
  Historical energy consumption records
  - `id` (uuid, PK) - Record identifier
  - `user_id` (uuid, FK) - User who owns this record
  - `date` (date) - Date of consumption
  - `kwh_consumed` (decimal) - Kilowatt-hours consumed
  - `cost` (decimal) - Cost in currency
  - `notes` (text) - Optional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### `energy_goals`
  User-defined energy saving goals
  - `id` (uuid, PK) - Goal identifier
  - `user_id` (uuid, FK) - User who set the goal
  - `target_kwh` (decimal) - Target kWh to achieve
  - `start_date` (date) - Goal start date
  - `end_date` (date) - Goal end date
  - `status` (text) - 'active', 'completed', 'failed'
  - `created_at` (timestamptz) - Goal creation date

  ### `recommendations`
  System-generated or admin-created energy saving recommendations
  - `id` (uuid, PK) - Recommendation identifier
  - `title_es` (text) - Title in Spanish
  - `title_en` (text) - Title in English
  - `description_es` (text) - Description in Spanish
  - `description_en` (text) - Description in English
  - `category` (text) - Category: 'heating', 'cooling', 'lighting', 'appliances', 'general'
  - `potential_savings_percent` (integer) - Estimated savings percentage
  - `is_active` (boolean) - Whether recommendation is shown to users
  - `created_at` (timestamptz) - Creation date

  ### `user_recommendations`
  Personalized recommendations assigned to users
  - `id` (uuid, PK) - Assignment identifier
  - `user_id` (uuid, FK) - Target user
  - `recommendation_id` (uuid, FK) - Recommendation reference
  - `status` (text) - 'pending', 'applied', 'dismissed'
  - `created_at` (timestamptz) - Assignment date

  ### `electricity_rates`
  Configurable electricity rates (managed by admins)
  - `id` (uuid, PK) - Rate identifier
  - `rate_name` (text) - Rate name
  - `cost_per_kwh` (decimal) - Cost per kilowatt-hour
  - `currency` (text) - Currency code (USD, EUR, etc.)
  - `is_default` (boolean) - Whether this is the default rate
  - `valid_from` (date) - Rate validity start date
  - `created_at` (timestamptz) - Creation date

  ## Security
  
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Admins have full access to manage system data
  - Public cannot access any data without authentication

  ## Policies
  
  ### Restrictive by default
  All tables locked down after enabling RLS. Access granted only through explicit policies.

  ### User policies
  - Users can read/update their own profile
  - Users can CRUD their own devices, consumption records, and goals
  - Users can view active recommendations and their assignments

  ### Admin policies
  - Admins can view all users (read-only on profiles)
  - Admins can CRUD recommendations and electricity rates
  - Admins can view aggregated consumption data

  ## Notes
  
  1. All timestamps use `timestamptz` for proper timezone handling
  2. Cascading deletes configured for referential integrity
  3. Default values set for optimal user experience
  4. Indexes added for frequently queried columns (user_id, date ranges)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferred_language text DEFAULT 'es' CHECK (preferred_language IN ('es', 'en')),
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- DEVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  device_type text NOT NULL CHECK (device_type IN (
    'refrigerator', 'air_conditioner', 'washing_machine', 
    'dryer', 'dishwasher', 'television', 'computer', 
    'water_heater', 'lighting', 'oven', 'microwave', 'other'
  )),
  watts integer NOT NULL CHECK (watts > 0),
  hours_per_day decimal(5,2) NOT NULL DEFAULT 0 CHECK (hours_per_day >= 0 AND hours_per_day <= 24),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON devices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON devices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON devices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(is_active) WHERE is_active = true;

-- =====================================================
-- CONSUMPTION RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS consumption_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  kwh_consumed decimal(10,2) NOT NULL CHECK (kwh_consumed >= 0),
  cost decimal(10,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE consumption_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consumption records"
  ON consumption_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consumption records"
  ON consumption_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consumption records"
  ON consumption_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own consumption records"
  ON consumption_records FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consumption records"
  ON consumption_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_consumption_user_id ON consumption_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_date ON consumption_records(date DESC);

-- =====================================================
-- ENERGY GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS energy_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_kwh decimal(10,2) NOT NULL CHECK (target_kwh > 0),
  start_date date NOT NULL,
  end_date date NOT NULL CHECK (end_date >= start_date),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE energy_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own energy goals"
  ON energy_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own energy goals"
  ON energy_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own energy goals"
  ON energy_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own energy goals"
  ON energy_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON energy_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON energy_goals(status) WHERE status = 'active';

-- =====================================================
-- RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_es text NOT NULL,
  title_en text NOT NULL,
  description_es text NOT NULL,
  description_en text NOT NULL,
  category text NOT NULL CHECK (category IN ('heating', 'cooling', 'lighting', 'appliances', 'general')),
  potential_savings_percent integer CHECK (potential_savings_percent >= 0 AND potential_savings_percent <= 100),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert recommendations"
  ON recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete recommendations"
  ON recommendations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_recommendations_active ON recommendations(is_active) WHERE is_active = true;

-- =====================================================
-- USER RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_recommendations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_id uuid NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recommendation_id)
);

ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendation assignments"
  ON user_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendation status"
  ON user_recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert user recommendations"
  ON user_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_status ON user_recommendations(status);

-- =====================================================
-- ELECTRICITY RATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS electricity_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rate_name text NOT NULL,
  cost_per_kwh decimal(10,4) NOT NULL CHECK (cost_per_kwh > 0),
  currency text DEFAULT 'USD' NOT NULL,
  is_default boolean DEFAULT false,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE electricity_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view electricity rates"
  ON electricity_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert electricity rates"
  ON electricity_rates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update electricity rates"
  ON electricity_rates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete electricity rates"
  ON electricity_rates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_electricity_rates_default ON electricity_rates(is_default) WHERE is_default = true;

-- =====================================================
-- SEED DATA: Default Electricity Rate
-- =====================================================
INSERT INTO electricity_rates (rate_name, cost_per_kwh, currency, is_default, valid_from)
VALUES ('Standard Rate', 0.12, 'USD', true, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Default Recommendations
-- =====================================================
INSERT INTO recommendations (title_es, title_en, description_es, description_en, category, potential_savings_percent, is_active) VALUES
(
  'Ajusta tu termostato',
  'Adjust your thermostat',
  'Reducir la temperatura en invierno y aumentarla en verano puede ahorrar hasta un 10% en costos de energía.',
  'Lowering temperature in winter and raising it in summer can save up to 10% on energy costs.',
  'heating',
  10,
  true
),
(
  'Usa iluminación LED',
  'Use LED lighting',
  'Reemplazar bombillas incandescentes por LED puede reducir el consumo de iluminación hasta en un 75%.',
  'Replacing incandescent bulbs with LEDs can reduce lighting consumption by up to 75%.',
  'lighting',
  75,
  true
),
(
  'Desconecta dispositivos en standby',
  'Unplug standby devices',
  'Los dispositivos en modo espera consumen energía. Desconectarlos cuando no se usan puede ahorrar un 5-10% mensual.',
  'Devices in standby mode consume energy. Unplugging them when not in use can save 5-10% monthly.',
  'appliances',
  8,
  true
),
(
  'Limpia los filtros del aire acondicionado',
  'Clean air conditioner filters',
  'Filtros limpios mejoran la eficiencia del aire acondicionado hasta en un 15%.',
  'Clean filters improve air conditioner efficiency by up to 15%.',
  'cooling',
  15,
  true
),
(
  'Usa electrodomésticos eficientes',
  'Use efficient appliances',
  'Electrodomésticos con certificación de eficiencia energética consumen hasta 50% menos energía.',
  'Energy-efficient certified appliances consume up to 50% less energy.',
  'appliances',
  50,
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();