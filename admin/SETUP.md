# TMNK Admin Panel Setup

## Quick Start

### 1. Clean up boilerplate files
Delete these leftover Vite template files:
```
admin/src/App.css
admin/src/assets/hero.png
admin/src/assets/react.svg
admin/src/assets/vite.svg
admin/eslint.config.js
admin/README.md (not this file — the Vite default one)
admin/public/ (entire folder)
```

### 2. Install dependencies
```bash
cd admin
npm install
```

### 3. Set up Supabase (free)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (pick any region, remember your DB password)
3. Once the project is ready, go to **SQL Editor** and paste the contents of `supabase-schema.sql`, then click **Run**
4. Go to **Settings > API** and copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (the long key)

### 4. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Create your admin account
1. In Supabase, go to **Authentication > Users**
2. Click **Add User > Create New User**
3. Enter your email and a password — this is your admin login

### 6. Run locally
```bash
npm run dev
```
Open http://localhost:5173/TMNK/admin/ and sign in.

---

## Deploy to GitHub Pages

### First time setup
1. In your GitHub repo, go to **Settings > Pages**
2. Under "Build and deployment", select **GitHub Actions**
3. Go to **Settings > Secrets and variables > Actions**
4. Add these repository secrets:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

### Deploy
Push to `main` — the GitHub Action at `.github/workflows/deploy-admin.yml` builds and deploys automatically.

Your admin panel will be at: `https://yourusername.github.io/TMNK/admin/`

---

## Adding more admin users
Go to Supabase **Authentication > Users > Add User**. Anyone with an account can log in and manage content.

## How the public site fetches data
Your public site (`index.html`) can fetch data from Supabase using the same anon key — the RLS policies allow public read access to published events, active members, and all gallery images. Example:

```js
// In your main site's script.js
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_KEY = 'your-anon-key'

async function fetchEvents() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events?published=eq.true&order=date.desc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  })
  return res.json()
}
```

## Tech Stack
- **Frontend**: React 19 + Vite + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: GitHub Pages (static SPA)
- **Icons**: Lucide React
