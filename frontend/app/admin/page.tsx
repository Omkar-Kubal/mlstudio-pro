"use client";

import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";

const TOOLS = [
    {
        href: "/admin/analytics",
        icon: "analytics",
        title: "Platform Analytics",
        desc: "Live stats: user counts, completions, and popular topics.",
        badge: "Live",
        badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
        href: "/admin/users",
        icon: "group",
        title: "User Management",
        desc: "List all users, grant/revoke admin access, delete accounts.",
        badge: "Firebase",
        badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
        href: "/admin/curriculum",
        icon: "auto_stories",
        title: "Curriculum Manager",
        desc: "Browse all 7 subjects, modules, and topics in the system.",
        badge: "Read-only",
        badgeColor: "bg-[#1a1a1a] text-[#737373] border-[#2a2a2a]",
    },
    {
        href: "/admin/settings",
        icon: "settings",
        title: "System Settings",
        desc: "Check runtime config, auth mode, and Firebase credentials.",
        badge: "Config",
        badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
];

export default function AdminPage() {
    const { user } = useAuth();

    if (!user?.isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 text-center">
                <span className="material-symbols-outlined text-6xl text-rose-500 mb-4">gpp_maybe</span>
                <h1 className="text-4xl font-bold mb-2 tracking-tighter">Access Denied</h1>
                <p className="text-[#a0a0a0] max-w-md">
                    This area is restricted to administrators only. If you believe this is an error, please contact support.
                </p>
                <Link href="/learn" className="mt-8 bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-[#e0e0e0] transition-colors">
                    Back to Learning
                </Link>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <span className="text-xs font-mono text-[#525252] uppercase tracking-[0.3em]">System Admin</span>
                            <h1 className="text-5xl font-black tracking-tighter mt-2">Dashboard</h1>
                            <p className="text-[#525252] mt-2 text-sm">Logged in as <span className="text-white font-mono">{user.email}</span></p>
                        </div>
                        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Admin Verified
                        </div>
                    </div>

                    {/* Tool Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {TOOLS.map(tool => (
                            <Link
                                key={tool.href}
                                href={tool.href}
                                className="group bg-[#0d0d0d] border border-[#1a1a1a] p-7 rounded-2xl hover:border-[#2a2a2a] hover:bg-[#111] transition-all duration-200 flex gap-5 items-start"
                            >
                                <div className="size-12 rounded-xl bg-[#1a1a1a] border border-[#232323] flex items-center justify-center flex-shrink-0 group-hover:border-[#303030] transition-colors">
                                    <span className="material-symbols-outlined text-[#737373] group-hover:text-white transition-colors">{tool.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <h3 className="text-lg font-bold group-hover:text-white transition-colors">{tool.title}</h3>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tool.badgeColor}`}>
                                            {tool.badge}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#737373] leading-relaxed">{tool.desc}</p>
                                </div>
                                <span className="material-symbols-outlined text-[#333] group-hover:text-[#737373] transition-colors self-center flex-shrink-0">
                                    arrow_forward
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
