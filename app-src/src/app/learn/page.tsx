"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Subject } from "@/types/learning";

export default function LearnPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/subjects")
            .then((res) => res.json())
            .then((data) => {
                setSubjects(data);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted">Loading...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl md:text-6xl font-medium text-foreground mb-4">
                        Learning System
                    </h1>
                    <p className="text-xl text-muted max-w-2xl mx-auto">
                        Choose a subject to begin your journey through Data Science
                    </p>
                </motion.div>

                {/* Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject, index) => (
                        <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link href={`/learn/${subject.slug}`}>
                                <div className="group border border-border rounded-lg p-6 hover:border-muted/50 transition-all hover:shadow-lg">
                                    <div className="text-4xl mb-4">{subject.icon}</div>
                                    <h3 className="text-xl font-medium text-foreground mb-2 group-hover:text-white transition-colors">
                                        {subject.title}
                                    </h3>
                                    <p className="text-sm text-muted">{subject.description}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
