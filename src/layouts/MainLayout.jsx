import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from './MainLayout.module.css';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={styles.layout}>
            <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.open : ''}`}>
                <Sidebar />
                {isSidebarOpen && <div className={styles.overlay} onClick={toggleSidebar} />}
            </div>

            <div className={styles.main}>
                <Navbar onMenuClick={toggleSidebar} />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
