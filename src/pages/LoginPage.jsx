import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import styles from './LoginPage.module.css';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError(null);
        setFormData({
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // 🔐 LOGIN LOGIC (Matches Flutter)

                // 1. Call signIn (AuthContext now handles Email & Admin checks)
                // Note: supabase.auth.signInWithPassword is called inside useAuth().signIn
                // This keeps specific logical checks in one place, or we can do it here.
                // The prompt asked for specific error messages "Please verify..."
                // Since I added those throws in AuthContext, they will be caught here.

                await signIn(formData.email, formData.password);

                // If successful (no error thrown), navigate
                navigate('/dashboard', { replace: true });

            } else {
                // 🆕 SIGNUP LOGIC (Matches Flutter)

                // 1. Validate Form
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }

                // 2. Create User
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // 3. Create Admin Record
                    const { error: adminError } = await supabase
                        .from('admins')
                        .insert([{
                            id: data.user.id,
                            email: data.user.email,
                            created_at: new Date().toISOString()
                        }]);

                    if (adminError) {
                        // Cleanup if admin creation fails (Optional but good for data integrity)
                        await supabase.auth.signOut();
                        throw new Error(`Admin creation failed: ${adminError.message}`);
                    }

                    // 4. Success Message (Flutter parity: usually just finishes or shows message)
                    alert("Account created! Please check your email to verify before logging in.");
                    toggleMode(); // Switch to login
                } else {
                    // Sometimes signUp returns no user if email confirmation is required and enabled
                    // but usually data.user is present with email_confirmed_at: null
                    alert("Signup initiated. Please check your email.");
                    toggleMode();
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <h1>{isLogin ? 'Admin Login' : 'Admin Sign Up'}</h1>
                    <p>
                        {isLogin ? 'Login to access Admin Panel' : 'Create Admin Account'}
                    </p>
                </div>

                {error && (
                    <div className={styles.errorBanner}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail className={styles.inputIcon} size={20} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock className={styles.inputIcon} size={20} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} size={20} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading && <Loader2 className={styles.spinner} size={20} style={{ marginRight: '8px' }} />}
                        <span>{isLogin ? 'Login as Admin' : 'Sign Up as Admin'}</span>
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={toggleMode}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#2563eb',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                padding: 0
                            }}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
