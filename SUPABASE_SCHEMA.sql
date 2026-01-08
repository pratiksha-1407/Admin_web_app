-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT,
    city TEXT,
    state TEXT,
    address TEXT,
    contact_phone TEXT,
    contact_person TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Policies for branches
CREATE POLICY "Enable read access for all authenticated users" ON public.branches
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for all authenticated users" ON public.branches
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for all authenticated users" ON public.branches
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for all authenticated users" ON public.branches
    FOR DELETE TO authenticated USING (true);

-- Create emp_profile table if it doesn't exist (it seems to exist but check columns)
CREATE TABLE IF NOT EXISTS public.emp_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT,
    phone_number TEXT,
    role TEXT DEFAULT 'Employee',
    joining_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for emp_profile
ALTER TABLE public.emp_profile ENABLE ROW LEVEL SECURITY;

-- Policies for emp_profile
CREATE POLICY "Users can read all profiles" ON public.emp_profile
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.emp_profile
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.emp_profile
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Trigger to create profile on signup (optional but good practice)
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.emp_profile (id, email, full_name, role)
--   VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'Employee');
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
