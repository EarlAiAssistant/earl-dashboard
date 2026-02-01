# Google Docs Export Integration

## Overview

Allow users to export their generated content directly to Google Docs with one click.

## Setup Required (Drew's Tasks)

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create new project: "Voxify"
3. Enable these APIs:
   - Google Drive API
   - Google Docs API

### 2. Configure OAuth Consent Screen
1. Go to APIs & Services → OAuth consent screen
2. Choose "External" user type
3. Fill in:
   - App name: Voxify
   - User support email: support@getvoxify.com
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/documents`
5. Add test users (your email) while in development

### 3. Create OAuth Credentials
1. Go to APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs:
   - `https://voxify.run/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (for dev)
5. Copy Client ID and Client Secret

### 4. Add Environment Variables
Add to Vercel:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://voxify.run/api/auth/google/callback
```

## Implementation (Done by Earl)

### Files Created:
- `src/app/api/auth/google/route.ts` - Initiates OAuth flow
- `src/app/api/auth/google/callback/route.ts` - Handles OAuth callback
- `src/app/api/export/google-docs/route.ts` - Creates Google Doc
- `src/components/ExportToGoogleDocs.tsx` - UI button component

### User Flow:
1. User clicks "Export to Google Docs" on results page
2. If not connected, redirects to Google OAuth
3. User grants permission
4. Content is exported as a new Google Doc
5. User gets link to the created document

## Security Notes

- Tokens stored in Supabase `user_integrations` table
- Refresh tokens encrypted at rest
- Only `drive.file` scope (can only access files created by app)
- Users can revoke access anytime in Google Account settings

---

*Integration spec created February 2026*
