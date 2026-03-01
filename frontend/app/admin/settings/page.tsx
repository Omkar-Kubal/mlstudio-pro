"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/adapters/api";
import Link from "next/link";

interface Settings {
    use_mock_auth: string;
    admin_email: string;
    firebase_project: string;
    api_version: string;
    firebase_initialized: boolean;
}

function SettingRow({ label, value, status }: { label: string; value: string; status?: "ok" | "warn" | "error" }) {
    const statusColor = status === "ok" ? "text-emerald-400" : status === "warn" ? "text-amber-400" : status === "error" ? "text-rose-400" : "text-[#737373]";
    const dotColor = status === "ok" ? "bg-emerald-500" : status === "warn" ? "bg-amber-500" : status === "error" ? "bg-rose-500" : "bg-[#525252]";
    return (
        <div className="flex items-center justify-between py-4 border-b border-[#111] last:border-0">
            <span className="text-sm text-[#737373]">{label}</span>
            <div className="flex items-center gap-2">
                {status && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
                <span className={`text-sm font-mono font-bold ${statusColor}`}>{value}</span>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiFetch<Settings>("/admin/settings")
            .then(setSettings)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (!user?.isAdmin) return null;

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <Link href="/admin" className="text-[#525252] hover:text-white transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <span className="text-xs font-mono text-[#525252] uppercase tracking-[0.3em]">Admin</span>
                            <h1 className="text-4xl font-black tracking-tighter">System Settings</h1>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-32">
                            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {settings && (
                        <div className="space-y-6">
                            {/* Auth Config */}
                            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl px-6 py-2">
                                <h2 className="text-xs font-bold text-[#525252] uppercase tracking-widest pt-4 pb-2">Authentication</h2>
                                <SettingRow
                                    label="Mock Auth Mode"
                                    value={settings.use_mock_auth}
                                    status={settings.use_mock_auth === "true" ? "warn" : "ok"}
                                />
                                <SettingRow
                                    label="Admin Email"
                                    value={settings.admin_email}
                                    status={settings.admin_email !== "not set" ? "ok" : "error"}
                                />
                                <SettingRow
                                    label="Firebase Admin SDK"
                                    value={settings.firebase_initialized ? "Initialized" : "Not initialized"}
                                    status={settings.firebase_initialized ? "ok" : "error"}
                                />
                            </div>

                            {/* System Info */}
                            <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl px-6 py-2">
                                <h2 className="text-xs font-bold text-[#525252] uppercase tracking-widest pt-4 pb-2">System Info</h2>
                                <SettingRow label="API Version" value={`v${settings.api_version}`} />
                                <SettingRow
                                    label="Service Account"
                                    value={settings.firebase_project !== "not configured" ? "Configured" : "Not configured"}
                                    status={settings.firebase_project !== "not configured" ? "ok" : "warn"}
                                />
                            </div>

                            {/* Tips */}
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 text-sm text-amber-400/80">
                                <p className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">info</span>
                                    Configuration Tips
                                </p>
                                <ul className="space-y-1.5 list-disc list-inside text-xs">
                                    <li>Set <code className="font-mono">USE_MOCK_AUTH=false</code> in backend <code>.env</code> for production</li>
                                    <li>Point <code className="font-mono">FIREBASE_SERVICE_ACCOUNT_JSON</code> to your downloaded key file</li>
                                    <li>Set <code className="font-mono">ADMIN_EMAIL</code> to your own email for immediate admin access</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </ProtectedRoute>
    );
}
