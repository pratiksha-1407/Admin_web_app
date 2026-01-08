# Admin Authentication Setup Guide

## Problem
The authentication is failing because the `admins` table doesn't exist or your user is not registered as an admin in Supabase.

## Solution: Create the Admins Table

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `phkkiyxfcepqauxncqpm`
3. Click on **SQL Editor** in the left sidebar

### Step 2: Create the Admins Table
Run this SQL script:

```sql
-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own admin status
CREATE POLICY "Users can read own admin status"
    ON public.admins
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Create policy to allow service role to manage admins
CREATE POLICY "Service role can manage admins"
    ON public.admins
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
```

### Step 3: Add Your User as Admin

First, you need to create a user account if you haven't already:

#### Option A: Create Admin User via Supabase Dashboard
1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create new user**
3. Enter email and password
4. Click **Create user**
5. Copy the user's UUID (you'll need this)

#### Option B: Sign Up via the App
1. Modify the login page temporarily to allow sign-up
2. Create an account
3. Check the UUID in Supabase Dashboard

### Step 4: Insert Your User into Admins Table

Run this SQL (replace with your actual user email):

```sql
-- Insert admin user (replace with your actual user email)
INSERT INTO public.admins (id, email)
SELECT id, email 
FROM auth.users 
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;
```

**OR** if you know the user UUID:

```sql
-- Insert admin by UUID
INSERT INTO public.admins (id, email)
VALUES (
    'your-user-uuid-here',
    'your-email@example.com'
);
```

### Step 5: Verify Setup

Run this query to check if your admin was added:

```sql
SELECT * FROM public.admins;
```

You should see your user listed.

## Testing

1. **Clear browser cache** and reload the app
2. Try logging in with your admin credentials
3. Check the browser console (F12) for detailed error messages
4. You should see these console logs:
   - "User authenticated: your-email@example.com"
   - "Admin check result: { adminData: {...}, adminError: null }"
   - "Admin access granted"

## Common Issues

### Issue 1: "relation 'public.admins' does not exist"
**Solution**: The admins table wasn't created. Run the SQL script in Step 2.

### Issue 2: "Not authorized as admin"
**Solution**: Your user exists but isn't in the admins table. Run the SQL script in Step 4.

### Issue 3: "Invalid email or password"
**Solution**: 
- Check your credentials are correct
- Verify the user exists in Authentication → Users
- Make sure email is confirmed (check email for confirmation link)

### Issue 4: "User not found in admins table"
**Solution**: Run this to add yourself:
```sql
INSERT INTO public.admins (id, email)
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

## Quick Fix Script

Run this all-in-one script (replace email):

```sql
-- All-in-one setup script
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own admin status"
    ON public.admins FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Service role can manage admins"
    ON public.admins FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Add your user as admin (REPLACE EMAIL)
INSERT INTO public.admins (id, email)
SELECT id, email FROM auth.users 
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT * FROM public.admins;
```

## After Setup

Once the table is created and your user is added:
1. Refresh the login page
2. Enter your credentials
3. You should be redirected to the dashboard
4. Check browser console for success messages
