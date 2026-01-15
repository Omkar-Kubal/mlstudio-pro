"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { sections, TOTAL_FRAMES } from "@/data/sections";

export default function SectionTextOverlay() {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    return (
        <div
            ref={containerRef}
            className="absolute top-0 left-0 w-full h-[500vh] pointer-events-none"
        >
            {sections.map((section, index) => {
                const sectionStart = (section.frameRange[0] - 1) / TOTAL_FRAMES;
                const sectionEnd = section.frameRange[1] / TOTAL_FRAMES;
                const sectionMid = (sectionStart + sectionEnd) / 2;

                return (
                    <SectionText
                        key={section.id}
                        section={section}
                        scrollYProgress={scrollYProgress}
                        sectionStart={sectionStart}
                        sectionEnd={sectionEnd}
                        sectionMid={sectionMid}
                        index={index}
                    />
                );
            })}
        </div>
    );
}

interface SectionTextProps {
    section: (typeof sections)[0];
    scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
    sectionStart: number;
    sectionEnd: number;
    sectionMid: number;
    index: number;
}

function SectionText({
    section,
    scrollYProgress,
    sectionStart,
    sectionEnd,
    sectionMid,
}: SectionTextProps) {
    // Fade in from start to mid, fade out from mid to end
    const opacity = useTransform(
        scrollYProgress,
        [
            sectionStart - 0.02,
            sectionStart + 0.02,
            sectionMid,
            sectionEnd - 0.02,
            sectionEnd + 0.02,
        ],
        [0, 1, 1, 1, 0]
    );

    // Subtle vertical movement
    const y = useTransform(
        scrollYProgress,
        [sectionStart, sectionMid, sectionEnd],
        [30, 0, -30]
    );

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-start px-8 md:px-16 lg:px-24"
            style={{ opacity, y }}
        >
            <div className="max-w-2xl">
                <motion.p className="text-sm uppercase tracking-[0.3em] text-muted mb-4">
                    {section.subtitle}
                </motion.p>
                <motion.h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6">
                    {section.title}
                </motion.h2>
                <motion.p className="text-lg md:text-xl text-muted leading-relaxed">
                    {section.description}
                </motion.p>
            </div>
        </motion.div>
    );
}
