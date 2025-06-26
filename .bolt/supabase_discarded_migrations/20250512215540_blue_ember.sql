/*
  # Fix Sample Data

  1. Updates
    - Fixes UUIDs to match auth.users table
    - Adds missing required fields
    - Ensures enum values match defined types
    - Adds timestamps for created_at/updated_at
  
  2. Data Changes
    - Updates brands data
    - Updates reps data with complete profile info
    - Updates factories with complete details
    - Updates samples with correct status enum
    - Updates orders with correct status enum
    - Adds chat participants
*/

-- Clear existing test data
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE group_chats CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE samples CASCADE;
TRUNCATE TABLE factories CASCADE;
TRUNCATE TABLE reps CASCADE;
TRUNCATE TABLE brands CASCADE;

-- Insert test brands
INSERT INTO brands (id, name, email, website, logo_url)
VALUES
  ('00000000-0000-4000-a000-000000000000', 'Leather & Co', 'contact@leatherandco.com', 'https://leatherandco.com', 'https://example.com/logo1.png'),
  ('00000000-0000-4000-a000-000000000001', 'Urban Hides', 'hello@urbanhides.com', 'https://urbanhides.com', 'https://example.com/logo2.png');

-- Insert test reps
INSERT INTO reps (id, user_id, name, email, active, public_name, phone, bio, profile_image)
VALUES
  ('00000000-0000-4000-b000-000000000000', '00000000-0000-4000-c000-000000000000', 'Sarah Chen', 'sarah.chen@maryadha.com', true, 'Sarah Chen', '+1234567890', 'Expert in luxury leather sourcing with 5+ years experience', 'https://example.com/sarah.jpg'),
  ('00000000-0000-4000-b000-000000000001', '00000000-0000-4000-c000-000000000001', 'Michael Kim', 'michael.kim@maryadha.com', true, 'Michael Kim', '+1234567891', 'Specializing in sustainable leather manufacturing', 'https://example.com/michael.jpg');

-- Insert test factories
INSERT INTO factories (id, name, location, description, minimum_order_quantity, leather_types, verified, created_at, updated_at)
VALUES
  ('00000000-0000-4000-d000-000000000000', 'Khader Leathers', 'Chennai, India', 'Premium leather manufacturer since 1978', 50, ARRAY['Distressed', 'Polished']::leather_type[], true, NOW(), NOW()),
  ('00000000-0000-4000-d000-000000000001', 'Arora Fine Leathers', 'Delhi, India', 'Luxury leather crafting since 1992', 75, ARRAY['Matte', 'Pebbled']::leather_type[], true, NOW(), NOW());

-- Insert test samples
INSERT INTO samples (id, brand_id, factory_id, rep_id, status, file_url, comments, created_at, updated_at)
VALUES
  ('00000000-0000-4000-e000-000000000000', '00000000-0000-4000-a000-000000000000', '00000000-0000-4000-d000-000000000000', '00000000-0000-4000-b000-000000000000', 'in_review', 'https://example.com/sample1.pdf', 'Looking for distressed finish', NOW(), NOW()),
  ('00000000-0000-4000-e000-000000000001', '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-d000-000000000001', '00000000-0000-4000-b000-000000000001', 'requested', 'https://example.com/sample2.pdf', 'Need matte finish sample', NOW(), NOW());

-- Insert test orders
INSERT INTO orders (id, brand_id, factory_id, rep_id, status, quantity, unit_price, total_amount, currency, payment_status, created_at, updated_at)
VALUES
  ('00000000-0000-4000-f000-000000000000', '00000000-0000-4000-a000-000000000000', '00000000-0000-4000-d000-000000000000', '00000000-0000-4000-b000-000000000000', 'in_production', 100, 45.99, 4599.00, 'USD', 'partial', NOW(), NOW()),
  ('00000000-0000-4000-f000-000000000001', '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-d000-000000000001', '00000000-0000-4000-b000-000000000001', 'confirmed', 50, 89.99, 4499.50, 'USD', 'pending', NOW(), NOW());

-- Insert test group chats
INSERT INTO group_chats (id, order_id, brand_id, factory_id, created_at, updated_at)
VALUES
  ('00000000-0000-4000-g000-000000000000', '00000000-0000-4000-f000-000000000000', '00000000-0000-4000-a000-000000000000', '00000000-0000-4000-d000-000000000000', NOW(), NOW()),
  ('00000000-0000-4000-g000-000000000001', '00000000-0000-4000-f000-000000000001', '00000000-0000-4000-a000-000000000001', '00000000-0000-4000-d000-000000000001', NOW(), NOW());

-- Insert chat participants
INSERT INTO chat_participants (id, chat_id, user_id, role, created_at)
VALUES
  -- First chat participants
  ('00000000-0000-4000-h000-000000000000', '00000000-0000-4000-g000-000000000000', '00000000-0000-4000-a000-000000000000', 'brand', NOW()),
  ('00000000-0000-4000-h000-000000000001', '00000000-0000-4000-g000-000000000000', '00000000-0000-4000-c000-000000000000', 'rep', NOW()),
  -- Second chat participants  
  ('00000000-0000-4000-h000-000000000002', '00000000-0000-4000-g000-000000000001', '00000000-0000-4000-a000-000000000001', 'brand', NOW()),
  ('00000000-0000-4000-h000-000000000003', '00000000-0000-4000-g000-000000000001', '00000000-0000-4000-c000-000000000001', 'rep', NOW());

-- Insert test messages
INSERT INTO messages (id, chat_id, sender_id, text, created_at)
VALUES
  ('00000000-0000-4000-i000-000000000000', '00000000-0000-4000-g000-000000000000', '00000000-0000-4000-c000-000000000000', 'Production has started on your order', NOW() - INTERVAL '2 days'),
  ('00000000-0000-4000-i000-000000000001', '00000000-0000-4000-g000-000000000001', '00000000-0000-4000-c000-000000000001', 'Your order has been confirmed', NOW() - INTERVAL '1 day');