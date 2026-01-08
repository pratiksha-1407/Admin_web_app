import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Settings,
    TrendingUp,
    UserCheck,
    ShieldCheck,
    MoreHorizontal,
    ChevronRight,
    Plus,
    Building2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthContext'; // Fixed import path
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { session } = useAuth(); // Get from context
    const [stats, setStats] = useState({
        employees: 0,
        production: 0,
        marketing: 0,
        owners: 0,
        totalUsers: 0,
        totalBranches: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        if (!session) return; // Wait for session
        setLoading(true);
        console.log('Dashboard: Starting fetch with session...');

        try {
            const token = session.access_token;
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            // Helper for raw fetch
            const fetchTable = async (table) => {
                const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error(`Fetch ${table} failed: ${res.statusText}`);
                return res.json();
            };

            // 1. Fetch Employees
            console.log('Dashboard: Fetching emp_profile raw...');
            const employees = await fetchTable('emp_profile');
            console.log('Dashboard: emp_profile done', employees.length);

            // 2. Fetch Metrics
            let metrics = null;
            try {
                // Metrics usually returns 1 row
                const res = await fetch(`${supabaseUrl}/rest/v1/own_dashboard_metrics?select=*&limit=1`, {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${token}`,
                        'Prefer': 'return=representation'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) metrics = data[0];
                }
            } catch (e) {
                console.warn('Metrics fetch failed', e);
            }

            // 3. Fallback: Calculate from orders
            console.log('Dashboard: Fetching emp_mar_orders raw...');
            const orders = await fetchTable('emp_mar_orders');

            // 4. Fetch Branches Count
            console.log('Dashboard: Fetching branches raw...');
            let totalBranches = 0;
            try {
                const branchesData = await fetchTable('branches');
                totalBranches = branchesData ? branchesData.length : 0;
            } catch (branchErr) {
                console.warn('Branch fetch failed', branchErr);
            }

            // Calculate Checks
            const totalRevenue = metrics?.total_revenue ?? orders.reduce((sum, o) => {
                return o.status === 'completed' ? sum + (Number(o.total_price) || 0) : sum;
            }, 0);

            const totalOrders = metrics?.total_orders ?? orders.length;
            const pendingOrders = metrics?.pending_orders ?? orders.filter(o => o.status === 'pending').length;

            const counts = {
                employees: employees.filter(e => e.role === 'Employee').length,
                production: employees.filter(e => e.role === 'Production Manager').length,
                marketing: employees.filter(e => e.role === 'Marketing Manager').length,
                owners: employees.filter(e => e.role === 'Owner').length,
                totalUsers: employees.length,
                totalRevenue,
                totalOrders,
                pendingOrders,
                totalBranches
            };

            setStats(counts);

            // Sort and get recent users
            const sorted = employees
                .filter(e => e.joining_date)
                .sort((a, b) => new Date(b.joining_date) - new Date(a.joining_date))
                .slice(0, 5);

            setRecentUsers(sorted);

        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            console.log('Dashboard: Loading finished');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    const chartData = [
        { name: 'Employees', count: stats.employees, color: '#2563eb' },
        { name: 'Production', count: stats.production, color: '#ff8a00' },
        { name: 'Marketing', count: stats.marketing, color: '#7b3ff2' },
        { name: 'Owners', count: stats.owners, color: '#0fbf75' },
    ];

    if (loading) {
        return <div className={styles.loading}>Loading Dashboard...</div>;
    }

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div>
                    <h1>Dashboard Overview</h1>
                    <p>Here's what's happening today.</p>
                </div>
                <button className={styles.addBtn} onClick={() => navigate('/users/add')}>
                    <Plus size={20} />
                    <span>Add New User</span>
                </button>
            </header>

            <section className={styles.statsGrid}>
                <StatCard
                    title="Total Employees"
                    value={stats.employees}
                    icon={<Users size={24} />}
                    color="blue"
                    subtitle="Regular Staff"
                    onClick={() => navigate('/users?role=Employee')}
                />
                <StatCard
                    title="Production"
                    value={stats.production}
                    icon={<TrendingUp size={24} />}
                    color="orange"
                    subtitle="Managers"
                    onClick={() => navigate('/users?role=Production Manager')}
                />
                <StatCard
                    title="Marketing"
                    value={stats.marketing}
                    icon={<Settings size={24} />}
                    color="purple"
                    subtitle="Managers"
                    onClick={() => navigate('/users?role=Marketing Manager')}
                />
                <StatCard
                    title="Owners"
                    value={stats.owners}
                    icon={<ShieldCheck size={24} />}
                    color="green"
                    subtitle="Administrators"
                    onClick={() => navigate('/users?role=Owner')}
                />
                <StatCard
                    title="Branches"
                    value={stats.totalBranches}
                    icon={<Building2 size={24} />}
                    color="orange"
                    subtitle="Active Locations"
                    onClick={() => navigate('/branches')}
                />
            </section>

            <div className={styles.mainGrid}>
                <section className={`${styles.card} ${styles.chartSection}`}>
                    <div className={styles.cardHeader}>
                        <h2>Personnel Distribution</h2>
                        <button className={styles.iconBtn}><MoreHorizontal size={20} /></button>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className={`${styles.card} ${styles.recentSection}`}>
                    <div className={styles.cardHeader}>
                        <h2>Recent Registrations</h2>
                        <button className={styles.viewAllBtn} onClick={() => navigate('/users')}>
                            View All <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>
                                                    {user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className={styles.userName}>{user.full_name || 'No Name'}</p>
                                                    <p className={styles.userEmail}>{user.email || 'No Email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={styles.roleLabel}>{user.role}</span></td>
                                        <td><span className={styles.statusBadge}>Active</span></td>
                                    </tr>
                                ))}
                                {recentUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className={styles.empty}>No recent registrations found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, subtitle, onClick }) => (
    <div className={`${styles.statCard} ${styles[color]}`} onClick={onClick} style={{ cursor: 'pointer' }}>
        <div className={styles.statIcon}>{icon}</div>
        <div className={styles.statContent}>
            <h3>{title}</h3>
            <p className={styles.statValue}>{value}</p>
            <p className={styles.statSubtitle}>{subtitle}</p>
        </div>
    </div>
);

export default DashboardPage;
