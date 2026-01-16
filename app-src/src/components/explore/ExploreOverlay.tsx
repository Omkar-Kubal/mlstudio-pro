"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ExploreOverlayProps {
    progress: number;
}

export default function ExploreOverlay({ progress }: ExploreOverlayProps) {
    const [scene, setScene] = useState(1);

    // Map progress to 6 scenes
    useEffect(() => {
        // Scene 1: 0.00 - 0.15 (Emergence)
        // Scene 2: 0.15 - 0.30 (Core Formation)
        // Scene 3: 0.30 - 0.50 (Primary Structure)
        // Scene 4: 0.50 - 0.70 (Internal Structure)
        // Scene 5: 0.70 - 0.85 (Meaning & Intuition)
        // Scene 6: 0.85 - 1.00 (Transition)
        if (progress < 0.15) setScene(1);
        else if (progress < 0.30) setScene(2);
        else if (progress < 0.50) setScene(3);
        else if (progress < 0.70) setScene(4);
        else if (progress < 0.85) setScene(5);
        else setScene(6);
    }, [progress]);

    const fadeVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    // Smoother easing configuration
    const smoothTransition = {
        duration: 1.4,
        ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for buttery smooth easing
    };

    return (
        <div className="fixed inset-0 pointer-events-none flex flex-col items-center justify-center p-8 z-10">
            <AnimatePresence mode="wait">
                {/* Scene 1: Emergence (Orientation) */}
                {scene === 1 && (
                    <motion.div
                        key="scene1"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={fadeVariants}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="text-center space-y-6 max-w-2xl"
                    >
                        <p className="text-xl md:text-2xl text-muted font-light leading-relaxed">
                            Learning begins with orientation.
                        </p>
                        <p className="text-lg md:text-xl text-muted/70 font-light">
                            Before details, see the whole.
                        </p>
                    </motion.div>
                )}

                {/* Scene 2: Core Formation (Concept Anchor) */}
                {scene === 2 && (
                    <motion.div
                        key="scene2"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={fadeVariants}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center space-y-8"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
                            DATA SCIENCE
                        </h1>
                        <p className="text-lg md:text-xl text-muted/80 font-light max-w-xl mx-auto leading-relaxed">
                            Data Science is not a list of tools — it is a system of relationships.
                        </p>
                    </motion.div>
                )}

                {/* Scene 3: Primary Structure (Domains) */}
                {scene === 3 && (
                    <motion.div
                        key="scene3"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={fadeVariants}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="relative w-full max-w-4xl">
                            {/* Domain labels positioned around the visualization */}
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="absolute top-[25%] left-[10%] text-left"
                            >
                                <h3 className="text-xl md:text-2xl font-medium text-white mb-1">Programming</h3>
                                <p className="text-sm text-muted/60">The language of instruction</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="absolute top-[20%] right-[10%] text-right"
                            >
                                <h3 className="text-xl md:text-2xl font-medium text-white mb-1">Mathematics</h3>
                                <p className="text-sm text-muted/60">The foundation of truth</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="absolute bottom-[25%] left-1/2 -translate-x-1/2 text-center"
                            >
                                <h3 className="text-xl md:text-2xl font-medium text-white mb-1">Machine Learning</h3>
                                <p className="text-sm text-muted/60">From rules to intuition</p>
                            </motion.div>

                            {/* Contextual micro-labels */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1, duration: 1 }}
                                className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-center"
                            >
                                <p className="text-sm text-muted/50 font-light italic">
                                    Each domain supports the others. No single part works in isolation.
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* Scene 4: Internal Structure (Depth Without Overload) */}
                {scene === 4 && (
                    <motion.div
                        key="scene4"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={fadeVariants}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="relative w-full h-full">
                            {/* Sub-branch labels scattered contextually */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.1 }}
                                className="absolute top-[20%] left-[20%] text-xs text-muted/60 font-mono"
                            >
                                Regression
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.2 }}
                                className="absolute top-[28%] left-[25%] text-xs text-muted/60 font-mono"
                            >
                                Classification
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.3 }}
                                className="absolute bottom-[35%] right-[25%] text-xs text-muted/60 font-mono"
                            >
                                Probability
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.4 }}
                                className="absolute bottom-[28%] right-[20%] text-xs text-muted/60 font-mono"
                            >
                                Optimization
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.5 }}
                                className="absolute top-[40%] right-[15%] text-xs text-muted/60 font-mono"
                            >
                                Evaluation
                            </motion.div>

                            {/* Central message */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 1 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="text-center space-y-4 max-w-xl">
                                    <p className="text-lg md:text-xl text-white/90 font-light">
                                        This is what you are learning — not yet how.
                                    </p>
                                    <p className="text-base md:text-lg text-muted/70 font-light italic">
                                        Structure precedes implementation.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* Scene 5: Meaning & Intuition (Cognitive Framing) */}
                {scene === 5 && (
                    <motion.div
                        key="scene5"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={fadeVariants}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="text-center space-y-10 max-w-3xl"
                    >
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 1 }}
                            className="text-4xl md:text-6xl font-medium text-white leading-tight"
                        >
                            See the structure.
                        </motion.h2>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 1 }}
                            className="text-3xl md:text-5xl font-light text-muted leading-tight"
                        >
                            Understand relationships.
                        </motion.h2>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="text-2xl md:text-4xl font-light text-muted/70 leading-tight"
                        >
                            Build intuition before code.
                        </motion.h2>
                    </motion.div>
                )}

                {/* Scene 6: Transition to Learning (Decision Point) */}
                {scene === 6 && (
                    <motion.div
                        key="scene6"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={fadeVariants}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="text-center pointer-events-auto space-y-10"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="space-y-4"
                        >
                            <h2 className="text-3xl md:text-4xl font-medium text-white">
                                You've seen how the system fits together.
                            </h2>
                            <p className="text-base text-muted/60 font-light max-w-md mx-auto">
                                Interact with concepts. Change parameters. Write code.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            <Link href="/learn">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255,255,255,0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-10 py-5 bg-white text-black font-medium rounded-full text-xl shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all"
                                >
                                    Start Learning
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistent Scroll Indicator (fades out near end) */}
            <motion.div
                className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                animate={{ opacity: progress > 0.9 ? 0 : 0.6 }}
                transition={{ duration: 0.5 }}
            >
                <span className="text-[10px] uppercase tracking-widest text-muted/40 font-light">
                    Scroll to Explore
                </span>
                <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-px h-10 bg-gradient-to-b from-transparent via-muted/30 to-transparent"
                />
            </motion.div>
        </div>
    );
}
