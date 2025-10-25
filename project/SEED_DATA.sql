-- =====================================================
-- ENERTECH - SEED DATA FOR DEMONSTRATION
-- =====================================================
-- This file contains SQL commands to populate the database
-- with sample data for testing and demonstration purposes.
--
-- IMPORTANT: Execute this AFTER user registration through the app
-- Replace USER_ID_HERE with actual user IDs from your profiles table
-- =====================================================

-- Example: Get user IDs (run this first to see available users)
-- SELECT id, email, full_name FROM profiles;

-- =====================================================
-- SAMPLE DEVICES FOR A USER
-- =====================================================
-- Replace 'USER_ID_HERE' with an actual user UUID from profiles table

INSERT INTO devices (user_id, name, device_type, watts, hours_per_day, is_active) VALUES
('USER_ID_HERE', 'Refrigerador Samsung', 'refrigerator', 150, 24, true),
('USER_ID_HERE', 'Aire Acondicionado Sala', 'air_conditioner', 1500, 8, true),
('USER_ID_HERE', 'Lavadora LG', 'washing_machine', 500, 1, true),
('USER_ID_HERE', 'Televisor 55"', 'television', 120, 6, true),
('USER_ID_HERE', 'Computadora Oficina', 'computer', 300, 10, true),
('USER_ID_HERE', 'Iluminación LED Casa', 'lighting', 60, 12, true),
('USER_ID_HERE', 'Microondas', 'microwave', 1000, 0.5, true);

-- =====================================================
-- SAMPLE CONSUMPTION RECORDS (Last 30 days)
-- =====================================================

INSERT INTO consumption_records (user_id, date, kwh_consumed, cost) VALUES
('USER_ID_HERE', CURRENT_DATE - INTERVAL '30 days', 12.5, 1.50),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '29 days', 13.2, 1.58),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '28 days', 11.8, 1.42),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '27 days', 14.5, 1.74),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '26 days', 13.0, 1.56),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '25 days', 12.3, 1.48),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '24 days', 15.2, 1.82),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '23 days', 14.8, 1.78),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '22 days', 13.5, 1.62),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '21 days', 12.9, 1.55),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '20 days', 11.5, 1.38),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '19 days', 13.8, 1.66),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '18 days', 14.2, 1.70),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '17 days', 12.7, 1.52),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '16 days', 13.3, 1.60),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '15 days', 15.0, 1.80),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '14 days', 14.5, 1.74),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '13 days', 13.1, 1.57),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '12 days', 12.4, 1.49),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '11 days', 11.9, 1.43),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '10 days', 13.6, 1.63),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '9 days', 14.0, 1.68),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '8 days', 12.8, 1.54),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '7 days', 13.4, 1.61),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 15.1, 1.81),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 14.3, 1.72),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 13.0, 1.56),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 12.6, 1.51),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', 11.7, 1.40),
('USER_ID_HERE', CURRENT_DATE - INTERVAL '1 day', 13.2, 1.58);

-- =====================================================
-- SAMPLE ENERGY GOALS
-- =====================================================

INSERT INTO energy_goals (user_id, target_kwh, start_date, end_date, status) VALUES
('USER_ID_HERE', 350, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, 'active'),
('USER_ID_HERE', 300, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'active');

-- =====================================================
-- ASSIGN RECOMMENDATIONS TO USER
-- =====================================================

-- Get recommendation IDs first
-- SELECT id, title_es FROM recommendations;

-- Assign some recommendations (replace RECOMMENDATION_ID with actual IDs)
INSERT INTO user_recommendations (user_id, recommendation_id, status) VALUES
('USER_ID_HERE', (SELECT id FROM recommendations WHERE title_es = 'Ajusta tu termostato' LIMIT 1), 'pending'),
('USER_ID_HERE', (SELECT id FROM recommendations WHERE title_es = 'Usa iluminación LED' LIMIT 1), 'pending'),
('USER_ID_HERE', (SELECT id FROM recommendations WHERE title_es = 'Desconecta dispositivos en standby' LIMIT 1), 'pending');

-- =====================================================
-- NOTES FOR USAGE
-- =====================================================
--
-- 1. Register a new user through the application first
-- 2. Query the profiles table to get the user's UUID:
--    SELECT id, email FROM profiles WHERE email = 'your-email@example.com';
-- 3. Replace all instances of 'USER_ID_HERE' with the actual UUID
-- 4. Execute this SQL in Supabase SQL Editor
-- 5. Refresh the application to see the populated data
--
-- To create an ADMIN user, update their role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
--
-- =====================================================
