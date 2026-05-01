import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Navbar />
            <main className="main-content">
                <Suspense fallback={<div className="global-loader">Loading...</div>}>
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
};

export default MainLayout;
