# Aditya Fortune Towers Welfare Association (AFTOWA) Digital Portal

A modern, secure, and fully-featured digital community portal for managing residential society operations, events, and financial transparency.

## Tech Stack
* **Frontend:** React, Vite, TypeScript, Tailwind CSS
* **Backend:** Supabase (Auth, Postgres DB, Storage)
* **Features:** Role-Based Access Control, Real-Time Ledgers, Transparent Receipt Uploads, Members Directory.

---

## 🚀 How to Run Locally

1. **Install Dependencies**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   Rename `.env.example` to `.env.local` and add your Supabase URL and Anon Key.
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

---

## 📦 Git & Deployment Guide

Follow these steps to safely add your changes, commit them, and push them to your GitHub repository.

### Step 1: Check your changes
See which files have been modified or created:
```bash
git status
```

### Step 2: Add your changes
Stage all the modified files to be committed. (Thanks to the `.gitignore` file, your sensitive `.env.local` keys will automatically be excluded!)
```bash
git add .
```

### Step 3: Commit your changes
Save your staged changes with a descriptive message:
```bash
git commit -m "Finalized Accounts Module, and Project Documentation"
```

### Step 4: Push to your repository
Push the commit from your local machine to your remote repository (e.g., GitHub):
```bash
git push origin main
```
*(Note: If your default branch is `master` instead of `main`, use `git push origin master`)*

---

### Deploying to Vercel or Netlify
If you are deploying this site:
1. Connect your GitHub repository to Vercel/Netlify.
2. In the deployment dashboard, go to the **Environment Variables** settings.
3. Manually add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Trigger the deployment!
