"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Navbar() {
    const { scrollYProgress } = useScroll();

    const borderOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
    const backdropBlur = useTransform(
        scrollYProgress,
        [0, 0.1],
        ["blur(0px)", "blur(12px)"]
    );

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4"
            style={{
                backdropFilter: backdropBlur,
                WebkitBackdropFilter: backdropBlur,
            }}
        >
            <motion.div
                className="absolute inset-x-0 bottom-0 h-px bg-border"
                style={{ opacity: borderOpacity }}
            />
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-lg font-medium tracking-tight text-foreground">
                            MLStudio Pro
                        </span>
                    </Link>
                </motion.div>

                {/* Navigation Links */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex items-center gap-6"
                >
                    <Link
                        href="/explore"
                        className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-200"
                    >
                        Explore
                    </Link>
                    <Link
                        href="/learn"
                        className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-200"
                    >
                        Learn
                    </Link>
                    <Link
                        href="/learn"
                        className="text-sm font-medium text-background bg-foreground hover:bg-primary px-4 py-2 rounded-full transition-colors duration-200"
                    >
                        Get Started
                    </Link>
                </motion.div>
            </div>
        </motion.nav>
    );
}
