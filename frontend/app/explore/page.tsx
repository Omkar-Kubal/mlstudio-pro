"use client";

import { useState, useRef } from "react";
import { useScroll, useSpring } from "framer-motion";
import ExploreNavbar from "@/visuals/explore/ExploreNavbar";
import LearningRoadmap from "@/visuals/explore/LearningRoadmap";
import ExploreCanvas from "@/visuals/explore/ExploreCanvas";
import ExploreOverlay from "@/visuals/explore/ExploreOverlay";

export default function ExplorePage() {
    const targetRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    const springProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <main className="bg-black">
            <ExploreNavbar />

            {/* Sticky Animation Container */}
            <section ref={targetRef} className="relative h-[600vh]">
                <div className="sticky top-0 h-screen w-full overflow-hidden">
                    <ExploreCanvas
                        progress={springProgress}
                        onLoadingChange={setIsLoading}
                    />

                    {!isLoading && (
                        <ExploreOverlay progress={springProgress} />
                    )}
                </div>
            </section>

            {/* Detailed Content */}
            <section id="learning-roadmap" className="relative z-20 bg-background">
                <LearningRoadmap />
            </section>
        </main>
    );
}
