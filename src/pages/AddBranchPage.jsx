import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import {
    Building2,
    MapPin,
    Phone,
    User,
    Save,
    ArrowLeft,
    Loader2,
    AlertCircle
} from 'lucide-react';
import styles from './AddEmployeePage.module.css'; // Reusing styles

const AddBranchPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        contact_person: '',
        contact_phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.name || !formData.code || !formData.city) {
                throw new Error('Please fill in all required fields.');
            }

            const { error: insertError } = await supabase
                .from('branches')
                .insert([{
                    ...formData,
                    status: 'Active',
                    created_at: new Date().toISOString()
                }]);

            if (insertError) throw insertError;

            navigate('/branches');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/branches')}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <h1>Add New Branch</h1>
            </header>

            <div className={styles.formCard}>
                {error && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.sectionLabel}>Branch Details</div>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name">Branch Name *</label>
                            <div className={styles.inputWrapper}>
                                <Building2 className={styles.icon} size={18} />
                                <input
                                    id="name"
                                    name="name"
                                    placeholder="Enter branch name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="code">Branch Code *</label>
                            <div className={styles.inputWrapper}>
                                <Building2 className={styles.icon} size={18} />
                                <input
                                    id="code"
                                    name="code"
                                    placeholder="e.g. BR001"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="address">Address *</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.icon} size={18} />
                                <textarea
                                    id="address"
                                    name="address"
                                    placeholder="Full address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className={styles.textarea}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="city">City *</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.icon} size={18} />
                                <input
                                    id="city"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="state">State *</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.icon} size={18} />
                                <input
                                    id="state"
                                    name="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="pincode">Pincode *</label>
                            <div className={styles.inputWrapper}>
                                <MapPin className={styles.icon} size={18} />
                                <input
                                    id="pincode"
                                    name="pincode"
                                    placeholder="Enter pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    required
                                    type="number"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionLabel} style={{ marginTop: '24px' }}>Contact Person</div>
                    <div className={styles.grid}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="contact_person">Contact Name *</label>
                            <div className={styles.inputWrapper}>
                                <User className={styles.icon} size={18} />
                                <input
                                    id="contact_person"
                                    name="contact_person"
                                    placeholder="Manager name"
                                    value={formData.contact_person}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="contact_phone">Phone Number *</label>
                            <div className={styles.inputWrapper}>
                                <Phone className={styles.icon} size={18} />
                                <input
                                    id="contact_phone"
                                    name="contact_phone"
                                    placeholder="Contact number"
                                    value={formData.contact_phone}
                                    onChange={handleChange}
                                    required
                                    type="tel"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? <Loader2 className={styles.spinner} /> : <Save size={20} />}
                            <span>Create Branch</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBranchPage;
