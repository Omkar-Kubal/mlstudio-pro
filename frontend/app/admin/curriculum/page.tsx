"use client";

import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { subjects } from "@/adapters/subjects";
import { modules as allModules } from "@/adapters/modules";
import { getTopicsByModule } from "@/adapters/topics";
import Link from "next/link";
import { useState } from "react";

export default function CurriculumManagerPage() {
    const { user } = useAuth();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggle = (slug: string) => setExpanded(prev => ({ ...prev, [slug]: !prev[slug] }));

    const totalTopics = subjects.reduce((acc, s) => {
        const mods = allModules.filter(m => m.subjectSlug === s.slug);
        return acc + mods.reduce((a, m) => a + getTopicsByModule(m.slug, m.subjectSlug).length, 0);
    }, 0);

    if (!user?.isAdmin) return null;

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <Link href="/admin" className="text-[#525252] hover:text-white transition-colors">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <span className="text-xs font-mono text-[#525252] uppercase tracking-[0.3em]">Admin</span>
                            <h1 className="text-4xl font-black tracking-tighter">Curriculum Manager</h1>
                        </div>
                        <div className="ml-auto text-right">
                            <p className="text-2xl font-black">{subjects.length}</p>
                            <p className="text-xs text-[#525252]">subjects · {totalTopics} topics</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {subjects.map(subject => {
                            const mods = allModules.filter(m => m.subjectSlug === subject.slug);
                            const topicCount = mods.reduce((a, m) => a + getTopicsByModule(m.slug, m.subjectSlug).length, 0);
                            const isOpen = expanded[subject.slug];

                            return (
                                <div key={subject.slug} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#2a2a2a] transition-colors">
                                    {/* Subject row */}
                                    <button
                                        onClick={() => toggle(subject.slug)}
                                        className="w-full flex items-center gap-4 px-6 py-5 text-left group"
                                    >
                                        <span className="text-2xl">{subject.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-bold text-white group-hover:text-white/90">{subject.title}</p>
                                            <p className="text-xs text-[#525252] mt-0.5">{subject.description}</p>
                                        </div>
                                        <div className="flex items-center gap-6 text-right mr-2">
                                            <div>
                                                <p className="text-lg font-bold">{mods.length}</p>
                                                <p className="text-[10px] text-[#525252] uppercase tracking-wider">modules</p>
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">{topicCount}</p>
                                                <p className="text-[10px] text-[#525252] uppercase tracking-wider">topics</p>
                                            </div>
                                        </div>
                                        <span className={`material-symbols-outlined text-[#525252] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                                            expand_more
                                        </span>
                                    </button>

                                    {/* Module rows */}
                                    {isOpen && (
                                        <div className="border-t border-[#1a1a1a]">
                                            {mods.map((mod, i) => {
                                                const topics = getTopicsByModule(mod.slug, mod.subjectSlug);
                                                return (
                                                    <div key={mod.id} className={`px-6 py-4 ${i < mods.length - 1 ? "border-b border-[#111]" : ""}`}>
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <span className="text-[10px] font-bold font-mono text-[#525252] bg-[#1a1a1a] px-2 py-0.5 rounded">
                                                                {mod.slug}
                                                            </span>
                                                            <p className="text-sm font-semibold text-white">{mod.title}</p>
                                                            <span className="ml-auto text-xs text-[#525252]">{topics.length} topics</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 pl-2">
                                                            {topics.map(t => (
                                                                <span key={t.slug} className="text-[10px] font-mono bg-[#111] border border-[#1e1e1e] text-[#737373] px-2 py-1 rounded-md">
                                                                    {t.slug}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}
