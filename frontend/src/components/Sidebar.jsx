import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, FileText, FolderOpen, Users, BarChart2,
    Settings, LogOut, ChevronLeft, ChevronRight, PieChart, Sparkles
} from 'lucide-react';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Рабочий стол', roles: ['all'] },
        { path: '/documents', icon: FileText, label: 'Документы', roles: ['all'] },
        { path: '/assignments', icon: FolderOpen, label: 'Задания', roles: ['all'] },
        { path: '/users', icon: Users, label: 'Пользователи', roles: ['admin'] },
        { path: '/statistics', icon: BarChart2, label: 'Статистика', roles: ['admin', 'rector', 'prorector'] },
        { path: '/analytics', icon: PieChart, label: 'Аналитика', roles: ['admin', 'rector'] },
        { path: '/settings', icon: Settings, label: 'Настройки', roles: ['admin'] },
    ];

    const isActive = (path) => location.pathname === path;

    const canAccess = (roles) => {
        if (roles.includes('all')) return true;
        return roles.includes(user?.role);
    };

    return (
        <aside
            className={`relative text-white transition-all duration-500 ease-out flex flex-col ${collapsed ? 'w-20' : 'w-72'}`}
            style={{
                background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            }}
        >
            {/* Animated background glow */}
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)',
                }}
            />

            {/* Logo */}
            <div className="relative p-5 border-b border-white/10 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                                ИС ЭДО
                            </span>
                            <div className="text-xs text-indigo-300">Документооборот</div>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* User info */}
            {!collapsed && user && (
                <div className="relative p-4 mx-3 my-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-lg font-bold shadow-lg">
                            {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-white">{user.full_name || user.username}</div>
                            <div className="text-sm text-indigo-300 truncate">{user.role_display}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item, index) => (
                    canAccess(item.roles) && (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive(item.path)
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                                }`}
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            {/* Hover glow effect */}
                            {!isActive(item.path) && (
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}

                            <item.icon size={20} className={`transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {!collapsed && (
                                <span className="ml-3 font-medium relative z-10">{item.label}</span>
                            )}

                            {/* Active indicator */}
                            {isActive(item.path) && (
                                <div className="absolute right-2 w-2 h-2 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    )
                ))}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-white/10">
                <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-indigo-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 group"
                >
                    <LogOut size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    {!collapsed && <span className="ml-3 font-medium">Выход</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
