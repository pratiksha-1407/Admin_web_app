
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://phkkiyxfcepqauxncqpm.supabase.co';
const supabaseKey = 'sb_publishable_GdCo8okHOGBmrW9OH_qsZg_PDOl7a1u';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase Tables...');

    // 1. Test admins
    console.log('\n--- Testing admins ---');
    const { data: admins, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .limit(1);

    if (adminError) console.error('Error fetching admins:', adminError.message, adminError.code);
    else console.log('Success! Found admins:', admins?.length);

    // 2. Test emp_profile
    console.log('\n--- Testing emp_profile ---');
    const { data: users, error: userError } = await supabase
        .from('emp_profile')
        .select('*')
        .limit(1);

    if (userError) console.error('Error fetching emp_profile:', userError.message, userError.code);
    else console.log('Success! Found emp_profile rows:', users?.length);

    // 3. Test branches
    console.log('\n--- Testing branches ---');
    const { data: branches, error: branchError } = await supabase
        .from('branches')
        .select('*')
        .limit(1);

    if (branchError) {
        console.error('Error fetching branches:', branchError.message, branchError.code);
    } else {
        console.log('Success! Found branches:', branches?.length);
    }
}

testConnection();

