import React, { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Mail,
    Phone,
    Briefcase
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import styles from './UserManagementPage.module.css';

const UserManagementPage = () => {
    const { session } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialRole = queryParams.get('role') || 'All';

    const [roleFilter, setRoleFilter] = useState(initialRole);
    const [deleteLoading, setDeleteLoading] = useState(null);

    const fetchUsers = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('emp_profile')
                .select('*');

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            // Could add an error state here to show in UI
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchUsers();
        }
    }, [session]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

        setDeleteLoading(id);
        try {
            const { error } = await supabase
                .from('emp_profile')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            alert('Error deleting user: ' + err.message);
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roles = ['All', 'Employee', 'Production Manager', 'Marketing Manager', 'Owner'];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>User Management</h1>
                    <p>Total users: {users.length}</p>
                </div>
                <button className={styles.addBtn} onClick={() => navigate('/users/add')}>
                    <Plus size={20} />
                    <span>Add Employee</span>
                </button>
            </header>

            <section className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        id="user-search"
                        name="user-search"
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search users"
                    />
                </div>
                <div className={styles.filters}>
                    <label htmlFor="role-filter" className="sr-only" style={{ display: 'none' }}>Filter by Role</label>
                    <Filter size={20} className={styles.filterIcon} />
                    <select
                        id="role-filter"
                        name="role-filter"
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            // Optional: Update URL param
                        }}
                        className={styles.roleSelect}
                    >
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
            </section>

            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} />
                        <p>Loading employees...</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Employee Info</th>
                                    <th>Role & Position</th>
                                    <th>Contact</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>
                                                    {user.full_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className={styles.userName}>{user.full_name || 'N/A'}</p>
                                                    <p className={styles.userId}>ID: {user.employee_id || user.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.roleCell}>
                                                <span className={`${styles.roleBadge} ${styles[user.role?.replace(' ', '').toLowerCase()]}`}>
                                                    {user.role}
                                                </span>
                                                <p className={styles.positionText}>{user.position || 'No Position'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contactCell}>
                                                <div className={styles.contactItem}>
                                                    <Mail size={14} />
                                                    <span>{user.email || 'No Email'}</span>
                                                </div>
                                                <div className={styles.contactItem}>
                                                    <Phone size={14} />
                                                    <span>{user.phone_number || 'No Phone'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <p className={styles.dateText}>
                                                {user.joining_date ? new Date(user.joining_date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => navigate(`/users/edit/${user.id}`)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(user.id, user.full_name)}
                                                    disabled={deleteLoading === user.id}
                                                    title="Delete"
                                                >
                                                    {deleteLoading === user.id ? <Loader2 size={18} className={styles.spinner} /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className={styles.emptyRow}>
                                            No employees found matching your criteria.
                                        </td>
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

export default UserManagementPage;
