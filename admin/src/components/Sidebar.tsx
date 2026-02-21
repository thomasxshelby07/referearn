"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Home, Users, CreditCard, Send, Settings, CheckSquare, Menu, X, ToggleLeft } from 'lucide-react';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const navLinks = [
        { href: "/dashboard", icon: Home, label: "Dashboard" },
        { href: "/users", icon: Users, label: "Users" },
        { href: "/tasks", icon: CheckSquare, label: "Tasks Server" },
        { href: "/withdrawals", icon: CreditCard, label: "Withdrawals" },
        { href: "/broadcast", icon: Send, label: "Broadcast" },
        { href: "/settings", icon: Settings, label: "Settings & Referrals" },
        { href: "/button-control", icon: ToggleLeft, label: "Button Control" },
    ];

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-black text-white p-4 border-b border-neutral-800 fixed top-0 w-full z-50">
                <div className="text-xl font-bold tracking-widest">ADMIN</div>
                <button onClick={toggleSidebar} className="p-1 hover:bg-neutral-800 rounded">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar content */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 
                w-64 bg-black min-h-screen text-white flex flex-col items-stretch
                transition-transform duration-300 ease-in-out border-r border-neutral-800
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="hidden md:flex p-6 text-2xl font-bold tracking-widest text-white border-b border-neutral-800 justify-center">
                    ADMIN
                </div>
                <nav className="flex-1 p-4 space-y-1 mt-16 md:mt-0">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-3 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors text-neutral-400 font-medium"
                        >
                            <link.icon size={20} />
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}
