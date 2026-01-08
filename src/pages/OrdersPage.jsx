import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Search, Filter, Eye, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import styles from './OrdersPage.module.css';

import { useAuth } from '../auth/AuthContext';

const OrdersPage = () => {
    const { session } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchOrders = async () => {
        if (!session) return;
        setLoading(true);
        try {
            // Fetch orders with employee details using the Foreign Key relation (emp_id)
            const { data, error } = await supabase
                .from('emp_mar_orders')
                .select(`
                    *,
                    emp_profile (full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchOrders();

            // Real-time subscription
            const subscription = supabase
                .channel('orders_channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'emp_mar_orders' }, () => {
                    fetchOrders();
                })
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [session]);

    const handleStatusUpdate = async (id, currentStatus) => {
        if (currentStatus === 'completed') return;

        try {
            const { error } = await supabase
                .from('emp_mar_orders')
                .update({ status: 'completed' })
                .eq('id', id);

            if (error) throw error;
            // Optimistic update
            setOrders(orders.map(o => o.id === id ? { ...o, status: 'completed' } : o));
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const filteredOrders = orders.filter(order => {
        const empName = order.emp_profile?.full_name || '';
        const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Order Management</h1>
                <p>Track and manage employee orders</p>
            </header>

            <section className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search order ID or employee..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        aria-label="Search orders"
                    />
                </div>
                <div className={styles.filters}>
                    <Filter size={20} className={styles.filterIcon} />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className={styles.statusSelect}
                        aria-label="Filter by status"
                    >
                        <option value="All">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </section>

            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} />
                        <p>Loading orders...</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Employee</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className={styles.orderId}>#{order.id.slice(0, 8)}</td>
                                        <td>{order.emp_profile?.full_name || 'Unknown'}</td>
                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className={styles.amount}>₹{order.total_price}</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[order.status]}`}>
                                                {order.status === 'pending' ? <Clock size={14} /> : <CheckCircle size={14} />}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            {order.status === 'pending' && (
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => handleStatusUpdate(order.id, order.status)}
                                                    title="Mark as Completed"
                                                >
                                                    Mark Done
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className={styles.empty}>No orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
