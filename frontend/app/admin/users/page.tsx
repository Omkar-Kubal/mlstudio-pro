"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/adapters/api";
import Link from "next/link";

interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    provider: string;
    lastSignIn?: string;
    is_admin: boolean;
}

const PROVIDER_ICONS: Record<string, string> = {
    "google.com": "g_mobiledata",
    "github.com": "code",
    "password": "email",
    "email": "email",
};

export default function UsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [actionUid, setActionUid] = useState<string | null>(null);

    const fetchUsers = () => {
        setLoading(true);
        apiFetch<AppUser[]>("/admin/users")
            .then(setUsers)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggleAdmin = async (u: AppUser) => {
        setActionUid(u.uid);
        try {
            const endpoint = u.is_admin ? `/admin/users/${u.uid}/remove-admin` : `/admin/users/${u.uid}/make-admin`;
            await apiFetch(endpoint, { method: "POST" });
            fetchUsers();
        } catch (e: unknown) {
            alert(`Failed: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setActionUid(null);
        }
    };

    const handleDelete = async (uid: string, email: string | null) => {
        if (!confirm(`Delete user ${email ?? uid}? This cannot be undone.`)) return;
        setActionUid(uid);
        try {
            await apiFetch(`/admin/users/${uid}`, { method: "DELETE" });
            fetchUsers();
        } catch (e: unknown) {
            alert(`Failed: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setActionUid(null);
        }
    };

    const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(search.toLowerCase())
    );

    if (!user?.isAdmin) return null;

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <Link href="/admin" className="text-[#525252] hover:text-white transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <span className="text-xs font-mono text-[#525252] uppercase tracking-[0.3em]">Admin</span>
                            <h1 className="text-4xl font-black tracking-tighter">User Management</h1>
                        </div>
                        <div className="ml-auto text-sm text-[#525252]">
                            {users.length} total users
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#525252] text-lg pointer-events-none">search</span>
                        <input
                            type="text"
                            placeholder="Search by email or name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#525252] outline-none focus:border-[#3a3a3a] transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-xl text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[#1a1a1a]">
                                        <th className="text-left text-xs text-[#525252] uppercase tracking-widest font-bold px-6 py-4">User</th>
                                        <th className="text-left text-xs text-[#525252] uppercase tracking-widest font-bold px-6 py-4">Provider</th>
                                        <th className="text-left text-xs text-[#525252] uppercase tracking-widest font-bold px-6 py-4">Role</th>
                                        <th className="text-right text-xs text-[#525252] uppercase tracking-widest font-bold px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(u => (
                                        <tr key={u.uid} className="border-b border-[#111] last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-white">{u.email ?? "No email"}</p>
                                                {u.displayName && <p className="text-xs text-[#525252] mt-0.5">{u.displayName}</p>}
                                                <p className="text-[10px] text-[#333] font-mono mt-0.5">{u.uid.slice(0, 16)}...</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[#525252] text-base">
                                                        {PROVIDER_ICONS[u.provider] ?? "person"}
                                                    </span>
                                                    <span className="text-xs text-[#737373]">{u.provider}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${u.is_admin
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-[#1a1a1a] text-[#525252] border-[#2a2a2a]"
                                                    }`}>
                                                    {u.is_admin ? "Admin" : "Learner"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleToggleAdmin(u)}
                                                        disabled={actionUid === u.uid || u.uid === user?.id}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${u.is_admin
                                                                ? "border-[#2a2a2a] text-[#737373] hover:text-rose-400 hover:border-rose-500/20"
                                                                : "border-[#2a2a2a] text-[#737373] hover:text-emerald-400 hover:border-emerald-500/20"
                                                            }`}
                                                    >
                                                        {u.is_admin ? "Remove Admin" : "Make Admin"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.uid, u.email)}
                                                        disabled={actionUid === u.uid || u.uid === user?.id}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-[#737373] hover:text-rose-400 hover:border-rose-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-[#525252] text-sm">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
