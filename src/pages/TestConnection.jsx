import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const TestConnection = () => {
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toISOString()}: ${msg}`]);

    useEffect(() => {
        const test = async () => {
            addLog('Starting connection test...');

            // Test 1: Public Admins
            addLog('Fetching admins...');
            const { data: admins, error: adminError } = await supabase.from('admins').select('*').limit(1);
            if (adminError) addLog(`Admins Error: ${adminError.message}`);
            else addLog(`Admins Success: Found ${admins.length} records`);

            // Test 2: Emp Profile
            addLog('Fetching emp_profile...');
            const { data: emps, error: empError } = await supabase.from('emp_profile').select('*').limit(1);
            if (empError) addLog(`Emp Profile Error: ${empError.message}`);
            else addLog(`Emp Profile Success: Found ${emps.length} records`);

            // Test 3: Branches
            addLog('Fetching branches...');
            const { data: branches, error: branchError } = await supabase.from('branches').select('*').limit(1);
            if (branchError) addLog(`Branches Error: ${branchError.message}`);
            else addLog(`Branches Success: Found ${branches.length} records`);

            addLog('Test complete.');
        };

        test();
    }, []);

    return (
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
            <h1>Connection Diag</h1>
            <pre>
                {logs.join('\n')}
            </pre>
        </div>
    );
};

export default TestConnection;
