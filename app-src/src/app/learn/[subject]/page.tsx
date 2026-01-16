"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Module } from "@/types/learning";

export default function SubjectPage() {
    const params = useParams();
    const subjectSlug = params.subject as string;

    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/modules?subject=${subjectSlug}`)
            .then((res) => res.json())
            .then((data) => {
                setModules(data);
                setLoading(false);
            });
    }, [subjectSlug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted">Loading...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link href="/learn" className="text-sm text-muted hover:text-foreground transition-colors">
                        ← Back to Subjects
                    </Link>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-4 capitalize">
                        {subjectSlug.replace(/-/g, ' ')}
                    </h1>
                    <p className="text-lg text-muted">
                        Select a module to explore topics
                    </p>
                </motion.div>

                {/* Modules List */}
                <div className="space-y-4">
                    {modules.map((module, index) => (
                        <motion.div
                            key={module.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            <Link href={`/learn/${subjectSlug}/${module.slug}`}>
                                <div className="group border border-border rounded-lg p-6 hover:border-muted/50 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-medium text-foreground mb-2 group-hover:text-white transition-colors">
                                                {module.title}
                                            </h3>
                                            <p className="text-sm text-muted">{module.description}</p>
                                        </div>
                                        <svg
                                            className="w-5 h-5 text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
