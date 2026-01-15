"use client";

import { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { TOTAL_FRAMES } from "@/data/sections";

export default function SystemScrollCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const currentFrame = useTransform(scrollYProgress, [0, 1], [1, TOTAL_FRAMES]);

    // Preload all images
    useEffect(() => {
        const loadImages = async () => {
            const imagePromises: Promise<HTMLImageElement>[] = [];

            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                const frameNumber = String(i).padStart(3, "0");
                const promise = new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        setLoadingProgress((prev) => Math.min(prev + (100 / TOTAL_FRAMES), 100));
                        resolve(img);
                    };
                    img.onerror = reject;
                    img.src = `/frames/ezgif-frame-${frameNumber}.jpg`;
                });
                imagePromises.push(promise);
            }

            try {
                const loadedImages = await Promise.all(imagePromises);
                setImages(loadedImages);
                setImagesLoaded(true);
            } catch (error) {
                console.error("Error loading images:", error);
            }
        };

        loadImages();
    }, []);

    // Render frame on canvas
    useEffect(() => {
        if (!imagesLoaded || images.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const renderFrame = (frameIndex: number) => {
            const safeIndex = Math.max(0, Math.min(frameIndex - 1, images.length - 1));
            const img = images[safeIndex];

            if (!img) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate dimensions to maintain aspect ratio with 'cover' behavior
            const imgAspect = img.width / img.height;
            const canvasAspect = canvas.width / canvas.height;

            let drawWidth: number;
            let drawHeight: number;
            let drawX: number;
            let drawY: number;

            if (imgAspect > canvasAspect) {
                // Image is wider - scale by height to cover
                drawHeight = canvas.height;
                drawWidth = canvas.height * imgAspect;
                drawX = (canvas.width - drawWidth) / 2;
                drawY = 0;
            } else {
                // Image is taller - scale by width to cover
                drawWidth = canvas.width;
                drawHeight = canvas.width / imgAspect;
                drawX = 0;
                drawY = (canvas.height - drawHeight) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        };

        const unsubscribe = currentFrame.on("change", (latest) => {
            requestAnimationFrame(() => {
                renderFrame(Math.round(latest));
            });
        });

        // Render first frame
        renderFrame(1);

        return () => {
            unsubscribe();
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [imagesLoaded, images, currentFrame]);

    return (
        <div ref={containerRef} className="relative h-[500vh]">
            {/* Loading overlay */}
            {!imagesLoaded && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
                    <div className="text-lg font-medium text-muted mb-4">Loading experience...</div>
                    <div className="w-64 h-1 bg-border rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-foreground"
                            initial={{ width: 0 }}
                            animate={{ width: `${loadingProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="text-sm text-muted mt-2">{Math.round(loadingProgress)}%</div>
                </div>
            )}

            {/* Sticky canvas */}
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ display: imagesLoaded ? "block" : "none" }}
                />
            </div>
        </div>
    );
}
