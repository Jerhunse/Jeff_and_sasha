# Quick Reference: HTTP Status Codes in Seating API

## Status Codes You're Seeing

### 🔴 500 - Internal Server Error
**What it means:** Something unexpected went wrong on the server

**In your case:**
- PostgreSQL connection dropped/closed
- Neon.tech serverless database connection issue
- Prisma client couldn't execute query

**What to look for in logs:**
```
prisma:error Error in PostgreSQL connection: Error { kind: Closed, cause: None }
Create seat error: { ... }
```

**Fix:** Database connection settings have been updated. Restart server.

---

### 🟡 409 - Conflict
**What it means:** Request conflicts with current state

**In your case - Scenario 1: ALREADY_SEATED**
- Guest is already assigned to a different table
- Frontend should show: "Move guest from Table X to Table Y?"
- User confirms → Frontend retries with `force: true`

**In your case - Scenario 2: ALREADY_AT_TABLE**
- Guest is already at this exact table
- This is likely a duplicate request
- Frontend should not allow this action

**What to look for in logs:**
```
Existing seat check: {
  hasExistingSeat: true,
  existingTableId: 'abc',
  targetTableId: 'xyz',
  isSameTable: false
}
```

---

### 🟠 400 - Bad Request
**What it means:** Invalid request data or business logic violation

**In your case: Insufficient Capacity**
- Table doesn't have enough seats for guest + plus ones
- Example: Need 3 seats (1 guest + 2 plus ones), but only 2 available

**What to look for in logs:**
```
Capacity check: {
  tableCapacity: 10,
  currentSeats: 8,
  availableSeats: 2,
  totalSeatsNeeded: 3,
  willFit: false
}
```

---

### 🟢 201 - Created
**What it means:** Success! Seats created

**Response includes:**
```json
{
  "seats": [
    { "id": "...", "guestId": "...", "notes": null },
    { "id": "...", "guestId": "...", "notes": "PLUS_ONE:Jane Doe" },
    { "id": "...", "guestId": "...", "notes": "PLUS_ONE:John Smith" }
  ]
}
```

---

## Error Flow Diagram

```
User drags guest to table
        ↓
Frontend: POST /api/.../seats
        ↓
Backend: Check if already seated
        ↓
    ┌───┴───┐
   Yes     No
    ↓       ↓
  409     Check capacity
          ↓
      ┌───┴───┐
     OK    Not OK
      ↓       ↓
   Create   400
   seats
      ↓
    201
```

## Common Issues & Solutions

| Error | Symptom | Solution |
|-------|---------|----------|
| 500 | Random failures | Restart server, check DB connection |
| 409 | "Already seated" | User confirms move, retry with force=true |
| 409 | "Already at table" | Prevent duplicate drag operations |
| 400 | "Insufficient capacity" | Choose table with more seats |

## Debugging Commands

```bash
# Check server logs
tail -f .cursor/projects/.../terminals/[server-terminal].txt

# Test database connection
npx prisma db execute --stdin <<< "SELECT 1"

# Check Prisma client
npx prisma generate

# Restart dev server
npm run dev
```
