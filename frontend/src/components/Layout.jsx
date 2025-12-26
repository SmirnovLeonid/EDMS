import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex bg-gray-100">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
