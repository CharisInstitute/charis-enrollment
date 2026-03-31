# Charis Christian Institute — Enrollment System Setup Guide

## Overview
This guide walks you through the complete setup in about 20–30 minutes.
Everything used is **free** — Supabase (database) + GitHub Pages (hosting).

---

## STEP 1 — Create Your Supabase Project

1. Go to **https://supabase.com** and click **"Start your project"**
2. Sign up with your email (or Google/GitHub)
3. Click **"New project"**
4. Fill in:
   - **Name:** `charis-enrollment`
   - **Database Password:** Choose a strong password and **save it somewhere safe**
   - **Region:** Choose the closest to West Virginia (e.g. US East)
5. Click **"Create new project"** — wait about 2 minutes for it to build

---

## STEP 2 — Set Up the Database

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-setup.sql` from this folder
4. **Copy the entire contents** and paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see: *"Success. No rows returned"* — that means it worked!

---

## STEP 3 — Get Your API Keys

1. In Supabase, click **"Project Settings"** (gear icon) in the left sidebar
2. Click **"API"**
3. You'll see two values you need:
   - **Project URL** — looks like `https://xyzabcdef.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`
4. Open the file `js/config.js` in this folder
5. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ...your-long-key-here...';
   ```
6. **Save the file**

---

## STEP 4 — Create Your First Staff Account

### 4a. Create the user in Supabase Auth
1. In Supabase, click **"Authentication"** in the left sidebar
2. Click **"Users"** → **"Add user"** → **"Create new user"**
3. Enter:
   - **Email:** `admin@charischristian.edu` (or your real email)
   - **Password:** Choose a strong password
4. Click **"Create user"**
5. Copy the **User UID** shown (looks like: `a1b2c3d4-e5f6-...`)

### 4b. Add their profile to the database
1. Go back to **"SQL Editor"**
2. Run this query (replace values with your actual info):
   ```sql
   insert into public.staff_profiles (id, full_name, email, role)
   values (
     'PASTE-USER-UID-HERE',
     'Your Full Name',
     'admin@charischristian.edu',
     'Administrator'
   );
   ```
3. Click **"Run"**

### 4c. Add more staff the same way
Repeat steps 4a and 4b for each staff member, using one of these roles:
- `'Administrator'` — full access (Students, Payments, Staff tab)
- `'Registrar'` — enrollment and student records
- `'Finance Officer'` — payments and financial reports

---

## STEP 5 — Upload to GitHub and Deploy

### 5a. Create a GitHub account (if needed)
Go to **https://github.com** and sign up for free.

### 5b. Create a new repository
1. Click the **"+"** icon → **"New repository"**
2. Name it: `charis-enrollment`
3. Set it to **Private** (important for security!)
4. Click **"Create repository"**

### 5c. Upload your files
**Option A — Using GitHub's web interface (easiest):**
1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop ALL files from this folder:
   - `index.html`
   - `css/` folder (with `style.css` inside)
   - `js/` folder (with all .js files inside)
3. Click **"Commit changes"**

**Option B — Using Git on your computer:**
```bash
cd charis-enrollment
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/charis-enrollment.git
git push -u origin main
```

### 5d. Enable GitHub Pages
1. In your GitHub repository, click **"Settings"**
2. Click **"Pages"** in the left sidebar
3. Under **"Source"**, select **"Deploy from a branch"**
4. Select branch: **"main"**, folder: **"/ (root)"**
5. Click **"Save"**
6. Wait 1–2 minutes, then your site will be live at:
   `https://YOUR-USERNAME.github.io/charis-enrollment/`

---

## STEP 6 — Configure Supabase to Allow Your Site

1. In Supabase, go to **"Authentication"** → **"URL Configuration"**
2. Under **"Site URL"**, enter your GitHub Pages URL:
   `https://YOUR-USERNAME.github.io`
3. Under **"Redirect URLs"**, add:
   `https://YOUR-USERNAME.github.io/charis-enrollment/`
4. Click **"Save"**

---

## You're Live! 🎉

Share this URL with your staff:
`https://YOUR-USERNAME.github.io/charis-enrollment/`

They log in with the email and password you created in Step 4.

---

## Adding More Staff Later

1. Go to Supabase → **Authentication** → **Users** → **Add user**
2. Create their login (email + password)
3. Copy their User UID
4. Go to **SQL Editor** and run:
   ```sql
   insert into public.staff_profiles (id, full_name, email, role)
   values ('THEIR-UID', 'Their Name', 'their@email.com', 'Registrar');
   ```

---

## Updating the App

If you make changes to the code files:
1. Update the files on GitHub (drag-and-drop upload again, or use Git)
2. GitHub Pages will automatically redeploy within a minute or two

---

## Free Tier Limits (Supabase)

| Resource | Free Limit |
|----------|-----------|
| Database storage | 500 MB |
| API requests | Unlimited |
| Auth users | 50,000 |
| File storage | 1 GB |

More than enough for a school enrollment system!

---

## Need Help?

- Supabase docs: https://supabase.com/docs
- GitHub Pages docs: https://docs.github.com/pages
