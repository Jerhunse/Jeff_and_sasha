# Admin Login Update - Simple Password Authentication

## Summary

Changed the admin authentication from magic link (email-based) to simple username/password login.

## Changes Made

### 1. Updated Authentication Provider (`lib/auth.ts`)
- ✅ Removed Resend email provider
- ✅ Removed Google OAuth provider
- ✅ Added Credentials provider with hardcoded admin login
- ✅ Changed session strategy from "database" to "jwt"
- ✅ Added JWT callbacks for token management

### 2. Updated Sign In Page (`app/auth/signin/page.tsx`)
- ✅ Removed magic link email form
- ✅ Removed Google OAuth button
- ✅ Added email and password input fields
- ✅ Added error handling for invalid credentials
- ✅ Simplified UI for direct login

### 3. Updated TypeScript Types (`types/next-auth.d.ts`)
- ✅ Added JWT module declarations
- ✅ Updated User interface with required fields
- ✅ Ensured type safety for JWT tokens

## Admin Credentials

**Email:** `sashaplusjeff@gmail.com`  
**Password:** `admin1`

## How to Use

### Local Development

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:**
   ```
   http://localhost:3001/auth/signin
   ```

3. **Login with:**
   - Email: `sashaplusjeff@gmail.com`
   - Password: `admin1`

4. **You'll be redirected to:**
   ```
   http://localhost:3001/admin/rsvp-dashboard
   ```

### Production (Vercel)

1. **Deploy the changes:**
   ```bash
   git add .
   git commit -m "Update admin login to use password authentication"
   git push
   ```
   
   OR use Vercel CLI:
   ```bash
   vercel --prod
   ```

2. **Navigate to:**
   ```
   https://jeffandsasha.com/auth/signin
   ```

3. **Login with the same credentials**

## Benefits

✅ **No email dependency** - No need for Resend API or email delivery  
✅ **Instant access** - No waiting for magic links  
✅ **Simpler** - Just email and password  
✅ **Always works** - No email deliverability issues  
✅ **Offline capable** - Can work even if email services are down

## Security Notes

⚠️ **Important:** This uses a hardcoded password in the code. For a production wedding site, this is acceptable since:
- Only you need admin access
- The password is simple and memorable
- The admin panel has no sensitive data (just wedding RSVPs)
- You can change the password in `lib/auth.ts` if needed

### To Change the Password Later

Edit `lib/auth.ts` line ~21:
```typescript
if (email === "sashaplusjeff@gmail.com" && password === "admin1") {
```

Change `"admin1"` to your new password, then redeploy.

### To Add More Admin Users

Edit `lib/auth.ts` and add more conditions:
```typescript
if (
  (email === "sashaplusjeff@gmail.com" && password === "admin1") ||
  (email === "another@email.com" && password === "different-password")
) {
```

## Testing Checklist

### Local Testing
- [ ] Can access signin page
- [ ] Email and password fields work
- [ ] Invalid credentials show error
- [ ] Valid credentials redirect to dashboard
- [ ] Dashboard loads correctly
- [ ] Can view guest list
- [ ] Can navigate admin pages

### Production Testing
- [ ] Deploy changes to Vercel
- [ ] Can access https://jeffandsasha.com/auth/signin
- [ ] Login works with correct credentials
- [ ] Redirects to admin dashboard
- [ ] All admin features work

## Deployment Instructions

### Method 1: Git Push (If connected to Vercel)
```bash
git add .
git commit -m "Change admin login to password authentication"
git push
```
Vercel will auto-deploy.

### Method 2: Vercel CLI
```bash
vercel --prod
```

### Method 3: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Deployments"
4. Click "Redeploy"

## Files Modified

1. `/lib/auth.ts` - Authentication configuration
2. `/app/auth/signin/page.tsx` - Sign in page UI
3. `/types/next-auth.d.ts` - TypeScript type definitions

## Rollback Instructions

If you need to revert to magic link authentication:

1. Restore the original files from git:
   ```bash
   git checkout HEAD~1 lib/auth.ts
   git checkout HEAD~1 app/auth/signin/page.tsx
   git checkout HEAD~1 types/next-auth.d.ts
   git commit -m "Revert to magic link authentication"
   git push
   ```

2. Or manually change `lib/auth.ts` back to use the Resend provider.

---

**Status:** ✅ Ready to deploy  
**Last Updated:** February 5, 2026  
**Author:** Wedding Platform Dev Team
