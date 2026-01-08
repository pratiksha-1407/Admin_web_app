import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let mounted = true;

        // Optimistic Hydration: Manually restore session from localStorage to avoid Supabase wait time
        const restoreSession = () => {
            try {
                // Broad search for any potential Supabase token key
                const key = Object.keys(localStorage).find(k => k.includes('auth-token') || k.includes('supabase'));
                if (key) {
                    const stored = JSON.parse(localStorage.getItem(key));

                    // Check if session is expired (give 1 minute buffer)
                    const now = Math.floor(Date.now() / 1000);
                    if (stored && stored.user && stored.expires_at && stored.expires_at > now + 60) {
                        setSession(stored);
                        setUser(stored.user);
                        // Optimistically assume admin to unblock UI (AuthGuard checks this)
                        // Real status will be verified in background below
                        setIsAdmin(true);

                        // Trigger background admin check (don't await)
                        checkAdminStatus(stored.user.id).catch(() => {
                            // If check fails, revoke admin
                            setIsAdmin(false);
                        });
                        return true;
                    } else {
                        console.log('Auth: Local session found but expired or invalid.');
                    }
                }
            } catch (err) {
                console.error('Error parsing local session:', err);
            }
            return false;
        };

        const hasRestored = restoreSession();

        // If we restored a session, stop loading immediately (Stale-While-Revalidate)
        if (hasRestored) {
            setLoading(false);
        } else {
            // If no session found, we are likely guest. 
            // We still wait a tiny bit for Supabase just in case, but fail fast.
            const guestTimeout = setTimeout(() => {
                if (mounted && loading) setLoading(false);
            }, 1000); // 1 second max for guests
        }

        // Listen for auth changes (fires immediately with current session or on updates)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            // Update state with authoritative Supabase session
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                try {
                    await checkAdminStatus(session.user.id);
                } catch (e) {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
                // Only stop loading if we haven't already (e.g. if optimistic failed)
                if (loading) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const checkAdminStatus = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;
            setIsAdmin(!!data);
        } catch (error) {
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw new Error(error.message || 'Invalid email or password');
            }

            if (data.user) {
                // 1. Email Verification Check
                if (!data.user.email_confirmed_at) {
                    await signOut();
                    throw new Error('Please verify your email before login');
                }

                // 2. Admin Authorization Check
                const { data: adminData, error: adminError } = await supabase
                    .from('admins')
                    .select('*')
                    .eq('id', data.user.id)
                    .maybeSingle();

                if (adminError) {
                    await signOut();
                    throw new Error(`Database error: ${adminError.message}. Please ensure the 'admins' table exists.`);
                }

                if (!adminData) {
                    await signOut();
                    throw new Error('Not authorized as admin. Please contact your administrator.');
                }

                setIsAdmin(true);
            }

            return data;
        } catch (error) {
            throw error;
        }
    };

    const signOut = () => supabase.auth.signOut();

    const value = {
        user,
        session,
        loading,
        isAdmin,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
