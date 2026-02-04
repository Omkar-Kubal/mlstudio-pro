"use client";

import { motion } from "framer-motion";

export default function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-background border-t border-border py-16 px-8"
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="text-lg font-medium tracking-tight text-foreground">
                        MLStudio Pro
                    </span>
                    <span className="text-sm text-muted">Built for clarity.</span>
                </div>

                <div className="text-sm text-muted">
                    © {new Date().getFullYear()} MLStudio Pro. All rights reserved.
                </div>
            </div>
        </motion.footer>
    );
}
