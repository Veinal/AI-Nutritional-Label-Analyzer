# Supabase Setup Instructions

This guide will help you set up Supabase for the Nutrition AI App.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `nutrition-ai-app` (or any name you prefer)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose the closest region to your users
5. Click "Create new project" and wait for it to be ready (takes a few minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Run Database Migration

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" to execute the migration
5. This will create:
   - `user_profiles` table for storing user information
   - `chat_sessions` table for storing chat history
   - Row Level Security (RLS) policies to ensure users can only access their own data

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace:
- `your_project_url_here` with your Project URL from Step 2
- `your_anon_key_here` with your anon/public key from Step 2

**Important:** Never commit `.env.local` to version control! It should already be in `.gitignore`.

## Step 5: Install Dependencies

Run the following command to install Supabase:

```bash
npm install
```

## Step 6: Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up with a new account
3. Check your Supabase dashboard → **Authentication** → **Users** to see if the user was created
4. Try creating a profile and check **Table Editor** → **user_profiles** to see if data is saved

## Features Enabled

After setup, you'll have:

✅ **User Authentication**
- Sign up with email/password
- Sign in/Sign out
- Secure session management

✅ **User Profiles**
- Store name, age, gender
- Health conditions/dietary preferences (Diabetic, Pregnant, Vegan, etc.)

✅ **Chat History**
- All conversations are automatically saved
- View and restore previous chat sessions
- Delete old conversations

✅ **Data Security**
- Row Level Security ensures users can only access their own data
- All database operations are authenticated

## Troubleshooting

### "Supabase URL and Anon Key must be set"
- Make sure your `.env.local` file exists and has the correct variables
- Restart your development server after adding environment variables

### "Failed to load profile" or "Failed to save"
- Check that the database migration ran successfully
- Verify RLS policies are enabled in Supabase dashboard → **Authentication** → **Policies**

### Authentication not working
- Check that email confirmation is disabled in Supabase (for development):
  - Go to **Authentication** → **Settings**
  - Under "Email Auth", disable "Confirm email"

## Next Steps

Once everything is set up, users can:
1. Sign up/Sign in to the app
2. Create and update their profile
3. Have their chat history automatically saved
4. View and restore previous conversations

Enjoy your fully integrated Supabase-powered Nutrition AI App! 🎉

