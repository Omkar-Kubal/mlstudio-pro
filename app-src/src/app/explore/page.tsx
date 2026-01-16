"use client";

import { useScroll } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import ExploreNavbar from "@/components/explore/ExploreNavbar";
import ExploreCanvas from "@/components/explore/ExploreCanvas";
import ExploreOverlay from "@/components/explore/ExploreOverlay";
import LearningRoadmap from "@/components/explore/LearningRoadmap";

export default function ExplorePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Track scroll progress
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const [progress, setProgress] = useState(0);

    // Sync motion value to state for non-motion components
    useEffect(() => {
        return scrollYProgress.onChange((latest) => {
            setProgress(latest);
        });
    }, [scrollYProgress]);

    return (
        <>
            <ExploreNavbar />

            <main
                ref={containerRef}
                className="h-[600vh] bg-neutral-950 relative"
            >
                <div
                    className="sticky top-0 h-screen w-full overflow-hidden"
                    style={{ willChange: "transform" }}
                >
                    {/* Background Visuals */}
                    <ExploreCanvas progress={progress} />

                    {/* Scrollytelling Overlay */}
                    <ExploreOverlay progress={progress} />
                </div>
            </main>

            {/* Learning Roadmap Section */}
            <LearningRoadmap />
        </>
    );
}
