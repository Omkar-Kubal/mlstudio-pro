"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ExploreCanvasProps {
    progress: number;
    onLoadingChange?: (isLoading: boolean) => void;
}

export default function ExploreCanvas({ progress, onLoadingChange }: ExploreCanvasProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Notify parent of loading state
    useEffect(() => {
        onLoadingChange?.(!imageLoaded);
    }, [imageLoaded, onLoadingChange]);

    return (
        <div className="absolute inset-0 bg-black" aria-hidden="true">
            {/* Static roadmap image */}
            <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.8 }}
            >
                <Image
                    src="/data-science-map.png"
                    alt="Data Science Learning Roadmap"
                    fill
                    className="object-contain p-4 md:p-8"
                    onLoad={() => setImageLoaded(true)}
                    priority
                />
            </motion.div>

            {/* Subtle vignette overlay for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(0,0,0,0.4)_100%)] pointer-events-none" />

            {/* Loading indicator */}
            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <div className="text-center space-y-4">
                        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-sm text-white/50">Loading roadmap...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
