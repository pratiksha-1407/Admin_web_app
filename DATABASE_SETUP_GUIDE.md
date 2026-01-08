# Database Setup Guide

It appears some tables are missing or not fully configured in your Supabase project, causing 404 (Not Found) and 406 (Not Acceptable) errors.

## 1. Run the Schema Script

To fix the missing `branches` table and ensure your `emp_profile` works correctly:

1.  Open your **Supabase Dashboard**.
2.  Go to the **SQL Editor**.
3.  Click **New Query**.
4.  Copy and paste the contents of `SUPABASE_SCHEMA.sql` (located in your project root).
5.  Click **Run**.

## 2. Verify

After running the script:
1.  Reload your application.
2.  Navigate to **Dashboard** - The 404 error for branches should be gone (or return 0 branches without error).
3.  Navigate to **Profile** - The 406 error should be gone. If your profile is empty, you can now update it.
4.  Navigate to **Branch Management** - You should see an empty list instead of an error, and be able to Add a Branch.

## 3. Troubleshooting

-   **Still getting 406 on Profile?**
    -   This means your user ID is not in `emp_profile`. The `ProfilePage` has been updated to handle this gracefully, but you might want to manually insert your user into `emp_profile` if you want to see data immediately, or simply hit "Save" on the profile page to update (upsert) it.

-   **Still getting 404 on Branches?**
    -   Ensure the table was created in the `public` schema.
