-- Add email verification columns to users table
-- Required by Payload auth.verify: true
ALTER TABLE "cms"."users" ADD COLUMN IF NOT EXISTS "_verified" boolean DEFAULT false;
ALTER TABLE "cms"."users" ADD COLUMN IF NOT EXISTS "_verification_token" varchar;

-- Mark all existing users as verified so they aren't locked out
UPDATE "cms"."users" SET "_verified" = true WHERE "_verified" = false;
