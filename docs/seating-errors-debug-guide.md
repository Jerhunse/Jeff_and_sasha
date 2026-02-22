# Seating Assignment Errors - Debug Guide

## Issue Summary
When attempting to assign a main guest with 2 plus ones to an empty table, the application returns multiple 409 (Conflict) and 500 (Internal Server Error) responses.

## Root Causes Identified

### 1. **500 Internal Server Error**
**Primary Cause:** PostgreSQL connection closures from Neon.tech

**Evidence:**
```
prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
```

**Why This Happens:**
- Neon.tech is a serverless PostgreSQL provider that may close idle connections
- The connection pooler settings were not optimized for serverless environments
- Prisma client doesn't automatically reconnect when connections drop

**Fixes Applied:**
1. ✅ Updated `DATABASE_URL` to include `pgbouncer=true` for better connection pooling
2. ✅ Added `connect_timeout=10` to handle slow connections
3. ✅ Increased `pool_timeout` from 20 to 30 seconds
4. ✅ Enhanced Prisma client initialization with connection handling in `lib/prisma.ts`
5. ✅ Added graceful shutdown to disconnect cleanly on process exit
6. ✅ Improved error handling to detect and report connection errors (P1001, P1017)

### 2. **409 Conflict Error**
**Possible Causes:**
1. Guest is already seated at a different table (requires confirmation to move)
2. Guest is already seated at the same table (duplicate assignment attempt)
3. Frontend making multiple concurrent requests for the same guest

**How It Works:**
- When assigning a guest, the API checks if they're already seated elsewhere
- If seated elsewhere, returns 409 with `ALREADY_SEATED` error
- Frontend should show a confirmation dialog asking if you want to move the guest
- If user confirms, frontend should retry with `force: true` flag

## Changes Made

### File: `lib/prisma.ts`
```typescript
// Added connection management
- Explicit $connect() call with success/error logging
- Graceful shutdown handler to disconnect on process exit
- Better error handling for connection issues
```

### File: `app/api/admin/seating/[id]/tables/[tableId]/seats/route.ts`
```typescript
// Added comprehensive debug logging
- Log guest assignment details (name, plus ones, seats needed)
- Log existing seat checks
- Log capacity checks
- Log seat creation progress
- Enhanced error messages with Prisma error codes
- Return 503 for database connection errors (not 500)
```

### File: `.env`
```bash
# Updated connection string
DATABASE_URL="postgresql://...?sslmode=require&pgbouncer=true&connection_limit=10&pool_timeout=30&connect_timeout=10"
```

## How to Debug Further

### Step 1: Restart the Development Server
The connection pool changes require a server restart:
```bash
# Kill current process
# Restart with: npm run dev
```

### Step 2: Watch Server Console Logs
When you try to assign the guest again, you'll now see detailed logs:

```
Assigning guest to table: {
  guestId: 'xxx',
  tableId: 'yyy',
  guestName: 'John Doe',
  allowPlusOne: true,
  plusOneNames: ['Jane Doe', 'Jack Doe'],
  totalSeatsNeeded: 3,
  force: false
}

Existing seat check: {
  hasExistingSeat: true/false,
  existingTableId: 'zzz',
  targetTableId: 'yyy',
  isSameTable: false
}

Capacity check: {
  tableName: 'Table 1',
  tableCapacity: 10,
  currentSeats: 0,
  availableSeats: 10,
  totalSeatsNeeded: 3,
  willFit: true
}

Creating main seat for guest: xxx
Main seat created: seat_id_1
Creating 2 plus one seats
Creating plus one seat for: Jane Doe
Creating plus one seat for: Jack Doe
All seats created successfully. Total: 3
```

### Step 3: Check for Specific Errors

#### If you see "ALREADY_AT_TABLE" (409):
- The guest is already assigned to this exact table
- Frontend should prevent duplicate drag/drop operations
- Check if the guest list shows them already seated

#### If you see "ALREADY_SEATED" (409):
- The guest is seated at a different table
- Frontend should show confirmation dialog
- User should confirm to move them (will retry with force=true)

#### If you see "Insufficient capacity" (400):
- Table doesn't have enough empty seats
- Check: totalSeatsNeeded vs availableSeats in logs
- Verify: Plus ones are being counted correctly

#### If you see "Database connection error" (503):
- Connection pool issue persists
- Check if DATABASE_URL is correct
- Verify Neon database is online
- Check network connectivity

#### If you see "P2002" error (409):
- Duplicate key constraint violation
- Likely trying to create duplicate seat
- Check for race conditions (multiple concurrent requests)

## Testing Checklist

1. ✅ Restart development server
2. ⬜ Try assigning a guest WITHOUT plus ones to empty table
3. ⬜ Try assigning a guest WITH 1 plus one to empty table
4. ⬜ Try assigning a guest WITH 2 plus ones to empty table
5. ⬜ Try moving a seated guest to a different table
6. ⬜ Try assigning guest to a table that's already full
7. ⬜ Check server console for detailed logs
8. ⬜ Verify database connection stays alive during operations

## Expected Behavior

### Successful Assignment:
1. Frontend calls POST `/api/admin/seating/{chartId}/tables/{tableId}/seats`
2. Backend checks if guest is already seated
3. Backend calculates seats needed (1 + plus ones)
4. Backend verifies table capacity
5. Backend creates main seat + plus one seats
6. Backend returns 201 with all created seats
7. Frontend updates UI to show guest at table

### Moving Existing Guest:
1. Frontend attempts assignment
2. Backend returns 409 with current table info
3. Frontend shows confirmation dialog
4. User confirms move
5. Frontend retries with `force: true`
6. Backend deletes old seats, creates new ones
7. Backend returns 201 with new seats
8. Frontend updates UI

## Additional Monitoring

### Watch Neon Dashboard
- Check active connections
- Monitor query performance
- Look for connection errors or throttling

### Check Browser DevTools
- Network tab: Look for failed requests
- Console: Check for frontend errors
- Look for duplicate/concurrent requests

## Next Steps If Issue Persists

1. **Check Neon Connection String**: Verify it's using the `-pooler` endpoint
2. **Increase Connection Limits**: May need to upgrade Neon plan
3. **Add Request Debouncing**: Prevent rapid duplicate requests from frontend
4. **Implement Retry Logic**: Automatically retry failed requests with exponential backoff
5. **Consider Connection Pooling**: Use PgBouncer or similar for better connection management

## Contact Points

- Neon Status: https://neon.tech/status
- Prisma Docs: https://www.prisma.io/docs/guides/database/troubleshooting-orm
- Next.js Docs: https://nextjs.org/docs
