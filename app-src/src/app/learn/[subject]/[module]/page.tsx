"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Topic } from "@/types/learning";

export default function ModulePage() {
    const params = useParams();
    const subjectSlug = params.subject as string;
    const moduleSlug = params.module as string;

    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/topics?module=${moduleSlug}`)
            .then((res) => res.json())
            .then((data) => {
                setTopics(data);
                setLoading(false);
            });
    }, [moduleSlug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted">Loading...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm">
                    <Link href="/learn" className="text-muted hover:text-foreground transition-colors">
                        Learn
                    </Link>
                    <span className="text-muted">/</span>
                    <Link href={`/learn/${subjectSlug}`} className="text-muted hover:text-foreground transition-colors capitalize">
                        {subjectSlug.replace(/-/g, ' ')}
                    </Link>
                    <span className="text-muted">/</span>
                    <span className="text-foreground capitalize">{moduleSlug.replace(/-/g, ' ')}</span>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-4 capitalize">
                        {moduleSlug.replace(/-/g, ' ')}
                    </h1>
                    <p className="text-lg text-muted">
                        Select a topic to start learning
                    </p>
                </motion.div>

                {/* Topics List */}
                <div className="space-y-3">
                    {topics.map((topic, index) => (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                        >
                            <Link href={`/learn/${subjectSlug}/${moduleSlug}/${topic.slug}`}>
                                <div className="group border border-border rounded-lg p-5 hover:border-muted/50 transition-all hover:bg-accent/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm text-muted">
                                                {topic.order}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-foreground group-hover:text-white transition-colors">
                                                    {topic.title}
                                                </h3>
                                                <p className="text-sm text-muted mt-1">{topic.description}</p>
                                            </div>
                                        </div>
                                        <svg
                                            className="w-5 h-5 text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0"
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

                {topics.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted">No topics available yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
