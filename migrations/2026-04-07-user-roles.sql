-- Add role column to users table
ALTER TABLE "cms"."users" ADD COLUMN IF NOT EXISTS "role" varchar DEFAULT 'editor';

-- Assign roles: Saurabh + Swati = admin, Ridhi = editor
UPDATE "cms"."users" SET "role" = 'admin'  WHERE "email" IN ('saurabh@uncover.co.in', 'swati.tripathi@uncover.co.in');
UPDATE "cms"."users" SET "role" = 'editor' WHERE "email" = 'ridhi.bhardwaj@uncover.co.in';
