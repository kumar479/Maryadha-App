/*
  # Create orders and samples tables

  1. New Tables
    - `samples`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, references brands)
      - `factory_id` (uuid, references factories)
      - `status` (enum: requested, in_review, approved, in_production, shipped, delivered, rejected)
      - `tech_pack_url` (text)
      - `sketch_url` (text)
      - `notes` (text)
      - `preferred_moq` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `orders`
      - `id` (uuid, primary key)
      - `sample_id` (uuid, references samples)
      - `brand_id` (uuid, references brands)
      - `factory_id` (uuid, references factories)
      - `status` (enum: draft, pending, confirmed, in_production, quality_check, shipped, delivered, cancelled)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_amount` (decimal)
      - `currency` (text)
      - `payment_status` (enum: pending, partial, paid)
      - `estimated_delivery` (date)
      - `tracking_number` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create sample status enum
CREATE TYPE sample_status AS ENUM (
  'requested',
  'in_review',
  'approved',
  'in_production',
  'shipped',
  'delivered',
  'rejected'
);

-- Create order status enum
CREATE TYPE order_status AS ENUM (
  'draft',
  'pending',
  'confirmed',
  'in_production',
  'quality_check',
  'shipped',
  'delivered',
  'cancelled'
);

-- Create payment status enum
CREATE TYPE payment_status AS ENUM (
  'pending',
  'partial',
  'paid'
);

-- Create samples table
CREATE TABLE IF NOT EXISTS samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id),
  factory_id uuid REFERENCES factories(id),
  status sample_status DEFAULT 'requested',
  tech_pack_url text,
  sketch_url text,
  notes text,
  preferred_moq integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id uuid REFERENCES samples(id),
  brand_id uuid REFERENCES brands(id),
  factory_id uuid REFERENCES factories(id),
  status order_status DEFAULT 'draft',
  quantity integer NOT NULL,
  unit_price decimal(10,2),
  total_amount decimal(10,2),
  currency text DEFAULT 'USD',
  payment_status payment_status DEFAULT 'pending',
  estimated_delivery date,
  tracking_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for samples
CREATE POLICY "Users can view their own samples"
  ON samples
  FOR SELECT
  TO authenticated
  USING (auth.uid() = brand_id);

CREATE POLICY "Users can insert their own samples"
  ON samples
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Users can update their own samples"
  ON samples
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = brand_id);

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = brand_id);

CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = brand_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_samples_updated_at
  BEFORE UPDATE ON samples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();