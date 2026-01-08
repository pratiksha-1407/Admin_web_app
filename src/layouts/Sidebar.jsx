import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    ChevronRight,
    UserPlus,
    ShoppingCart,
    UserCircle
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const auth = useAuth();

    // Defensive check: If auth context is not yet available, don't render sidebar
    if (!auth || !auth.signOut) {
        return <div className={styles.sidebar}>Loading...</div>;
    }

    const { signOut } = auth;

    const navItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'User Management', icon: <Users size={20} />, path: '/users' },
        { name: 'Branch', icon: <Building2 size={20} />, path: '/branches' },
        { name: 'My Profile', icon: <UserCircle size={20} />, path: '/profile' },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <span className={styles.logoText}>Admin</span>
            </div>

            <nav className={styles.nav}>
                <div className={styles.sectionLabel}>MAIN MENU</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.active : ''}`
                        }
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.name}>{item.name}</span>
                        <ChevronRight size={16} className={styles.arrow} />
                    </NavLink>
                ))}
            </nav>

            <div className={styles.footer}>
                <button onClick={signOut} className={styles.logoutBtn}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
