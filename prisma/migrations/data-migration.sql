-- ============================================
-- Data Migration Script: Phase 3 → Spec Refactor
-- ============================================
-- This script migrates data from the Phase 3 schema to the refactored spec-compliant schema
-- Run AFTER applying the Prisma schema migration
-- IMPORTANT: Take a full database backup before running!

BEGIN;

-- ============================================
-- 1. Rename Wedding to Couple (handled by Prisma)
-- ============================================
-- Prisma will handle table rename automatically

-- ============================================
-- 2. Create and Populate Address Table
-- ============================================

-- Extract unique addresses from Guests
INSERT INTO "Address" (
  id,
  "coupleId",
  line1,
  line2,
  city,
  state,
  postal,
  country,
  "createdAt",
  "updatedAt"
)
SELECT DISTINCT
  gen_random_uuid(),
  "coupleId",
  "addressLine1",
  "addressLine2",
  city,
  state,
  "zipCode",
  COALESCE(country, 'US'),
  NOW(),
  NOW()
FROM "Guest"
WHERE "addressLine1" IS NOT NULL
  AND "addressLine1" != ''
ON CONFLICT DO NOTHING;

-- Extract unique addresses from Households
INSERT INTO "Address" (
  id,
  "coupleId",
  line1,
  line2,
  city,
  state,
  postal,
  country,
  "createdAt",
  "updatedAt"
)
SELECT DISTINCT
  gen_random_uuid(),
  "coupleId",
  "addressLine1",
  "addressLine2",
  city,
  state,
  "zipCode",
  COALESCE(country, 'US'),
  NOW(),
  NOW()
FROM "Household"
WHERE "addressLine1" IS NOT NULL
  AND "addressLine1" != ''
ON CONFLICT DO NOTHING;

-- Update Guests with Address references
UPDATE "Guest" g
SET "addressId" = (
  SELECT a.id
  FROM "Address" a
  WHERE a."coupleId" = g."coupleId"
    AND a.line1 = g."addressLine1"
    AND (a.line2 = g."addressLine2" OR (a.line2 IS NULL AND g."addressLine2" IS NULL))
    AND (a.city = g.city OR (a.city IS NULL AND g.city IS NULL))
    AND (a.state = g.state OR (a.state IS NULL AND g.state IS NULL))
  LIMIT 1
)
WHERE g."addressLine1" IS NOT NULL;

-- Update Households with Address references
UPDATE "Household" h
SET "addressId" = (
  SELECT a.id
  FROM "Address" a
  WHERE a."coupleId" = h."coupleId"
    AND a.line1 = h."addressLine1"
    AND (a.line2 = h."addressLine2" OR (a.line2 IS NULL AND h."addressLine2" IS NULL))
    AND (a.city = h.city OR (a.city IS NULL AND h.city IS NULL))
    AND (a.state = h.state OR (a.state IS NULL AND h.state IS NULL))
  LIMIT 1
)
WHERE h."addressLine1" IS NOT NULL;

-- ============================================
-- 3. Create Campaigns from Existing Invitations
-- ============================================

-- Create Save-the-Date campaigns
INSERT INTO "Campaign" (
  id,
  "coupleId",
  name,
  type,
  status,
  subject,
  "totalRecipients",
  sent,
  delivered,
  opened,
  "sentAt",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  "coupleId",
  'Save the Date Campaign',
  'SAVE_THE_DATE',
  'SENT',
  c."partner1Name" || ' & ' || c."partner2Name" || ' - Save the Date',
  COUNT(DISTINCT i.id),
  COUNT(DISTINCT CASE WHEN i.status IN ('SENT', 'OPENED', 'REPLIED') THEN i.id END),
  COUNT(DISTINCT CASE WHEN i.status IN ('SENT', 'OPENED', 'REPLIED') THEN i.id END),
  COUNT(DISTINCT CASE WHEN i.status IN ('OPENED', 'REPLIED') THEN i.id END),
  MIN(i."emailSentAt"),
  MIN(i."createdAt"),
  MAX(i."updatedAt")
FROM "Invitation" i
JOIN "Couple" c ON c.id = i."coupleId"
WHERE i.type = 'SAVE_THE_DATE'
GROUP BY i."coupleId", c."partner1Name", c."partner2Name";

-- Create Wedding Invitation campaigns
INSERT INTO "Campaign" (
  id,
  "coupleId",
  name,
  type,
  status,
  subject,
  "totalRecipients",
  sent,
  delivered,
  opened,
  "sentAt",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  "coupleId",
  'Wedding Invitation Campaign',
  'INVITATION',
  'SENT',
  'You''re Invited - ' || c."partner1Name" || ' & ' || c."partner2Name" || '''s Wedding',
  COUNT(DISTINCT i.id),
  COUNT(DISTINCT CASE WHEN i.status IN ('SENT', 'OPENED', 'REPLIED') THEN i.id END),
  COUNT(DISTINCT CASE WHEN i.status IN ('SENT', 'OPENED', 'REPLIED') THEN i.id END),
  COUNT(DISTINCT CASE WHEN i.status IN ('OPENED', 'REPLIED') THEN i.id END),
  MIN(i."emailSentAt"),
  MIN(i."createdAt"),
  MAX(i."updatedAt")
FROM "Invitation" i
JOIN "Couple" c ON c.id = i."coupleId"
WHERE i.type = 'INVITATION'
GROUP BY i."coupleId", c."partner1Name", c."partner2Name";

-- Update Invitations with Campaign references
UPDATE "Invitation" i
SET "campaignId" = (
  SELECT c.id
  FROM "Campaign" c
  WHERE c."coupleId" = i."coupleId"
    AND c.type = i.type
  LIMIT 1
);

-- Update invitation status enum values to match new schema
UPDATE "Invitation"
SET status = CASE 
  WHEN status = 'SENT' AND "emailOpenedAt" IS NULL THEN 'SENT'
  WHEN status = 'OPENED' OR "emailOpenedAt" IS NOT NULL THEN 'OPENED'
  WHEN status = 'REPLIED' THEN 'REPLIED'
  ELSE status
END;

-- Update invitation token from inviteLink
UPDATE "Invitation" i
SET token = COALESCE(
  SUBSTRING(i."inviteLink" FROM '/rsvp/(.+)$'),
  gen_random_uuid()::text
)
WHERE token IS NULL;

-- ============================================
-- 4. Create RSVPQuestion Records
-- ============================================

-- Create meal choice questions for couples who had it enabled
INSERT INTO "RSVPQuestion" (
  id,
  "coupleId",
  text,
  description,
  type,
  options,
  required,
  "order",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  id,
  'What is your meal choice?',
  'Please select your entrée preference',
  'MEAL_CHOICE',
  COALESCE(
    CASE 
      WHEN "mealOptions" IS NOT NULL THEN 
        (SELECT array_agg(value::text) FROM json_array_elements_text("mealOptions"::json))
      ELSE 
        ARRAY['Chicken', 'Beef', 'Fish', 'Vegetarian']
    END,
    ARRAY['Chicken', 'Beef', 'Fish', 'Vegetarian']
  ),
  true,
  1,
  NOW(),
  NOW()
FROM "Couple"
WHERE "askMealChoice" = true;

-- Create dietary restrictions questions
INSERT INTO "RSVPQuestion" (
  id,
  "coupleId",
  text,
  description,
  type,
  options,
  required,
  "order",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  id,
  'Do you have any dietary restrictions?',
  'Allergies, dietary requirements, etc.',
  'DIETARY',
  ARRAY[]::text[],
  false,
  2,
  NOW(),
  NOW()
FROM "Couple"
WHERE "askMealChoice" = true;

-- Create song request questions
INSERT INTO "RSVPQuestion" (
  id,
  "coupleId",
  text,
  description,
  type,
  options,
  required,
  "order",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  id,
  'Request a song for the dance floor!',
  'What song would you like to hear?',
  'TEXT',
  ARRAY[]::text[],
  false,
  3,
  NOW(),
  NOW()
FROM "Couple"
WHERE "askSongRequest" = true;

-- Create bus transportation questions
INSERT INTO "RSVPQuestion" (
  id,
  "coupleId",
  text,
  description,
  type,
  options,
  required,
  "order",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  id,
  'Will you need bus transportation?',
  'Select your route if applicable',
  'SINGLE_SELECT',
  COALESCE(
    (SELECT array_agg(value::text) FROM json_array_elements_text("busRoutes"::json)),
    ARRAY['Hotel Route A', 'Hotel Route B']
  ),
  false,
  4,
  NOW(),
  NOW()
FROM "Couple"
WHERE "askBusTransport" = true;

-- ============================================
-- 5. Migrate RSVP Data to RSVPResponse
-- ============================================

-- Create RSVPResponse records from Guest data
INSERT INTO "RSVPResponse" (
  id,
  "coupleId",
  "guestId",
  "eventId",
  status,
  "answersJSON",
  message,
  "plusOneName",
  "plusOneEmail",
  "plusOneAnswers",
  "respondedAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  g."coupleId",
  g.id,
  NULL, -- No event-specific responses yet
  CASE 
    WHEN g."rsvpStatus" = 'ATTENDING' THEN 'YES'
    WHEN g."rsvpStatus" = 'DECLINED' THEN 'NO'
    WHEN g."rsvpStatus" = 'MAYBE' THEN 'MAYBE'
    ELSE 'PENDING'
  END,
  -- Build answersJSON from existing fields
  json_build_object(
    'mealChoice', g."mealChoice",
    'dietaryRestrictions', g."dietaryRestrictions",
    'songRequest', g."songRequest",
    'busRequired', g."busRequired",
    'busRoute', g."busRoute"
  )::text,
  NULL, -- No message field in old schema
  g."plusOneName",
  g."plusOneEmail",
  NULL, -- No plus-one answers in old schema
  COALESCE(g."rsvpDate", NOW()),
  NOW()
FROM "Guest" g
WHERE g."rsvpStatus" IS NOT NULL
  OR g."mealChoice" IS NOT NULL
  OR g."dietaryRestrictions" IS NOT NULL
  OR g."songRequest" IS NOT NULL;

-- ============================================
-- 6. Update Guest inviteCode to inviteToken
-- ============================================

-- Ensure all guests have invite tokens
UPDATE "Guest"
SET "inviteToken" = COALESCE("inviteCode", gen_random_uuid()::text)
WHERE "inviteToken" IS NULL;

-- ============================================
-- 7. Set Default Privacy Mode
-- ============================================

UPDATE "Couple"
SET "privacyMode" = 'PUBLIC'
WHERE "privacyMode" IS NULL;

-- ============================================
-- 8. Initialize Plus-One Policy
-- ============================================

UPDATE "Guest"
SET "plusOnePolicy" = CASE 
  WHEN "allowPlusOne" = true THEN 'named'
  ELSE 'none'
END
WHERE "plusOnePolicy" IS NULL OR "plusOnePolicy" = 'none';

-- ============================================
-- 9. Migrate Activity Types
-- ============================================

-- Update old RsvpResponse references in activities
UPDATE "GuestActivity"
SET description = REPLACE(description, 'RSVP status changed to ATTENDING', 'RSVP status changed to YES');

UPDATE "GuestActivity"
SET description = REPLACE(description, 'RSVP status changed to DECLINED', 'RSVP status changed to NO');

-- ============================================
-- 10. Clean Up Statistics
-- ============================================

-- Update campaign statistics
UPDATE "Campaign" c
SET 
  bounced = (
    SELECT COUNT(*)
    FROM "Invitation" i
    WHERE i."campaignId" = c.id
      AND i.status = 'BOUNCED'
  ),
  failed = (
    SELECT COUNT(*)
    FROM "Invitation" i
    WHERE i."campaignId" = c.id
      AND i.status = 'FAILED'
  );

-- ============================================
-- Verification Queries
-- ============================================

-- Count records in new tables
DO $$
DECLARE
  address_count INT;
  campaign_count INT;
  question_count INT;
  response_count INT;
BEGIN
  SELECT COUNT(*) INTO address_count FROM "Address";
  SELECT COUNT(*) INTO campaign_count FROM "Campaign";
  SELECT COUNT(*) INTO question_count FROM "RSVPQuestion";
  SELECT COUNT(*) INTO response_count FROM "RSVPResponse";
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Addresses created: %', address_count;
  RAISE NOTICE 'Campaigns created: %', campaign_count;
  RAISE NOTICE 'RSVP Questions created: %', question_count;
  RAISE NOTICE 'RSVP Responses migrated: %', response_count;
END $$;

COMMIT;

-- ============================================
-- Post-Migration Verification
-- ============================================

-- Run these queries after migration to verify data integrity:

/*
-- Check for guests without addresses (expected if they had no address)
SELECT COUNT(*) as guests_without_address
FROM "Guest"
WHERE "addressId" IS NULL;

-- Check for invitations without campaigns
SELECT COUNT(*) as invitations_without_campaign
FROM "Invitation"
WHERE "campaignId" IS NULL;

-- Check RSVP response counts
SELECT 
  c."partner1Name" || ' & ' || c."partner2Name" as couple,
  COUNT(*) as total_responses,
  SUM(CASE WHEN r.status = 'YES' THEN 1 ELSE 0 END) as attending,
  SUM(CASE WHEN r.status = 'NO' THEN 1 ELSE 0 END) as declined,
  SUM(CASE WHEN r.status = 'PENDING' THEN 1 ELSE 0 END) as pending
FROM "RSVPResponse" r
JOIN "Couple" c ON c.id = r."coupleId"
GROUP BY c.id, c."partner1Name", c."partner2Name";

-- Check campaign statistics
SELECT 
  c."partner1Name" || ' & ' || c."partner2Name" as couple,
  ca.name,
  ca.type,
  ca."totalRecipients",
  ca.sent,
  ca.opened,
  ROUND((ca.opened::float / NULLIF(ca.sent, 0) * 100), 2) as open_rate
FROM "Campaign" ca
JOIN "Couple" c ON c.id = ca."coupleId"
ORDER BY c.id, ca.type;
*/

