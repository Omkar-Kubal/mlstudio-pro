"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useScroll, motion } from "framer-motion";
import Navbar from "@/visuals/Navbar";
import SystemScrollCanvas from "@/visuals/SystemScrollCanvas";
import SectionTextOverlay from "@/visuals/SectionTextOverlay";
import Footer from "@/visuals/Footer";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Redirect to dashboard if logged in
    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    // Single scroll progress source for the entire scroll section
    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ["start start", "end end"],
    });

    // Sync scroll progress to state
    useEffect(() => {
        return scrollYProgress.on("change", (latest) => {
            setProgress(latest);
        });
    }, [scrollYProgress]);

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Skip animation handler
    const handleSkip = () => {
        if (scrollContainerRef.current) {
            const containerBottom = scrollContainerRef.current.offsetTop + scrollContainerRef.current.offsetHeight;
            window.scrollTo({ top: containerBottom, behavior: "smooth" });
        }
    };

    return (
        <>
            <Navbar />

            {/* Static Hero Section — z-30 ensures it's above scroll content */}
            <section className="relative z-30 min-h-screen flex flex-col items-center justify-center text-center px-6 bg-background">
                {/* Subtle grid background */}
                <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/50 text-muted text-sm">
                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                        Visual Learning for AI
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.95]">
                        MLStudio<span className="text-primary">Pro</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto leading-relaxed font-light">
                        Build intuition for <span className="text-foreground">Machine Learning</span> and <span className="text-foreground">Data Science</span> through interactive visual exploration.
                    </p>

                    {/* Capability signals */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-muted/80">
                        <span className="flex items-center gap-2">
                            <span className="text-primary">●</span> Interactive Visualizations
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-primary">●</span> Executable Python Code
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="text-primary">●</span> Structured ML Roadmap
                        </span>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/learn"
                            className="px-10 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-primary hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            Start Learning
                        </Link>
                        <Link
                            href="/explore"
                            className="px-8 py-4 rounded-full border border-border text-muted font-medium text-lg hover:text-foreground hover:border-muted transition-colors"
                        >
                            Explore Roadmap
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted/50">
                    <span className="text-xs uppercase tracking-widest">Scroll to experience</span>
                    <div className="w-px h-8 bg-gradient-to-b from-muted/50 to-transparent animate-pulse" />
                </div>
            </section>

            {/* Scroll Animation Container — 500vh */}
            <div
                ref={scrollContainerRef}
                className="relative h-[500vh] bg-background"
            >
                {/* Sticky viewport for canvas and overlays */}
                <div className="sticky top-0 h-screen w-full overflow-hidden">
                    {/* Canvas and overlays receive unified progress */}
                    <SystemScrollCanvas progress={progress} />
                    <SectionTextOverlay progress={progress} />

                    {/* Skip Animation Button — visible during scroll */}
                    <motion.button
                        onClick={handleSkip}
                        className="absolute bottom-8 right-8 z-30 px-6 py-3 rounded-full bg-surface/80 backdrop-blur-sm border border-border text-muted hover:text-foreground hover:border-muted transition-all text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: progress < 0.9 ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        Skip Animation →
                    </motion.button>

                    {/* Footer cue near end of animation */}
                    <motion.div
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-muted/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: progress > 0.85 ? 1 : 0 }}
                    >
                        More content below ↓
                    </motion.div>
                </div>

                {/* Reduced motion fallback */}
                {prefersReducedMotion && (
                    <div className="sticky top-0 h-screen flex items-center justify-center bg-background">
                        <div className="text-center space-y-6 max-w-xl px-6">
                            <h2 className="text-3xl font-bold text-foreground">
                                Visual ML Learning
                            </h2>
                            <p className="text-muted">
                                Visualize concepts. Interact with parameters. Build intuition. Write confident code.
                            </p>
                            <Link
                                href="/learn"
                                className="inline-block px-8 py-3 rounded-full bg-white text-black font-bold"
                            >
                                Start Learning
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </>
    );
}
