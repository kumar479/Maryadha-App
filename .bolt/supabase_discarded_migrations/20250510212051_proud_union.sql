-- Insert sample reps
INSERT INTO reps (id, user_id, name, email, phone, bio, profile_image, active, created_at) VALUES
  ('d1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', '11111111-1111-1111-1111-111111111111', 'Sarah Chen', 'sarah.chen@maryadha.com', '+1234567890', 'Experienced sourcing expert specializing in luxury leather goods with 8+ years in the industry.', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', true, NOW() - INTERVAL '1 year'),
  ('e2d8c7f0-1f4b-5c5e-9f6d-3a0b8c7d6e5f', '22222222-2222-2222-2222-222222222222', 'Michael Rodriguez', 'michael.rodriguez@maryadha.com', '+1234567891', 'Former production manager turned sourcing expert, focusing on sustainable manufacturing practices.', 'https://images.pexels.com/photos/1181391/pexels-photo-1181391.jpeg', true, NOW() - INTERVAL '11 months'),
  ('f3e9d8a1-2b5c-6d6f-0e7e-4b1c9d8e7f6a', '33333333-3333-3333-3333-333333333333', 'Emily Wong', 'emily.wong@maryadha.com', '+1234567892', 'Quality assurance specialist with deep knowledge of leather processing and finishing techniques.', 'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg', true, NOW() - INTERVAL '9 months');

-- Insert sample brands
INSERT INTO brands (id, name, website, email, logo_url) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'Stellar Leather Co.', 'https://stellarleather.com', 'contact@stellarleather.com', 'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'Urban Hide', 'https://urbanhide.com', 'info@urbanhide.com', 'https://images.pexels.com/photos/1337381/pexels-photo-1337381.jpeg'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-3c4d5e6f7a8b', 'Artisan Leather Works', 'https://artisanleather.com', 'hello@artisanleather.com', 'https://images.pexels.com/photos/1337382/pexels-photo-1337382.jpeg');

-- Insert sample factories
INSERT INTO factories (id, name, location, description, minimum_order_quantity, leather_types, created_at) VALUES
  ('f1e2d3c4-b5a6-7c8d-9e0f-1a2b3c4d5e6f', 'Premium Leather Industries', 'Chennai, India', 'Specializing in premium leather processing with a focus on sustainable practices', 50, ARRAY['Distressed', 'Polished', 'Matte']::leather_type[], NOW() - INTERVAL '2 years'),
  ('a2f3e4d5-c6b7-8d9e-0f1a-2b3c4d5e6f7b', 'Heritage Tannery', 'Delhi, India', 'Traditional tanning methods combined with modern technology', 100, ARRAY['Pebbled', 'Suede']::leather_type[], NOW() - INTERVAL '18 months'),
  ('b3a4f5e6-d7c8-9e0f-1a2b-3c4d5e6f7a8c', 'Modern Leather Solutions', 'Mumbai, India', 'Innovative leather processing techniques for contemporary designs', 75, ARRAY['Polished', 'Matte', 'Pebbled']::leather_type[], NOW() - INTERVAL '1 year');

-- Insert sample samples
INSERT INTO samples (id, brand_id, factory_id, status, file_url, comments, rep_id, created_at) VALUES
  ('a1a2b3c4-d5e6-f7a8-b9c0-1d2e3f4a5b6c', 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'f1e2d3c4-b5a6-7c8d-9e0f-1a2b3c4d5e6f', 'in_review', 'https://example.com/samples/1.pdf', 'Looking for distressed finish with antique hardware', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', NOW() - INTERVAL '2 months'),
  ('b2b3c4d5-e6f7-a8b9-c0d1-2e3f4a5b6c7d', 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'a2f3e4d5-c6b7-8d9e-0f1a-2b3c4d5e6f7b', 'approved', 'https://example.com/samples/2.pdf', 'Pebbled texture sample for upcoming collection', 'e2d8c7f0-1f4b-5c5e-9f6d-3a0b8c7d6e5f', NOW() - INTERVAL '6 weeks'),
  ('c3c4d5e6-f7a8-b9c0-d1e2-3f4a5b6c7d8e', 'c3d4e5f6-a7b8-6c7d-0e1f-3c4d5e6f7a8b', 'b3a4f5e6-d7c8-9e0f-1a2b-3c4d5e6f7a8c', 'requested', 'https://example.com/samples/3.pdf', 'Need samples in three different finishes', 'f3e9d8a1-2b5c-6d6f-0e7e-4b1c9d8e7f6a', NOW() - INTERVAL '2 weeks');

-- Insert sample orders
INSERT INTO orders (id, sample_id, brand_id, factory_id, status, quantity, unit_price, total_amount, currency, payment_status, estimated_delivery, rep_id, created_at) VALUES
  ('a1b2c3d4-e5f6-a7b8-c9d0-1e2f3a4b5c6d', 'a1a2b3c4-d5e6-f7a8-b9c0-1d2e3f4a5b6c', 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'f1e2d3c4-b5a6-7c8d-9e0f-1a2b3c4d5e6f', 'in_production', 200, 45.99, 9198.00, 'USD', 'partial', '2024-08-15', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', NOW() - INTERVAL '3 weeks'),
  ('b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e', 'b2b3c4d5-e6f7-a8b9-c0d1-2e3f4a5b6c7d', 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'a2f3e4d5-c6b7-8d9e-0f1a-2b3c4d5e6f7b', 'confirmed', 150, 52.99, 7948.50, 'USD', 'pending', '2024-09-01', 'e2d8c7f0-1f4b-5c5e-9f6d-3a0b8c7d6e5f', NOW() - INTERVAL '2 weeks'),
  ('c3d4e5f6-a7b8-c9d0-e1f2-3a4b5c6d7e8f', 'c3c4d5e6-f7a8-b9c0-d1e2-3f4a5b6c7d8e', 'c3d4e5f6-a7b8-6c7d-0e1f-3c4d5e6f7a8b', 'b3a4f5e6-d7c8-9e0f-1a2b-3c4d5e6f7a8c', 'pending', 100, 39.99, 3999.00, 'USD', 'pending', '2024-09-15', 'f3e9d8a1-2b5c-6d6f-0e7e-4b1c9d8e7f6a', NOW() - INTERVAL '1 week');

-- Insert sample messages
INSERT INTO messages (id, sender_id, receiver_id, text, created_at) VALUES
  ('a1b2c3d4-e5f6-a7b8-c9d0-1e2f3a4b5c6d', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', 'a1b2c3d4-e5f6-4a5b-8c9d-1a2b3c4d5e6f', 'Your sample request has been received and is being processed.', NOW() - INTERVAL '3 days'),
  ('b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e', 'e2d8c7f0-1f4b-5c5e-9f6d-3a0b8c7d6e5f', 'b2c3d4e5-f6a7-5b6c-9d0e-2b3c4d5e6f7a', 'The factory has approved your sample. Would you like to proceed with the order?', NOW() - INTERVAL '2 days'),
  ('c3d4e5f6-a7b8-c9d0-e1f2-3a4b5c6d7e8f', 'f3e9d8a1-2b5c-6d6f-0e7e-4b1c9d8e7f6a', 'c3d4e5f6-a7b8-6c7d-0e1f-3c4d5e6f7a8b', 'I have some questions about your sample specifications. Can we schedule a call?', NOW() - INTERVAL '1 day');

-- Insert sample notification preferences
INSERT INTO notification_preferences (id, user_id, notification_type, email_enabled, push_enabled, whatsapp_enabled, created_at) VALUES
  ('a1b2c3d4-e5f6-a7b8-c9d0-1e2f3a4b5c6d', '11111111-1111-1111-1111-111111111111', 'sample_request', true, true, true, NOW()),
  ('b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e', '22222222-2222-2222-2222-222222222222', 'order_update', true, true, false, NOW()),
  ('c3d4e5f6-a7b8-c9d0-e1f2-3a4b5c6d7e8f', '33333333-3333-3333-3333-333333333333', 'message', true, true, true, NOW());

-- Insert sample order status history
INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by, notes, created_at) VALUES
  ('a1b2c3d4-e5f6-a7b8-c9d0-1e2f3a4b5c6d', 'a1b2c3d4-e5f6-a7b8-c9d0-1e2f3a4b5c6d', 'pending', 'confirmed', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', 'Order confirmed after sample approval', NOW() - INTERVAL '2 weeks'),
  ('b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e', 'a1b2c3d4-e5f6-a7b8-c9d0-1e2f3a4b5c6d', 'confirmed', 'in_production', 'd1c7b6e9-0f3a-4b4d-8e5c-2f9a8b7c6d5e', 'Production started', NOW() - INTERVAL '1 week'),
  ('c3d4e5f6-a7b8-c9d0-e1f2-3a4b5c6d7e8f', 'b2c3d4e5-f6a7-b8c9-d0e1-2f3a4b5c6d7e', 'pending', 'confirmed', 'e2d8c7f0-1f4b-5c5e-9f6d-3a0b8c7d6e5f', 'Order confirmed with factory', NOW() - INTERVAL '3 days');