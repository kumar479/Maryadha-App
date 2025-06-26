/*
  # Add Sample Data

  1. Test Data
    - Add test users (brands and reps)
    - Add sample factories
    - Add sample orders and samples
    - Add test messages and chats
  
  2. Relationships
    - Link orders to brands, factories, and reps
    - Link samples to brands, factories, and reps
    - Create chat groups with participants
*/

-- Insert test brands
INSERT INTO brands (id, name, email, website, logo_url)
VALUES
  ('d0d1e23a-0d1e-4e7d-9e4a-6f8b9c2d3e4f', 'Leather & Co', 'contact@leatherandco.com', 'https://leatherandco.com', ''),
  ('e1e2f34b-1e2f-5f8e-af5b-7f9c0d3e4f5g', 'Urban Hides', 'hello@urbanhides.com', 'https://urbanhides.com', '');

-- Insert test reps
INSERT INTO reps (id, user_id, name, email, active, public_name)
VALUES
  ('f2f3g45c-2f3g-6g9f-bg6c-8g0d1e4f5g6h', 'f2f3g45c-2f3g-6g9f-bg6c-8g0d1e4f5g6h', 'Sarah Chen', 'sarah.chen@maryadha.com', true, 'Sarah Chen'),
  ('g3g4h56d-3g4h-7h0g-ch7d-9h1e2f5g6h7i', 'g3g4h56d-3g4h-7h0g-ch7d-9h1e2f5g6h7i', 'Michael Kim', 'michael.kim@maryadha.com', true, 'Michael Kim');

-- Insert test factories
INSERT INTO factories (id, name, location, description, minimum_order_quantity, leather_types, verified)
VALUES
  ('h4h5i67e-4h5i-8i1h-di8e-0i2f3g6h7i8j', 'Khader Leathers', 'Chennai, India', 'Premium leather manufacturer since 1978', 50, ARRAY['Distressed', 'Polished']::leather_type[], true),
  ('i5i6j78f-5i6j-9j2i-ej9f-1j3g4h7i8j9k', 'Arora Fine Leathers', 'Delhi, India', 'Luxury leather crafting since 1992', 75, ARRAY['Matte', 'Pebbled']::leather_type[], true);

-- Insert test samples
INSERT INTO samples (id, brand_id, factory_id, rep_id, status, file_url, comments)
VALUES
  ('j6j7k89g-6j7k-0k3j-fk0g-2k4h5i8j9k0l', 'd0d1e23a-0d1e-4e7d-9e4a-6f8b9c2d3e4f', 'h4h5i67e-4h5i-8i1h-di8e-0i2f3g6h7i8j', 'f2f3g45c-2f3g-6g9f-bg6c-8g0d1e4f5g6h', 'in_review', 'https://example.com/sample1.pdf', 'Looking for distressed finish'),
  ('k7k8l90h-7k8l-1l4k-gl1h-3l5i6j9k0l1m', 'e1e2f34b-1e2f-5f8e-af5b-7f9c0d3e4f5g', 'i5i6j78f-5i6j-9j2i-ej9f-1j3g4h7i8j9k', 'g3g4h56d-3g4h-7h0g-ch7d-9h1e2f5g6h7i', 'requested', 'https://example.com/sample2.pdf', 'Need matte finish sample');

-- Insert test orders
INSERT INTO orders (id, brand_id, factory_id, rep_id, status, quantity, unit_price, total_amount, currency, payment_status)
VALUES
  ('l8l9m01i-8l9m-2m5l-hm2i-4m6j7k0l1m2n', 'd0d1e23a-0d1e-4e7d-9e4a-6f8b9c2d3e4f', 'h4h5i67e-4h5i-8i1h-di8e-0i2f3g6h7i8j', 'f2f3g45c-2f3g-6g9f-bg6c-8g0d1e4f5g6h', 'in_production', 100, 45.99, 4599.00, 'USD', 'partial'),
  ('m9m0n12j-9m0n-3n6m-in3j-5n7k8l1m2n3o', 'e1e2f34b-1e2f-5f8e-af5b-7f9c0d3e4f5g', 'i5i6j78f-5i6j-9j2i-ej9f-1j3g4h7i8j9k', 'g3g4h56d-3g4h-7h0g-ch7d-9h1e2f5g6h7i', 'confirmed', 50, 89.99, 4499.50, 'USD', 'pending');

-- Insert test group chats
INSERT INTO group_chats (id, order_id, brand_id, factory_id)
VALUES
  ('n0n1o23k-0n1o-4o7n-jo4k-6o8l9m2n3o4p', 'l8l9m01i-8l9m-2m5l-hm2i-4m6j7k0l1m2n', 'd0d1e23a-0d1e-4e7d-9e4a-6f8b9c2d3e4f', 'h4h5i67e-4h5i-8i1h-di8e-0i2f3g6h7i8j'),
  ('o1o2p34l-1o2p-5p8o-kp5l-7p9m0n3o4p5q', 'm9m0n12j-9m0n-3n6m-in3j-5n7k8l1m2n3o', 'e1e2f34b-1e2f-5f8e-af5b-7f9c0d3e4f5g', 'i5i6j78f-5i6j-9j2i-ej9f-1j3g4h7i8j9k');

-- Insert test messages
INSERT INTO messages (id, chat_id, sender_id, text, created_at)
VALUES
  ('p2p3q45m-2p3q-6q9p-lq6m-8q0n1o4p5q6r', 'n0n1o23k-0n1o-4o7n-jo4k-6o8l9m2n3o4p', 'f2f3g45c-2f3g-6g9f-bg6c-8g0d1e4f5g6h', 'Production has started on your order', NOW() - INTERVAL '2 days'),
  ('q3q4r56n-3q4r-7r0q-mr7n-9r1o2p5q6r7s', 'o1o2p34l-1o2p-5p8o-kp5l-7p9m0n3o4p5q', 'g3g4h56d-3g4h-7h0g-ch7d-9h1e2f5g6h7i', 'Your order has been confirmed', NOW() - INTERVAL '1 day');