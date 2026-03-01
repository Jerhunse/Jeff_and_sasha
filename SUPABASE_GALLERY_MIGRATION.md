# Gallery Migration to Supabase Storage - Complete

## Summary

Successfully migrated the wedding photo/video gallery from Google Drive to Supabase Storage. This eliminates the Google Drive service account quota restriction and simplifies the architecture.

## What Changed

### 1. New Storage Backend
- **Created**: `lib/gallery-storage.ts` - Supabase Storage wrapper
- **Deleted**: `lib/google-drive.ts` - Google Drive wrapper
- **Bucket**: `gallery` bucket in Supabase with public read/write policies

### 2. API Routes Updated
- `app/api/gallery/route.ts` - Now lists files from Supabase Storage
- `app/api/gallery/upload/route.ts` - Now uploads to Supabase Storage
- Pagination changed from `pageToken` to `offset`-based

### 3. Frontend Updates
- `app/(public)/gallery/page.tsx` - Updated to use Supabase public URLs, offset pagination
- `components/gallery/media-lightbox.tsx` - Updated to use `url` field instead of `webContentLink`
- `components/gallery/upload-dialog.tsx` - No changes needed (still POSTs to same endpoint)

### 4. Environment Variables
- **Added**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (explicit in .env)
- **Removed**: `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64`
- **Note**: `SUPABASE_SERVICE_ROLE_KEY` will be needed for production uploads (bypasses RLS)

### 5. Cleanup
- Removed `credentials/google-service-account.json`
- Removed `scripts/test-gallery.ts` and `scripts/verify-gallery.sh`
- Removed documentation: `GOOGLE_DRIVE_SETUP.md`, `GALLERY_*.md` files
- Removed packages: `googleapis`, `google-auth-library` from `package.json`

## Next Steps

### 1. Create Storage Bucket in Supabase Dashboard

Run the SQL in `supabase-gallery-storage.sql`:

```sql
-- Create the gallery storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view files in the gallery bucket
CREATE POLICY "Public read access for gallery"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- Policy: Anyone can upload files to the gallery bucket (public uploads)
CREATE POLICY "Public upload access for gallery"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery');

-- Policy: Only authenticated users can delete (for admin cleanup)
CREATE POLICY "Authenticated users can delete gallery files"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
```

Or create the bucket via the Supabase dashboard:
1. Go to Storage in Supabase dashboard
2. Click "Create bucket"
3. Name: `gallery`
4. Public bucket: **Yes**
5. Add the RLS policies above via SQL editor

### 2. Add Service Role Key to Vercel (Optional but Recommended)

The service role key allows server-side uploads to bypass RLS restrictions:

1. Get your service role key from Supabase dashboard (Settings > API)
2. Add to Vercel: `vercel env add SUPABASE_SERVICE_ROLE_KEY production`
3. Paste the service role key when prompted

Without this, uploads will use the anonymous key which requires the RLS INSERT policy to allow public uploads (already configured in the SQL above).

### 3. Test the Gallery

1. Visit https://jeffandsasha.com/gallery
2. The page should load (may show "No photos yet" if bucket is empty)
3. Click the upload button (+)
4. Select photos/videos to upload
5. Verify uploads complete successfully
6. Check that uploaded media appears in the gallery

## Benefits

- **No quota restrictions** - Supabase Storage has generous limits
- **Simpler auth** - No service account configuration needed
- **Better performance** - Direct CDN URLs instead of Google Drive API
- **Easier management** - View/delete files via Supabase dashboard
- **Already in stack** - No new dependencies, Supabase already used for RSVP

## Deployment

**Status**: ✅ Deployed to production
- URL: https://jeffandsasha.com
- Deployment: https://wedding-platform-rkmzx3hgm-jeffs-projects-bf57b1a5.vercel.app
- Build: Successful

## Rollback (if needed)

If issues arise, the Google Drive implementation can be restored by:
1. Reverting the changes in git
2. Re-adding the Google Drive env vars to Vercel
3. Running `npm install` to restore googleapis packages
4. Redeploying

However, Supabase Storage is the recommended approach going forward.
