# Data Model Refactor - Migration Guide

## Overview

This document outlines the refactoring from the Phase 3 implementation to the specification-compliant data model. The refactor provides better flexibility, scalability, and matches the original architectural vision.

## Key Changes

### 1. Wedding → Couple Rename

**Why**: More semantic and matches the spec. "Couple" better represents the entity.

**Changes**:
- Model `Wedding` renamed to `Couple`
- All `weddingId` foreign keys renamed to `coupleId`
- All relations updated

**Migration**: Automatic table rename + column renames

### 2. Address Model (New)

**Why**: Normalize addresses for guests and households

**Before**: Address fields directly on Guest
**After**: Separate Address table with relations

**Benefits**:
- Avoid duplicate address storage
- Easier to update addresses
- Better data integrity

### 3. Campaign Model (New)

**Why**: Flexible invitation management with scheduling and segmentation

**Before**: Invitation types stored as enum on Invitation
**After**: Campaign entity that groups invitations

**Features**:
- Schedule sends for future dates
- Segment targeting with rules
- Track campaign-level statistics
- Reusable templates
- A/B testing support (future)

**Structure**:
```typescript
Campaign {
  type: SAVE_THE_DATE | INVITATION | REMINDER | UPDATE | THANK_YOU
  status: DRAFT | SCHEDULED | SENDING | SENT | PAUSED | CANCELLED
  segmentJSON: {...} // Target rules
  scheduledAt, sentAt
  stats: { sent, delivered, opened, clicked, bounced }
}
```

### 4. RSVPQuestion Model (New)

**Why**: Dynamic, per-event custom RSVP questions

**Before**: Fixed questions configured on Wedding (JSON)
**After**: Flexible question builder with conditional logic

**Features**:
- Question types: TEXT, SELECT, MEAL_CHOICE, DIETARY, PLUS_ONE, etc.
- Per-event questions
- Conditional visibility rules (show only for tags)
- Required vs optional
- Custom ordering

**Example**:
```typescript
RSVPQuestion {
  text: "Will you need bus transportation?"
  type: YES_NO
  eventId: "reception_event_id"
  visibilityRule: '{"tags": ["out_of_town"]}'
  required: false
}
```

### 5. RSVPResponse Model (Refactored)

**Why**: Separate RSVP responses from Guest for history tracking

**Before**: RSVP data stored on Guest (mealChoice, dietaryRestrictions, etc.)
**After**: Separate response records per event

**Benefits**:
- Track response history
- Multiple events support
- Update responses without overwriting
- Audit trail

**Structure**:
```typescript
RSVPResponse {
  guestId, eventId
  status: YES | NO | MAYBE
  answersJSON: { question_id: answer }
  plusOneName, plusOneEmail, plusOneAnswers
  respondedAt, updatedAt
}
```

### 6. Media Model (New)

**Why**: Proper media library with tagging

**Before**: Direct URL references in various models
**After**: Centralized media library

**Features**:
- Tag-based organization
- Thumbnail generation
- Metadata (width, height, size)
- Reusable across pages
- Easy deletion management

### 7. Privacy & Theme Enhancements

**New on Couple**:
- `privacyMode`: PUBLIC | PASSWORD | INVITE_ONLY
- `sitePassword`: Hashed password protection
- `customDomain`: Custom domain support
- `fontHeading`, `fontBody`: Typography control
- `cornerRadius`, `showFlorals`: Design tokens
- `accentColor`: Additional color

### 8. Enhanced Invitation Tracking

**New Fields**:
- `deliveredAt`: Delivery confirmation
- `clickedAt`: Link clicks
- `clickCount`: Multiple clicks
- `unsubscribedAt`: Unsubscribe tracking

### 9. Seating Enhancements

**New Features**:
- Canvas positioning (x, y coordinates)
- Per-event seating charts
- Seat-specific notes
- Table shapes

### 10. Message System (Refactored)

**New Model**: Separate from Campaign for broader use

**Features**:
- Segment-based messaging
- Schedule sends
- Stop rules (auto-stop when conditions met)
- Delivery stats

## Migration Steps

### Phase 1: Schema Migration (1-2 hours)

1. **Backup Current Database**
   ```bash
   pg_dump your_database > backup_before_refactor.sql
   ```

2. **Create Migration Script**
   ```bash
   # Copy new schema over old
   cp prisma/schema-refactored.prisma prisma/schema.prisma
   
   # Create migration
   npx prisma migrate dev --name refactor_to_spec --create-only
   ```

3. **Review Generated Migration**
   - Check for data loss warnings
   - Verify rename operations
   - Add custom data migration SQL if needed

4. **Apply Migration**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Phase 2: Data Migration (2-4 hours)

Create data migration script to:

1. **Migrate Addresses**
   ```sql
   -- Extract unique addresses from guests into Address table
   INSERT INTO "Address" (id, "coupleId", line1, city, state, postal, country)
   SELECT 
     gen_random_uuid(),
     "weddingId",
     "addressLine1",
     city,
     state,
     "zipCode",
     COALESCE(country, 'US')
   FROM "Guest"
   WHERE "addressLine1" IS NOT NULL
   GROUP BY "weddingId", "addressLine1", city, state, "zipCode", country;
   
   -- Update guests with address references
   UPDATE "Guest" g
   SET "addressId" = a.id
   FROM "Address" a
   WHERE g."coupleId" = a."coupleId"
     AND g."addressLine1" = a.line1
     AND g.city = a.city;
   ```

2. **Migrate Invitations to Campaigns**
   ```sql
   -- Create campaigns for existing invitation types
   INSERT INTO "Campaign" (id, "coupleId", name, type, status)
   SELECT 
     gen_random_uuid(),
     "weddingId",
     CASE 
       WHEN type = 'SAVE_THE_DATE' THEN 'Save the Date Campaign'
       WHEN type = 'INVITATION' THEN 'Wedding Invitation Campaign'
     END,
     type,
     'SENT'
   FROM "Invitation"
   GROUP BY "weddingId", type;
   
   -- Update invitations with campaign references
   UPDATE "Invitation" i
   SET "campaignId" = c.id
   FROM "Campaign" c
   WHERE i."coupleId" = c."coupleId"
     AND i.type = c.type;
   ```

3. **Migrate RSVP Data**
   ```sql
   -- Create RSVPResponse records from Guest data
   INSERT INTO "RSVPResponse" (
     id, "coupleId", "guestId", status, "answersJSON", 
     "plusOneName", "plusOneEmail", "respondedAt"
   )
   SELECT 
     gen_random_uuid(),
     "coupleId",
     id,
     CASE 
       WHEN "rsvpStatus" = 'ATTENDING' THEN 'YES'
       WHEN "rsvpStatus" = 'DECLINED' THEN 'NO'
       WHEN "rsvpStatus" = 'MAYBE' THEN 'MAYBE'
       ELSE 'PENDING'
     END,
     json_build_object(
       'mealChoice', "mealChoice",
       'dietaryRestrictions', "dietaryRestrictions",
       'songRequest', "songRequest",
       'busRequired', "busRequired",
       'busRoute', "busRoute"
     )::text,
     "plusOneName",
     "plusOneEmail",
     COALESCE("rsvpDate", NOW())
   FROM "Guest"
   WHERE "rsvpStatus" IS NOT NULL;
   ```

4. **Create Default RSVP Questions**
   ```sql
   -- Create standard RSVP questions for couples who had them enabled
   INSERT INTO "RSVPQuestion" ("coupleId", text, type, required, "order")
   SELECT 
     id,
     'What is your meal choice?',
     'MEAL_CHOICE',
     true,
     1
   FROM "Couple"
   WHERE "askMealChoice" = true;
   
   INSERT INTO "RSVPQuestion" ("coupleId", text, type, required, "order")
   SELECT 
     id,
     'Do you have any dietary restrictions?',
     'DIETARY',
     false,
     2
   FROM "Couple"
   WHERE "askMealChoice" = true;
   
   INSERT INTO "RSVPQuestion" ("coupleId", text, type, required, "order")
   SELECT 
     id,
     'Request a song for the dance floor!',
     'TEXT',
     false,
     3
   FROM "Couple"
   WHERE "askSongRequest" = true;
   ```

### Phase 3: Code Refactoring (8-12 hours)

1. **Update Type Definitions**
   - Update all `Wedding` to `Couple`
   - Update all `weddingId` to `coupleId`
   - Update imports

2. **Update API Routes**
   - `/api/admin/invitations/*` → Use Campaign model
   - `/api/rsvp/[code]` → Use RSVPResponse model
   - Add new routes for RSVPQuestions

3. **Update Components**
   - RSVP form → Fetch RSVPQuestions dynamically
   - Admin tracker → Show campaign-level stats
   - Guest list → Handle Address relations

4. **Update Queries**
   - Replace all `prisma.wedding.*` with `prisma.couple.*`
   - Update includes for new relations
   - Add joins for Address

### Phase 4: Testing (4-6 hours)

1. **Unit Tests**
   - Test RSVP question logic
   - Test campaign creation
   - Test address normalization

2. **Integration Tests**
   - Test full RSVP flow
   - Test invitation sending
   - Test data exports

3. **Manual Testing**
   - Create test couple
   - Import guests
   - Send invitations
   - Submit RSVPs
   - Verify all data

## Breaking Changes

### API Changes

**Before**:
```typescript
// Old RSVP submission
POST /api/rsvp/[code]
{
  status: "ATTENDING",
  mealChoice: "Chicken",
  dietaryRestrictions: "Vegetarian"
}
```

**After**:
```typescript
// New RSVP submission
POST /api/rsvp/[code]
{
  status: "YES",
  eventId: "event_123",
  answers: {
    "question_1": "Chicken",
    "question_2": "Vegetarian",
    "question_3": "Sweet Caroline"
  },
  plusOne: {
    name: "Jane Doe",
    email: "jane@example.com",
    answers: {
      "question_1": "Fish"
    }
  }
}
```

### Component Props

**Before**:
```typescript
<RsvpForm 
  guest={guest}
  wedding={wedding}
/>
```

**After**:
```typescript
<RsvpForm 
  guest={guest}
  couple={couple}
  event={event}
  questions={questions}
/>
```

## Rollback Plan

If issues arise:

1. **Restore Database**
   ```bash
   psql your_database < backup_before_refactor.sql
   ```

2. **Revert Code**
   ```bash
   git revert HEAD
   ```

3. **Regenerate Prisma Client**
   ```bash
   npx prisma generate
   ```

## Benefits Summary

### For Developers
- ✅ More flexible and extensible
- ✅ Better separation of concerns
- ✅ Easier to add features
- ✅ Cleaner data model

### For Users (Couples)
- ✅ Custom RSVP questions per event
- ✅ Better invitation targeting
- ✅ Campaign scheduling
- ✅ Historical RSVP tracking
- ✅ More privacy options

### For Guests
- ✅ Dynamic forms based on their context
- ✅ Only relevant questions shown
- ✅ Better plus-one experience
- ✅ Can update responses

## Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Schema Migration | 1-2 hours | HIGH |
| Data Migration | 2-4 hours | HIGH |
| Code Refactoring | 8-12 hours | HIGH |
| Testing | 4-6 hours | HIGH |
| Documentation | 2-3 hours | MEDIUM |
| **Total** | **17-27 hours** | |

## Next Steps

After refactoring:

1. Complete Sprint 2 missing features
2. Complete Sprint 3 missing features
3. Continue with Sprint 6 (Seating)
4. Continue with Sprint 7 (Messaging)
5. Complete Sprint 8 (Analytics)

## Support

For questions during migration:
- Check migration logs
- Review Prisma migration files
- Test with sample data first
- Keep backups accessible

---

**Status**: Ready to begin migration
**Estimated Time**: 17-27 hours
**Risk Level**: Medium (comprehensive testing required)

