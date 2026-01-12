'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import {
    MessageCircle, FileText, Settings, LogOut, Users,
    Bell, Menu, X, Home, BarChart3
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { admin, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { icon: Home, label: 'Dashboard', href: '/admin' },
        { icon: MessageCircle, label: 'Chats', href: '/admin/chats', badge: 3 },
        { icon: FileText, label: 'Blog', href: '/admin/blog' },
        { icon: Users, label: 'Visitors', href: '/admin/visitors' },
        { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-slate-800/50 border-r border-white/10 flex flex-col transition-all duration-300`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    {sidebarOpen && (
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                            Jahyeon Admin
                        </span>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5 text-white/60" /> : <Menu className="w-5 h-5 text-white/60" />}
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors group"
                        >
                            <item.icon className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                            {sidebarOpen && <span>{item.label}</span>}
                            {sidebarOpen && item.badge && (
                                <span className="ml-auto px-2 py-0.5 text-xs bg-purple-600 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {admin?.name?.[0] || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{admin?.name}</p>
                                <p className="text-white/60 text-sm truncate">{admin?.email}</p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <button
                                onClick={logout}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-5 h-5 text-white/60" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6">
                    <h1 className="text-xl font-bold text-white">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Bell className="w-5 h-5 text-white/60" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
