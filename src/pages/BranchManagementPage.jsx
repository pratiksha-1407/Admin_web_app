import React, { useEffect, useState } from 'react';
import {
    Search,
    Building2,
    Plus,
    Loader2,
    MapPin,
    Phone,
    Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import styles from './UserManagementPage.module.css'; // Reusing for consistency

const BranchManagementPage = () => {
    const { session } = useAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [deleteLoading, setDeleteLoading] = useState(null);

    const fetchBranches = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBranches(data || []);
        } catch (err) {
            console.error('Error fetching branches:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchBranches();
        }
    }, [session]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

        setDeleteLoading(id);
        try {
            const { error } = await supabase
                .from('branches')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setBranches(branches.filter(b => b.id !== id));
        } catch (err) {
            alert('Error deleting branch: ' + err.message);
        } finally {
            setDeleteLoading(null);
        }
    };

    const filteredBranches = branches.filter(branch => {
        const query = searchTerm.toLowerCase();
        return (
            branch.name?.toLowerCase().includes(query) ||
            branch.city?.toLowerCase().includes(query) ||
            branch.code?.toLowerCase().includes(query)
        );
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Branch Management</h1>
                    <p>Total branches: {branches.length}</p>
                </div>
                <button className={styles.addBtn} onClick={() => navigate('/branches/add')}>
                    <Plus size={20} />
                    <span>Add Branch</span>
                </button>
            </header>

            <section className={styles.controls}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, city or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>

            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <Loader2 className={styles.spinner} />
                        <p>Loading branches...</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Branch Details</th>
                                    <th>Location</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBranches.map((branch) => (
                                    <tr key={branch.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar} style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                                                    <Building2 size={20} />
                                                </div>
                                                <div>
                                                    <p className={styles.userName}>{branch.name || 'N/A'}</p>
                                                    <p className={styles.userId}>Code: {branch.code || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contactCell}>
                                                <div className={styles.contactItem}>
                                                    <MapPin size={14} />
                                                    <span>{branch.city}, {branch.state}</span>
                                                </div>
                                                <p className={styles.positionText} style={{ fontSize: '11px', color: '#666', marginLeft: '20px' }}>{branch.address}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contactCell}>
                                                <div className={styles.contactItem}>
                                                    <Phone size={14} />
                                                    <span>{branch.contact_phone || 'N/A'}</span>
                                                </div>
                                                <p className={styles.positionText} style={{ fontSize: '11px', color: '#666', marginLeft: '20px' }}>{branch.contact_person}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.roleBadge}`} style={{ backgroundColor: '#def7ec', color: '#03543f' }}>
                                                {branch.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(branch.id, branch.name)}
                                                    disabled={deleteLoading === branch.id}
                                                    title="Delete"
                                                >
                                                    {deleteLoading === branch.id ? <Loader2 size={18} className={styles.spinner} /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBranches.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className={styles.emptyRow}>
                                            No branches found.
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

export default BranchManagementPage;
