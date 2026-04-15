# 🚀 Deployment Guide - Vercel

## Prerequisites
- Supabase project setup
- GitHub account with repository pushed
- Vercel account

## Steps to Deploy

### 1. Prepare Environment Variables
Copy `.env.example` and fill in your actual values:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push -u origin main
```

### 3. Connect to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `Attendify` repository
4. Click "Continue"

### 4. Set Environment Variables in Vercel
1. Scroll to "Environment Variables"
2. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Your Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY` → Your Service Role Key

   **⚠️ Important:** 
   - `NEXT_PUBLIC_*` variables are safe to expose (frontend)
   - `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Visit your live site!

## Troubleshooting

### Build Error: "supabaseUrl is required"
This means environment variables aren't set in Vercel.
- Go to Vercel Project Settings → Environment Variables
- Add all three Supabase variables
- Redeploy

### Build Error: "Cannot find module"
- Make sure all imports are correct
- Run `npm install` locally and test with `npm run build`
- Push changes and redeploy

### Authentication Issues
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Check Supabase Auth is enabled
- Ensure users exist in Supabase

## Production Tips

✅ **Do:**
- Enable edge caching in Vercel (Settings → Performance)
- Set up automatic deployments from `main` branch
- Monitor build logs in Vercel dashboard
- Use Vercel Analytics for performance insights

❌ **Don't:**
- Commit `.env.local` to GitHub
- Use development keys in production
- Disable authentication checks

## Updating After Deployment

To deploy updates:
```bash
git commit -am "Your changes"
git push
```

Vercel will automatically redeploy on push to `main` branch.

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
