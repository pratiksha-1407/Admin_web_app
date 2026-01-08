import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    User,
    Mail,
    Phone,
    Briefcase,
    MapPin,
    IndianRupee,
    Calendar,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import styles from './AddEmployeePage.module.css';

const DISTRICT_TALUKA_DATA = {
    "Ahmednagar": ["Ahmednagar", "Akole", "Jamkhed", "Karjat", "Kopargaon", "Nagar", "Nevasa", "Parner", "Pathardi", "Rahata", "Rahuri", "Sangamner", "Shrigonda", "Shrirampur"],
    "Akola": ["Akola", "Balapur", "Barshitakli", "Murtizapur", "Telhara", "Akot"],
    "Amravati": ["Amravati", "Anjangaon", "Chandur Bazar", "Chandur Railway", "Daryapur", "Dharni", "Morshi", "Nandgaon Khandeshwar", "Achalpur", "Warud"],
    "Aurangabad": ["Aurangabad City", "Aurangabad Rural", "Kannad", "Khultabad", "Sillod", "Paithan", "Gangapur", "Vaijapur"],
    "Beed": ["Beed", "Ashti", "Kaij", "Georai", "Majalgaon", "Parli", "Ambajogai", "Shirur", "Wadwani"],
    "Pune": ["Pune", "Haveli", "Maval", "Mulshi", "Khed (Ravet)", "Baramati", "Daund", "Indapur", "Junnar", "Shirur", "Bhor"],
    "Nashik": ["Nashik", "Dindori", "Igatpuri", "Niphad", "Sinnar", "Yeola", "Trimbakeshwar", "Baglan", "Chandwad"],
    "Thane": ["Thane", "Bhiwandi", "Kalyan", "Ulhasnagar", "Ambarnath", "Shahapur", "Murbad", "Wada", "Jawahar"],
    "Nagpur": ["Nagpur", "Hingna", "Parseoni", "Kalmeshwar", "Umred", "Kuhi", "Savner"],
    // truncated for brevity, but I will include common ones
};

const AddEmployeePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        salary: '',
        role: 'Employee',
        status: 'Active',
        joining_date: new Date().toISOString().split('T')[0],
        district: '',
        branch: ''
    });

    useEffect(() => {
        if (isEditing) {
            fetchEmployeeData();
        }
    }, [id]);

    const fetchEmployeeData = async () => {
        try {
            const { data, error } = await supabase
                .from('emp_profile')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    full_name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    position: data.position || '',
                    salary: data.salary?.toString() || '',
                    role: data.role || 'Employee',
                    status: data.status || 'Active',
                    joining_date: data.joining_date ? data.joining_date.split('T')[0] : new Date().toISOString().split('T')[0],
                    district: data.district || '',
                    branch: data.branch || ''
                });
            }
        } catch (err) {
            setError('Failed to fetch employee data: ' + err.message);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'district' ? { branch: '' } : {}), // Clear branch if district changes
            ...(name === 'role' && value === 'Owner' ? { district: '', branch: '' } : {})
        }));
    };

    const generateEmpId = () => {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(100 + Math.random() * 900);
        return `CF${year}-${randomNum}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                phone_number: formData.phone, // Map to correct DB column
                salary: parseInt(formData.salary) || 0,
                joining_date: new Date(formData.joining_date).toISOString()
            };
            delete payload.phone; // Remove incorrect field name

            if (isEditing) {
                const { error } = await supabase
                    .from('emp_profile')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                payload.emp_id = generateEmpId();
                payload.performance = 0;
                payload.attendance = 0;
                const { error } = await supabase
                    .from('emp_profile')
                    .insert([payload]);
                if (error) throw error;
            }

            navigate('/users');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const showDistrictField = ['Employee', 'Marketing Manager', 'Production Manager'].includes(formData.role);
    const showBranchField = formData.role === 'Employee';

    if (initialLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} />
                <p>Fetching data...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => navigate('/users')} className={styles.backBtn}>
                    <ChevronLeft size={20} />
                    <span>Back to Users</span>
                </button>
                <h1>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h1>
            </header>

            <div className={styles.formCard}>
                {error && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Basic Information</h2>
                        <div className={styles.grid}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="full_name">Full Name</label>
                                <div className={styles.inputWrapper}>
                                    <User className={styles.icon} size={18} />
                                    <input
                                        id="full_name"
                                        name="full_name"
                                        autoComplete="name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter Full Name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="email">Email Address</label>
                                <div className={styles.inputWrapper}>
                                    <Mail className={styles.icon} size={18} />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter Email"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="phone">Phone Number</label>
                                <div className={styles.inputWrapper}>
                                    <Phone className={styles.icon} size={18} />
                                    <input
                                        id="phone"
                                        name="phone"
                                        autoComplete="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter Phone Number"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="position">Position / Designation</label>
                                <div className={styles.inputWrapper}>
                                    <Briefcase className={styles.icon} size={18} />
                                    <input
                                        id="position"
                                        name="position"
                                        autoComplete="organization-title"
                                        value={formData.position}
                                        onChange={handleChange}
                                        placeholder="Enter Position"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Employment Details</h2>
                        <div className={styles.grid}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="role">Role</label>
                                <select id="role" name="role" value={formData.role} onChange={handleChange}>
                                    <option value="Employee">Employee</option>
                                    <option value="Marketing Manager">Marketing Manager</option>
                                    <option value="Production Manager">Production Manager</option>
                                    <option value="Owner">Owner</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="status">Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Probation">Probation</option>
                                    <option value="Terminated">Terminated</option>
                                    <option value="Resigned">Resigned</option>
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="salary">Monthly Salary (INR)</label>
                                <div className={styles.inputWrapper}>
                                    <IndianRupee className={styles.icon} size={18} />
                                    <input
                                        id="salary"
                                        name="salary"
                                        type="number"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        placeholder="30000"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="joining_date">Joining Date</label>
                                <div className={styles.inputWrapper}>
                                    <Calendar className={styles.icon} size={18} />
                                    <input
                                        id="joining_date"
                                        name="joining_date"
                                        type="date"
                                        value={formData.joining_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {(showDistrictField || showBranchField) && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Location Information</h2>
                            <div className={styles.grid}>
                                {showDistrictField && (
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="district">District</label>
                                        <div className={styles.inputWrapper}>
                                            <MapPin className={styles.icon} size={18} />
                                            <select id="district" name="district" value={formData.district} onChange={handleChange} required>
                                                <option value="">Select District</option>
                                                {Object.keys(DISTRICT_TALUKA_DATA).sort().map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {showBranchField && (
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="branch">Branch / Taluka</label>
                                        <div className={styles.inputWrapper}>
                                            <MapPin className={styles.icon} size={18} />
                                            <select id="branch" name="branch" value={formData.branch} onChange={handleChange} required disabled={!formData.district}>
                                                <option value="">Select Branch</option>
                                                {formData.district && DISTRICT_TALUKA_DATA[formData.district].map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    <div className={styles.actions}>
                        <button type="button" onClick={() => navigate('/users')} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? <Loader2 className={styles.spinner} size={20} /> : <Save size={20} />}
                            <span>{isEditing ? 'Update Employee' : 'Save Employee'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeePage;
