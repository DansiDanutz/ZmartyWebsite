# 🔒 Security Upgrade - Hidden Supabase Credentials

**Date:** 2025-10-04
**Issue:** Supabase credentials were visible in HTML source code
**Solution:** Moved credentials to Netlify serverless function

---

## ✅ What Changed

### Before (Insecure):
```html
<!-- Credentials visible in HTML source -->
<script>
const SUPABASE_URL = 'https://xhskmqsgtdhehzlvtuns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR...';
</script>
```

### After (Secure):
```html
<!-- Credentials fetched from serverless function -->
<script src="../js/supabase-config.js"></script>
<script>
  supabaseClient = await window.initializeSupabaseClient();
</script>
```

---

## 📁 New Files Created

1. **`netlify/functions/get-supabase-config.js`**
   - Serverless function that reads credentials from Netlify environment variables
   - Returns credentials via API call
   - CORS-enabled for frontend access

2. **`js/supabase-config.js`**
   - Client-side loader that fetches config from serverless function
   - Initializes Supabase client with fetched credentials
   - Handles errors gracefully

3. **`.env.example`**
   - Template for environment variables
   - Instructions for local development and Netlify deployment

---

## 🚀 Deployment Steps

### 1. Add Environment Variables to Netlify

Go to: https://app.netlify.com/sites/zmarty/settings/deploys#environment

Add these variables:
```
SUPABASE_URL=https://xhskmqsgtdhehzlvtuns.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhoc2ttcXNndGRoZWh6bHZ0dW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDkzNTQsImV4cCI6MjA3MzcyNTM1NH0.ULAf9vNHS4nasSnv9UOKS2MCKsSxcMtV3C-R7Wm6qMw
```

### 2. Deploy to Netlify

```bash
git add .
git commit -m "🔒 Hide Supabase credentials using serverless function"
git push origin main
```

Netlify will:
- Detect the new function in `netlify/functions/`
- Build and deploy it automatically
- Make it available at `/.netlify/functions/get-supabase-config`

### 3. Test the Deployment

1. Visit: https://zmarty.netlify.app/onboarding/signup
2. Open browser console (F12)
3. Check for: `✅ Supabase client initialized successfully`
4. View page source - credentials should NOT be visible

---

## 🔍 How It Works

```
User visits page
       ↓
Page loads supabase-config.js
       ↓
Script calls /.netlify/functions/get-supabase-config
       ↓
Serverless function reads NETLIFY_ENV variables
       ↓
Returns credentials as JSON (only to your domain)
       ↓
Script initializes Supabase client
       ↓
User can sign up/login securely
```

---

## 🛡️ Security Benefits

1. ✅ **Credentials not in HTML source**
   - Users can't copy credentials from "View Source"
   - Credentials fetched dynamically at runtime

2. ✅ **Environment-specific configs**
   - Different credentials for dev/staging/production
   - Managed via Netlify dashboard

3. ✅ **CORS protection**
   - Serverless function only responds to allowed origins
   - Prevents unauthorized API calls

4. ✅ **Easy credential rotation**
   - Update in Netlify dashboard
   - No code changes required
   - Instant deployment

---

## 📝 Files Modified

### Updated Files:
- `onboarding/signup.html` - Uses new config loader
- `onboarding/signin.html` - Uses new config loader
- `onboarding/verify.html` - Uses new config loader
- `onboarding/welcome.html` - Uses new config loader

### New Files:
- `netlify/functions/get-supabase-config.js` - Serverless function
- `js/supabase-config.js` - Client-side loader
- `.env.example` - Environment variable template
- `SECURITY_UPGRADE.md` - This file

---

## ⚠️ Important Notes

### For Netlify:
- Environment variables MUST be set in Netlify dashboard
- Without them, authentication will fail
- Changes to env vars require redeployment (clear cache + redeploy)

### For Local Development:
1. Create `.env` file: `cp .env.example .env`
2. Fill in actual credentials
3. Use Netlify CLI: `netlify dev` (reads from .env)

### Security Considerations:
- `anon` key is still public (meant for frontend)
- RLS policies in Supabase protect your data
- NEVER expose `service_role` key

---

## 🧪 Testing Checklist

- [ ] Environment variables added to Netlify
- [ ] Code pushed to GitHub
- [ ] Netlify build successful
- [ ] Function endpoint accessible: `/.netlify/functions/get-supabase-config`
- [ ] Signup page loads without errors
- [ ] Signin page loads without errors
- [ ] Credentials NOT visible in page source
- [ ] Console shows: `✅ Supabase client initialized successfully`

---

**Implemented by:** Claude Code
**Status:** ✅ Ready for Deployment
