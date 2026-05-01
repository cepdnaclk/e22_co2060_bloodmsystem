import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="main-layout">
            <Navbar />
            <main className={`main-content ${isHomePage ? 'no-padding' : ''}`}>
                <Suspense fallback={<div className="global-loader">Loading...</div>}>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
};

export default MainLayout;
