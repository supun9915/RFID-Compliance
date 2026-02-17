-- Fix superadmin password (password: superadmin)
-- BCrypt hash generated for password "superadmin"
UPDATE users 
SET password = '$2a$10$rDkPvvAFV8kqwvKJzwlRv.1MUlOkqMIjxKkK5J8TlJ0lKx8fThDUS'
WHERE username = 'superadmin';
