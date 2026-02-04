"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ExploreNavbar() {
    const { scrollY } = useScroll();
    const backdropBlur = useTransform(scrollY, [0, 100], [0, 12]);
    const backgroundColor = useTransform(
        scrollY,
        [0, 100],
        ["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"]
    );

    return (
        <motion.nav
            style={{ backdropFilter: `blur(${backdropBlur}px)`, backgroundColor }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-border/0 transition-colors"
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-lg font-medium text-foreground group-hover:text-white transition-colors">
                        MLStudio Pro
                    </span>
                </Link>

                <div className="text-xs text-muted/50 font-mono tracking-wider">
                    EXPLORE
                </div>
            </div>
        </motion.nav>
    );
}
