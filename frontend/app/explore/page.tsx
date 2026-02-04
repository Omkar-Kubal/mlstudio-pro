"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import ExploreNavbar from "@/components/explore/ExploreNavbar";
import LearningRoadmap from "@/components/explore/LearningRoadmap";

export default function ExplorePage() {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
    }, []);

    return (
        <>
            {/* Skip to content link */}
            <a
                href="#learning-roadmap"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md"
            >
                Skip to Learning Roadmap
            </a>

            <ExploreNavbar />

            {/* Hero Section with Roadmap Image */}
            <section className="relative min-h-screen flex flex-col bg-black">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imageLoaded ? 1 : 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src="/data-science-map.png"
                            alt="Data Science Learning Roadmap"
                            fill
                            className="object-contain p-8 md:p-12 lg:p-16"
                            onLoad={() => setImageLoaded(true)}
                            priority
                        />
                    </motion.div>

                    {/* Gradient overlays for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                </div>

                {/* Loading state */}
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                        <div className="text-center space-y-4">
                            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-white/50">Loading roadmap...</p>
                        </div>
                    </div>
                )}

                {/* Top Content */}
                <motion.div
                    className="relative z-10 pt-24 md:pt-32 px-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs mb-6">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        Data Science Roadmap
                    </div>
                    <h1 className="text-3xl md:text-5xl font-medium text-white mb-4">
                        See How Everything Connects
                    </h1>
                    <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto">
                        This is your learning journey. Each branch leads to interactive modules.
                    </p>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    className="relative z-10 mt-auto pb-12 md:pb-16 px-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <Link
                        href="/learn"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        Start Learning
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>

                    <p className="mt-6 text-sm text-white/40">
                        Scroll down for detailed roadmap breakdown
                    </p>

                    {/* Scroll indicator */}
                    <motion.div
                        className="mt-4 flex justify-center"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </motion.div>
                </motion.div>
            </section>

            {/* Learning Roadmap Section */}
            <div id="learning-roadmap" tabIndex={-1} className="outline-none">
                <LearningRoadmap />
            </div>
        </>
    );
}
