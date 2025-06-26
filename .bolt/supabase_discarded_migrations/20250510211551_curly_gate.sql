/*
  # Add Sample Data
  
  This migration adds realistic sample data for testing purposes.
  
  1. Sample Data
    - Reps with profiles and contact details
    - Brands with company information
    - Factories with capabilities
    - Sample requests in various stages
    - Orders with full tracking
    - Messages between users
    - Notification preferences
    - Order status history
*/

-- Insert sample reps
INSERT INTO reps (id, user_id, name, email, phone, bio, profile_image, active, created_at) VALUES
  ('d1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', '11111111-1111-1111-1111-111111111111', 'Sarah Chen', 'sarah.chen@maryadha.com', '+1234567890', 'Experienced sourcing expert specializing in luxury leather goods with 8+ years in the industry.', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', true, NOW() - INTERVAL '1 year'),
  ('e2d8c7f0-1g4b-5c5e-9f6d-3g0b8c7d6e5f', '22222222-2222-2222-2222-222222222222', 'Michael Rodriguez', 'michael.rodriguez@maryadha.com', '+1234567891', 'Former production manager turned sourcing expert, focusing on sustainable manufacturing practices.', 'https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg', true, NOW() - INTERVAL '11 months'),
  ('f3e9d8g1-2h5c-6d6f-0g7e-4h1c9d8e7f6g', '33333333-3333-3333-3333-333333333333', 'Emily Wong', 'emily.wong@maryadha.com', '+1234567892', 'Quality assurance specialist with deep knowledge of leather processing and finishing techniques.', 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg', true, NOW() - INTERVAL '9 months');

-- Insert sample brands
INSERT INTO brands (id, name, website, email, logo_url) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'Stellar Leather Co.', 'https://stellarleather.com', 'contact@stellarleather.com', 'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg'),
  ('b2c3d4e5-f6g7-5b6c-9d0e-2b3c4d5e6f7g', 'Urban Hide', 'https://urbanhide.com', 'info@urbanhide.com', 'https://images.pexels.com/photos/1337381/pexels-photo-1337381.jpeg'),
  ('c3d4e5f6-g7h8-6c7d-0e1f-3c4d5e6f7g8h', 'Artisan Leather Works', 'https://artisanleather.com', 'hello@artisanleather.com', 'https://images.pexels.com/photos/1337382/pexels-photo-1337382.jpeg');

-- Insert sample factories
INSERT INTO factories (id, name, location, description, minimum_order_quantity, leather_types, created_at) VALUES
  ('f1e2d3c4-b5a6-7c8d-9e0f-1a2b3c4d5e6f', 'Premium Leather Industries', 'Chennai, India', 'Specializing in premium leather processing with a focus on sustainable practices', 50, ARRAY['Distressed', 'Polished', 'Matte']::leather_type[], NOW() - INTERVAL '2 years'),
  ('g2f3e4d5-c6b7-8d9e-0f1g-2b3c4d5e6f7g', 'Heritage Tannery', 'Delhi, India', 'Traditional tanning methods combined with modern technology', 100, ARRAY['Pebbled', 'Suede']::leather_type[], NOW() - INTERVAL '18 months'),
  ('h3g4f5e6-d7c8-9e0f-1g2h-3c4d5e6f7g8h', 'Modern Leather Solutions', 'Mumbai, India', 'Innovative leather processing techniques for contemporary designs', 75, ARRAY['Polished', 'Matte', 'Pebbled']::leather_type[], NOW() - INTERVAL '1 year');

-- Insert sample samples
INSERT INTO samples (id, brand_id, factory_id, status, file_url, comments, rep_id, created_at) VALUES
  ('s1a2b3c4-d5e6-f7g8-h9i0-1j2k3l4m5n6', 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'f1e2d3c4-b5a6-7c8d-9e0f-1a2b3c4d5e6f', 'in_review', 'https://example.com/samples/1.pdf', 'Looking for distressed finish with antique hardware', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', NOW() - INTERVAL '2 months'),
  ('s2b3c4d5-e6f7-g8h9-i0j1-2k3l4m5n6o7', 'b2c3d4e5-f6g7-5b6c-9d0e-2b3c4d5e6f7g', 'g2f3e4d5-c6b7-8d9e-0f1g-2b3c4d5e6f7g', 'approved', 'https://example.com/samples/2.pdf', 'Pebbled texture sample for upcoming collection', 'e2d8c7f0-1g4b-5c5e-9f6d-3g0b8c7d6e5f', NOW() - INTERVAL '6 weeks'),
  ('s3c4d5e6-f7g8-h9i0-j1k2-3l4m5n6o7p8', 'c3d4e5f6-g7h8-6c7d-0e1f-3c4d5e6f7g8h', 'h3g4f5e6-d7c8-9e0f-1g2h-3c4d5e6f7g8h', 'requested', 'https://example.com/samples/3.pdf', 'Need samples in three different finishes', 'f3e9d8g1-2h5c-6d6f-0g7e-4h1c9d8e7f6g', NOW() - INTERVAL '2 weeks');

-- Insert sample orders
INSERT INTO orders (id, sample_id, brand_id, factory_id, status, quantity, unit_price, total_amount, currency, payment_status, estimated_delivery, rep_id, created_at) VALUES
  ('o1p2q3r4-s5t6-u7v8-w9x0-1y2z3a4b5c6', 's1a2b3c4-d5e6-f7g8-h9i0-1j2k3l4m5n6', 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'f1e2d3c4-b5a6-7c8d-9e0f-1a2b3c4d5e6f', 'in_production', 200, 45.99, 9198.00, 'USD', 'partial', '2024-08-15', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', NOW() - INTERVAL '3 weeks'),
  ('o2q3r4s5-t6u7-v8w9-x0y1-2z3a4b5c6d7', 's2b3c4d5-e6f7-g8h9-i0j1-2k3l4m5n6o7', 'b2c3d4e5-f6g7-5b6c-9d0e-2b3c4d5e6f7g', 'g2f3e4d5-c6b7-8d9e-0f1g-2b3c4d5e6f7g', 'confirmed', 150, 52.99, 7948.50, 'USD', 'pending', '2024-09-01', 'e2d8c7f0-1g4b-5c5e-9f6d-3g0b8c7d6e5f', NOW() - INTERVAL '2 weeks'),
  ('o3r4s5t6-u7v8-w9x0-y1z2-3a4b5c6d7e8', 's3c4d5e6-f7g8-h9i0-j1k2-3l4m5n6o7p8', 'c3d4e5f6-g7h8-6c7d-0e1f-3c4d5e6f7g8h', 'h3g4f5e6-d7c8-9e0f-1g2h-3c4d5e6f7g8h', 'pending', 100, 39.99, 3999.00, 'USD', 'pending', '2024-09-15', 'f3e9d8g1-2h5c-6d6f-0g7e-4h1c9d8e7f6g', NOW() - INTERVAL '1 week');

-- Insert sample messages
INSERT INTO messages (id, sender_id, receiver_id, text, created_at) VALUES
  ('m1n2o3p4-q5r6-s7t8-u9v0-1w2x3y4z5a6', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'Your sample request has been received and is being processed.', NOW() - INTERVAL '3 days'),
  ('m2n3o4p5-q6r7-s8t9-u0v1-2w3x4y5z6a7', 'e2d8c7f0-1g4b-5c5e-9f6d-3g0b8c7d6e5f', 'b2c3d4e5-f6g7-5b6c-9d0e-2b3c4d5e6f7g', 'The factory has approved your sample. Would you like to proceed with the order?', NOW() - INTERVAL '2 days'),
  ('m3n4o5p6-q7r8-s9t0-u1v2-3w4x5y6z7a8', 'f3e9d8g1-2h5c-6d6f-0g7e-4h1c9d8e7f6g', 'c3d4e5f6-g7h8-6c7d-0e1f-3c4d5e6f7g8h', 'I have some questions about your sample specifications. Can we schedule a call?', NOW() - INTERVAL '1 day');

-- Insert sample notification preferences
INSERT INTO notification_preferences (id, user_id, notification_type, email_enabled, push_enabled, whatsapp_enabled, created_at) VALUES
  ('n1o2p3q4-r5s6-t7u8-v9w0-1x2y3z4a5b6', '11111111-1111-1111-1111-111111111111', 'sample_request', true, true, true, NOW()),
  ('n2o3p4q5-r6s7-t8u9-v0w1-2x3y4z5a6b7', '22222222-2222-2222-2222-222222222222', 'order_update', true, true, false, NOW()),
  ('n3o4p5q6-r7s8-t9u0-v1w2-3x4y5z6a7b8', '33333333-3333-3333-3333-333333333333', 'message', true, true, true, NOW());

-- Insert sample order status history
INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by, notes, created_at) VALUES
  ('h1i2j3k4-l5m6-n7o8-p9q0-1r2s3t4u5v6', 'o1p2q3r4-s5t6-u7v8-w9x0-1y2z3a4b5c6', 'pending', 'confirmed', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', 'Order confirmed after sample approval', NOW() - INTERVAL '2 weeks'),
  ('h2i3j4k5-l6m7-n8o9-p0q1-2r3s4t5u6v7', 'o1p2q3r4-s5t6-u7v8-w9x0-1y2z3a4b5c6', 'confirmed', 'in_production', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', 'Production started', NOW() - INTERVAL '1 week'),
  ('h3i4j5k6-l7m8-n9o0-p1q2-3r4s5t6u7v8', 'o2q3r4s5-t6u7-v8w9-x0y1-2z3a4b5c6d7', 'pending', 'confirmed', 'e2d8c7f0-1g4b-5c5e-9f6d-3g0b8c7d6e5f', 'Order confirmed with factory', NOW() - INTERVAL '3 days');