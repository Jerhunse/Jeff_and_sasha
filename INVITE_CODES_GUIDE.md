# Invite Codes Guide

This guide explains how to generate and use invite codes that allow guests to access the RSVP form.

## Overview

Each guest has a unique `inviteToken` that serves as their invite code. This code allows them to access their personalized RSVP form at `/rsvp/{code}`.

## How It Works

1. **Automatic Generation**: New guests automatically receive an `inviteToken` when created (defaults to `cuid()`).

2. **Manual Generation**: You can generate or regenerate invite codes for existing guests using:
   - Admin UI buttons
   - API endpoints
   - Command-line script

3. **RSVP Access**: Guests use their invite code to access the RSVP form at:
   ```
   https://yourdomain.com/rsvp/{inviteCode}
   ```

## Methods to Generate Invite Codes

### Method 1: Admin UI - Bulk Generation

1. Navigate to **Admin → Guests**
2. Click the **"Generate Invite Codes"** button in the actions bar
3. Confirm the action
4. Codes will be generated for all guests without codes

### Method 2: Admin UI - Individual Guest

1. Navigate to **Admin → Guests**
2. Find the guest in the table
3. Click the **⋮** (three dots) menu next to the guest
4. Select **"Generate Invite Code"**
5. The code and RSVP URL will be displayed and copied to clipboard

### Method 3: API Endpoints

#### Generate Code for Single Guest

```bash
POST /api/admin/guests/{guestId}/generate-invite-code
```

**Response:**
```json
{
  "success": true,
  "guest": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "inviteCode": "abc123xyz"
  },
  "inviteCode": "abc123xyz",
  "rsvpUrl": "https://yourdomain.com/rsvp/abc123xyz"
}
```

#### Generate Codes for Multiple Guests

```bash
POST /api/admin/guests/generate-invite-codes
Content-Type: application/json

{
  "guestIds": ["guest-id-1", "guest-id-2"],  // Optional: specific guest IDs
  "all": true,                              // Optional: generate for all guests without codes
  "regenerate": false                        // Optional: regenerate even if code exists
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 10,
    "success": 10,
    "failed": 0
  },
  "guests": [
    {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "inviteCode": "abc123xyz",
      "rsvpUrl": "https://yourdomain.com/rsvp/abc123xyz"
    }
  ]
}
```

### Method 4: Command-Line Script

```bash
# Generate codes for all guests without codes
tsx scripts/generate-invite-codes.ts --all

# Generate codes for a specific couple
tsx scripts/generate-invite-codes.ts --couple-id <couple-id>

# Generate code for a specific guest
tsx scripts/generate-invite-codes.ts --guest-id <guest-id>

# Regenerate codes even if they exist
tsx scripts/generate-invite-codes.ts --all --regenerate

# Dry run to see what would be done
tsx scripts/generate-invite-codes.ts --all --dry-run
```

## Code Format

- **Length**: 10 characters
- **Format**: URL-safe alphanumeric (using `nanoid`)
- **Uniqueness**: Guaranteed unique across all guests
- **Example**: `aB3xY9mK2p`

## Security Considerations

### Why This Approach is Secure

1. **Unique Codes**: Each code is cryptographically random and unique
2. **No Enumeration**: Codes are not sequential or predictable
3. **Access Control**: Codes are tied to specific guests and couples
4. **Validation**: The system validates codes before allowing RSVP access

### Best Practices

1. **Don't Share Codes Publicly**: Each code is personal to a guest
2. **Regenerate if Compromised**: If a code is accidentally shared, regenerate it
3. **Use HTTPS**: Always use HTTPS in production to protect codes in transit
4. **Monitor Usage**: Track RSVP submissions to detect unusual activity

## Integration with Invitations

When sending invitations via email or SMS, include the RSVP link:

```typescript
const rsvpLink = `${baseUrl}/rsvp/${guest.inviteToken}`
```

The invitation system automatically includes this link in emails.

## Troubleshooting

### Guest Can't Access RSVP Form

1. **Check if code exists**: Verify the guest has an `inviteToken`
2. **Regenerate code**: Generate a new code if needed
3. **Verify URL format**: Ensure the URL is `/rsvp/{code}` (not `/rsvp?code={code}`)

### Code Already Exists Error

- This should be rare, but if it happens, the system will retry up to 10 times
- If it persists, check for database constraints or duplicate entries

### Bulk Generation Fails

- Check that you have proper authentication (must be logged in as couple admin)
- Verify the couple ID matches your session
- Check server logs for specific error messages

## Example Workflow

1. **Import Guests**: Import guests from CSV or Google Contacts
   - Codes are automatically generated during import

2. **Verify Codes**: Check that all guests have codes
   ```bash
   tsx scripts/generate-invite-codes.ts --all --dry-run
   ```

3. **Generate Missing Codes**: Generate codes for any guests without them
   ```bash
   tsx scripts/generate-invite-codes.ts --all
   ```

4. **Send Invitations**: Use the campaign system to send invitations with RSVP links

5. **Monitor RSVPs**: Track RSVP submissions in the admin dashboard

## API Reference

### Generate Single Code

**Endpoint**: `POST /api/admin/guests/[id]/generate-invite-code`

**Authentication**: Required (must be couple admin)

**Response Codes**:
- `200`: Success
- `401`: Unauthorized
- `404`: Guest not found
- `500`: Server error

### Generate Multiple Codes

**Endpoint**: `POST /api/admin/guests/generate-invite-codes`

**Authentication**: Required (must be couple admin)

**Request Body**:
```typescript
{
  guestIds?: string[]    // Optional: specific guest IDs
  all?: boolean          // Optional: generate for all without codes
  regenerate?: boolean   // Optional: regenerate existing codes
}
```

**Response Codes**:
- `200`: Success (may include partial failures)
- `400`: Bad request (missing required parameters)
- `401`: Unauthorized
- `404`: No guests found
- `500`: Server error
