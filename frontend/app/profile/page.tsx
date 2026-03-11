"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiFetch } from "@/adapters/api";
import Link from "next/link";
import Image from "next/image";

interface Profile {
    id: string;
    display_name: string;
    avatar_url: string;
    persona: string;
    bio: string;
}

const AVATARS = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Aria",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Zane",
    "https://api.dicebear.com/7.x/bottts/svg?seed=Nova"
];

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiFetch<Profile>("/profile");
                setProfile(data);
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        setMessage(null);

        try {
            await apiFetch("/profile", {
                method: "PATCH",
                body: JSON.stringify({
                    display_name: profile.display_name,
                    bio: profile.bio,
                    persona: profile.persona,
                    avatar_url: profile.avatar_url,
                }),
            });
            setMessage({ type: 'success', text: "Profile updated successfully!" });
        } catch (_err) {
            setMessage({ type: 'error', text: "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-black text-white p-6 lg:p-12">
                <div className="max-w-2xl mx-auto space-y-12">
                    <header className="space-y-4">
                        <Link href="/dashboard" className="text-muted hover:text-white transition-colors flex items-center gap-2 text-sm">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black tracking-tighter">Profile Settings</h1>
                    </header>

                    <form onSubmit={handleUpdate} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-muted font-bold">Avatar</label>
                                <div className="flex gap-4">
                                    {AVATARS.map((url) => (
                                        <button
                                            key={url}
                                            type="button"
                                            onClick={() => setProfile(prev => prev ? { ...prev, avatar_url: url } : null)}
                                            className={`size-16 rounded-2xl border-2 transition-all overflow-hidden ${profile?.avatar_url === url
                                                ? 'border-primary ring-4 ring-primary/20 bg-primary/10'
                                                : 'border-border hover:border-white/20 bg-surface'
                                                }`}
                                        >
                                            <Image
                                                src={url}
                                                alt="Avatar"
                                                width={64}
                                                height={64}
                                                className="w-full h-full"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-muted font-bold">Display Name</label>
                                <input
                                    type="text"
                                    value={profile?.display_name || ""}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-muted font-bold">Bio</label>
                                <textarea
                                    value={profile?.bio || ""}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px]"
                                    placeholder="Tell us about yourself"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-muted font-bold">Learning Persona</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Beginner', 'Advanced'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setProfile(prev => prev ? { ...prev, persona: p } : null)}
                                            className={`p-4 rounded-xl border transition-all text-sm font-bold ${profile?.persona === p
                                                ? 'bg-primary text-black border-primary'
                                                : 'bg-surface border-border text-muted hover:border-white/20'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-muted italic mt-2">
                                    Choose 'Beginner' for more intuitive explanations, or 'Advanced' for technical depth.
                                </p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </main>
        </ProtectedRoute>
    );
}
