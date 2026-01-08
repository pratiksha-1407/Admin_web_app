import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { User, Mail, Phone, Shield, Save, Loader2, AlertCircle, Camera } from 'lucide-react';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        role: ''
    });

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        setFetchLoading(true);
        try {
            const { data, error } = await supabase
                .from('emp_profile')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;
            if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    email: data.email || user.email || '',
                    phone_number: data.phone_number || '',
                    role: data.role || 'Admin'
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { error } = await supabase
                .from('emp_profile')
                .update({
                    full_name: formData.full_name,
                    phone_number: formData.phone_number
                })
                .eq('id', user.id);

            if (error) throw error;
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className={styles.loadingWrapper}><Loader2 className={styles.spinner} /> Loading Profile...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>My Profile</h1>
                <p>Manage your account settings and preferences.</p>
            </header>

            <div className={styles.contentGrid}>
                {/* Left Column: Avatar & Role */}
                <div className={styles.profileCard}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <h2 className={styles.profileName}>{formData.full_name || 'Admin User'}</h2>
                        <div className={styles.roleBadge}>
                            <Shield size={14} />
                            <span>{formData.role}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className={styles.formCard}>
                    <div className={styles.cardHeader}>
                        <h3>Personal Information</h3>
                    </div>

                    {error && (
                        <div className={styles.errorBanner}><AlertCircle size={20} /> <span>{error}</span></div>
                    )}
                    {success && (
                        <div className={styles.successBanner}><span>{success}</span></div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.grid}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="full_name">Full Name</label>
                                <div className={styles.inputWrapper}>
                                    <User className={styles.icon} size={18} />
                                    <input
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        required
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="email">Email Address</label>
                                <div className={`${styles.inputWrapper} ${styles.disabled}`}>
                                    <Mail className={styles.icon} size={18} />
                                    <input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <span className={styles.helperText}>Email cannot be changed.</span>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="phone_number">Phone Number</label>
                                <div className={styles.inputWrapper}>
                                    <Phone className={styles.icon} size={18} />
                                    <input
                                        id="phone_number"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                        placeholder="+91 9876543210"
                                        type="tel"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Role</label>
                                <div className={`${styles.inputWrapper} ${styles.disabled}`}>
                                    <Shield className={styles.icon} size={18} />
                                    <input
                                        value={formData.role}
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <span className={styles.helperText}>Role is assigned by administrator.</span>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button type="submit" className={styles.saveBtn} disabled={loading}>
                                {loading ? <Loader2 className={styles.spinner} /> : <Save size={20} />}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
