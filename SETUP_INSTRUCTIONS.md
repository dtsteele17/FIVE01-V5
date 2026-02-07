# FIVE01 Darts - Complete Setup Guide

## 🎯 What You Have

This is a **COMPLETE WORKING WEBSITE** with:
- ✅ Tournaments
- ✅ Leagues  
- ✅ Quick Match
- ✅ DartBot
- ✅ Stats & Leaderboards
- ✅ Achievements
- ✅ Match History

## 🚀 Quick Start (3 Steps)

### Step 1: Create New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Give it a name (e.g., "five01-darts")
4. Wait for it to be created

### Step 2: Run the SQL

1. In your new Supabase project, click **"SQL Editor"**
2. Click **"New Query"**
3. Open the file `SUPABASE_SETUP.sql` from this folder
4. Copy ALL the SQL
5. Paste it into Supabase
6. Click **"Run"**

Wait for it to finish (should say "Success" with no errors)

### Step 3: Upload to Bolt.new

1. Go to https://bolt.new
2. Drag and drop this **entire folder** (FIVE01_COMPLETE_WORKING)
3. Wait for it to upload and install
4. Click **"Connect to Supabase"** in the top right
5. Connect to your NEW Supabase project
6. Done!

## ⚙️ Environment Variables

Bolt.new will automatically add these, but just in case you need them:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎮 What's Working

### Pages
- `/` - Landing page
- `/login` - Login
- `/signup` - Sign up
- `/dashboard` - Main dashboard
- `/play` - Play menu
- `/quick-match` - Find quick matches
- `/lobby-create` - Create a lobby
- `/tournaments` - Browse tournaments
- `/tournaments/create` - Create tournament
- `/tournament/:id` - Tournament details
- `/leagues` - Browse leagues
- `/league/:id` - League details
- `/stats` - Stats dashboard
- `/match-history` - Your match history
- `/achievements` - Your achievements
- `/leaderboards` - Global leaderboards
- `/training` - Training modes
- `/play/dartbot` - Play against bot
- `/game/:id` - Play a match

## 🛠️ If Something Doesn't Work

### Can't Create Tournaments?
- Check the SQL ran successfully
- Check you're logged in
- Check browser console (F12) for errors

### Leaderboards Empty?
- Normal! They show after people play matches
- Play some games first

### Achievements Not Unlocking?
- Play matches to unlock them
- They unlock automatically when you meet requirements

## 📞 Need Help?

If something breaks:
1. Check browser console (F12 → Console tab) for red errors
2. Check Supabase logs (Database → Logs)
3. Make sure all SQL ran successfully

## ✅ Checklist

Before saying it's broken, check:
- [ ] New Supabase project created
- [ ] SQL ran successfully (no errors)
- [ ] Connected to correct Supabase project in bolt.new
- [ ] Created an account / logged in
- [ ] Tried refreshing the page

---

**This should all work!** If it doesn't, tell me the exact error message from the browser console.
