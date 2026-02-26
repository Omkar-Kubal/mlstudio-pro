"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { sections, TOTAL_FRAMES } from "@/adapters/sections";

interface SectionTextOverlayProps {
    progress: number; // 0 to 1, controlled by parent
}

export default function SectionTextOverlay({ progress }: SectionTextOverlayProps) {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {sections.map((section, index) => {
                const sectionStart = (section.frameRange[0] - 1) / TOTAL_FRAMES;
                const sectionEnd = section.frameRange[1] / TOTAL_FRAMES;
                const _sectionMid = (sectionStart + sectionEnd) / 2;

                return (
                    <SectionText
                        key={section.id}
                        section={section}
                        progress={progress}
                        sectionStart={sectionStart}
                        sectionEnd={sectionEnd}
                        index={index}
                    />
                );
            })}
        </div>
    );
}

interface SectionTextProps {
    section: (typeof sections)[0];
    progress: number;
    sectionStart: number;
    sectionEnd: number;
    index: number;
}

function SectionText({
    section,
    progress,
    sectionStart,
    sectionEnd,
}: SectionTextProps) {
    // Calculate opacity based on progress
    const opacity = useMemo(() => {
        const fadeInStart = sectionStart - 0.02;
        const fadeInEnd = sectionStart + 0.02;
        const fadeOutStart = sectionEnd - 0.02;
        const fadeOutEnd = sectionEnd + 0.02;

        if (progress < fadeInStart) return 0;
        if (progress < fadeInEnd) return (progress - fadeInStart) / (fadeInEnd - fadeInStart);
        if (progress < fadeOutStart) return 1;
        if (progress < fadeOutEnd) return 1 - (progress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
        return 0;
    }, [progress, sectionStart, sectionEnd]);

    // Calculate vertical offset
    const y = useMemo(() => {
        if (progress < sectionStart) return 30;
        if (progress > sectionEnd) return -30;
        const normalizedProgress = (progress - sectionStart) / (sectionEnd - sectionStart);
        return 30 - (normalizedProgress * 60); // 30 to -30
    }, [progress, sectionStart, sectionEnd]);

    // Don't render if completely invisible
    if (opacity <= 0) return null;

    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-start px-8 md:px-16 lg:px-24"
            style={{ opacity, transform: `translateY(${y}px)` }}
        >
            <div className="max-w-2xl">
                <p className="text-sm uppercase tracking-[0.3em] text-muted mb-4">
                    {section.subtitle}
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6">
                    {section.title}
                </h2>
                <p className="text-lg md:text-xl text-muted leading-relaxed">
                    {section.description}
                </p>
            </div>
        </motion.div>
    );
}
