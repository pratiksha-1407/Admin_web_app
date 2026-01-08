import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import styles from './Navbar.module.css';

const Navbar = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className={styles.navbar}>
            <button className={styles.menuBtn} onClick={onMenuClick}>
                <Menu size={20} />
            </button>

            <div className={styles.searchContainer}>
                <Search size={18} className={styles.searchIcon} />
                <input type="text" placeholder="Search..." className={styles.searchInput} />
            </div>

            <div className={styles.actions}>
                <button className={styles.iconBtn}>
                    <Bell size={20} />
                    <span className={styles.badge}>3</span>
                </button>

                <div className={styles.profile}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.email?.split('@')[0]}</span>
                        <span className={styles.userRole}>Super Admin</span>
                    </div>
                    <div className={styles.avatar}>
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
