"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const phases = [
    {
        number: "1",
        title: "Foundations",
        subtitle: "Understanding data, uncertainty, and behavior",
        topics: [
            "Variables and distributions",
            "Mean, variance, and noise",
            "Correlation vs causation",
            "Loss functions and optimization intuition",
        ],
        action: "View Foundation Concepts",
        href: "/learn/foundations",
    },
    {
        number: "2",
        title: "Core Machine Learning",
        subtitle: "How models learn and make decisions",
        topics: [
            "Regression",
            "Classification",
            "Clustering",
            "Decision trees and ensembles",
        ],
        action: "Start with Regression",
        href: "/learn/machine-learning",
    },
    {
        number: "3",
        title: "Data Science in Practice",
        subtitle: "Working with real-world data",
        topics: [
            "Data cleaning and preprocessing",
            "Feature engineering",
            "Train / validation / test splits",
            "Model evaluation and metrics",
        ],
        action: "Explore Practical Workflows",
        href: "/learn/model-evaluation",
    },
    {
        number: "4",
        title: "Deep Learning Systems",
        subtitle: "Understanding layered representations",
        topics: [
            "Neural networks",
            "Backpropagation",
            "Convolutional networks",
            "Transformer intuition",
        ],
        action: "Explore Deep Learning",
        href: "/learn/deep-learning",
    },
    {
        number: "5",
        title: "Applied Domains",
        subtitle: "Applying systems to real problems",
        topics: [
            "Computer Vision",
            "Natural Language Processing",
            "End-to-end pipelines",
        ],
        action: "Unlocks after completing core foundations",
        href: "/learn/applied-domains",
        locked: true,
        unlockHint: "Complete Foundations, ML, and Deep Learning modules to unlock",
    },
];

export default function LearningRoadmap() {
    return (
        <section className="relative bg-background py-24 px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                        What You'll Learn in MLStudio Pro
                    </h2>
                    <p className="text-xl text-muted max-w-3xl mx-auto">
                        A structured path to understanding Data Science as a system — not a checklist of tools.
                    </p>
                </motion.div>

                {/* Intro */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-center mb-20 space-y-3 max-w-2xl mx-auto"
                >
                    <p className="text-base text-muted/90 leading-relaxed">
                        MLStudio Pro is organized by how concepts depend on each other.
                    </p>
                    <p className="text-base text-muted/90 leading-relaxed">
                        You don't jump between disconnected topics.
                    </p>
                    <p className="text-base text-muted/90 leading-relaxed">
                        You build understanding layer by layer — from intuition to implementation.
                    </p>
                </motion.div>

                {/* Phases */}
                <div className="space-y-8">
                    {phases.map((phase, index) => (
                        <motion.div
                            key={phase.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="group relative"
                        >
                            <div className="border border-border rounded-lg p-6 md:p-8 hover:border-muted/50 transition-colors">
                                {/* Phase Header */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                        <span className="text-lg font-medium text-foreground">
                                            {phase.number}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-medium text-foreground mb-1">
                                            {phase.title}
                                        </h3>
                                        <p className="text-sm text-muted">{phase.subtitle}</p>
                                    </div>
                                </div>

                                {/* Topics */}
                                <ul className="space-y-2 mb-6 ml-16">
                                    {phase.topics.map((topic, i) => (
                                        <li key={i} className="text-sm text-muted/80 flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-muted/40" />
                                            {topic}
                                        </li>
                                    ))}
                                </ul>

                                {/* Action */}
                                <div className="ml-16">
                                    {phase.locked ? (
                                        <div className="space-y-1">
                                            <span className="text-sm text-muted/50 italic flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                {phase.action}
                                            </span>
                                            {phase.unlockHint && (
                                                <p className="text-xs text-muted/40">
                                                    {phase.unlockHint}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <Link href={phase.href}>
                                            <span className="text-sm text-foreground hover:text-white transition-colors inline-flex items-center gap-1 group/link">
                                                {phase.action}
                                                <svg
                                                    className="w-4 h-4 group-hover/link:translate-x-1 transition-transform"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                                    />
                                                </svg>
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Final Transition */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mt-20 space-y-8"
                >
                    <p className="text-lg text-muted/90 max-w-xl mx-auto leading-relaxed">
                        You've seen how the system fits together.
                        <br />
                        Now it's time to interact with it.
                    </p>

                    <Link href="/learn">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-10 py-5 bg-white text-black font-medium rounded-full text-xl shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
                        >
                            Start Learning
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
