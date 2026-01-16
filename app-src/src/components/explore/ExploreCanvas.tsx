"use client";

import { useEffect, useRef, useState } from "react";

interface ExploreCanvasProps {
    progress: number; // 0 to 1
}

export default function ExploreCanvas({ progress }: ExploreCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const totalFrames = 192;

    // Preload images with progress tracking
    useEffect(() => {
        const preload = async () => {
            const promises = [];
            let loaded = 0;

            for (let i = 1; i <= totalFrames; i++) {
                const frameNum = i.toString().padStart(3, "0");
                const src = `/explore-sequence/ezgif-frame-${frameNum}.jpg`;
                const promise = new Promise<HTMLImageElement>((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => {
                        loaded++;
                        setLoadProgress((loaded / totalFrames) * 100);
                        resolve(img);
                    };
                    img.onerror = () => resolve(img);
                });
                promises.push(promise);
            }

            const results = await Promise.all(promises);
            setImages(results);
            setImagesLoaded(true);
        };

        preload();
    }, []);

    // High-quality canvas rendering with smooth interpolation
    useEffect(() => {
        if (!canvasRef.current || !imagesLoaded || images.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const drawImage = () => {
            // Use 2x DPI minimum for sharper rendering
            const dpr = Math.max(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();

            // Set canvas size accounting for device pixel ratio
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // Scale context to match DPR
            ctx.scale(dpr, dpr);

            // Calculate frame index with smooth interpolation
            const frameFloat = progress * (totalFrames - 1);
            const frameIndex = Math.floor(frameFloat);
            const nextFrameIndex = Math.min(frameIndex + 1, totalFrames - 1);
            const blend = frameFloat - frameIndex;

            const currentImg = images[frameIndex];
            const nextImg = images[nextFrameIndex];

            if (!currentImg) return;

            // Apply strategic zoom (1.15x) to crop out watermark
            const zoomFactor = 1.15;

            // Calculate base scaling to contain
            const baseScale = Math.min(
                rect.width / currentImg.width,
                rect.height / currentImg.height
            );

            const scale = baseScale * zoomFactor;

            const x = (rect.width / 2) - (currentImg.width / 2) * scale;
            const y = (rect.height / 2) - (currentImg.height / 2) * scale;
            const w = currentImg.width * scale;
            const h = currentImg.height * scale;

            // Clear canvas with pure black
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, rect.width, rect.height);

            // Draw current frame with enhanced quality
            ctx.globalAlpha = 1 - blend;
            ctx.drawImage(currentImg, x, y, w, h);

            // Always blend with next frame for ultra-smooth transitions (no threshold)
            if (nextImg && frameIndex !== nextFrameIndex) {
                ctx.globalAlpha = blend;
                ctx.drawImage(nextImg, x, y, w, h);
            }

            // Reset alpha
            ctx.globalAlpha = 1;
        };

        // Draw only when progress changes (not continuously)
        drawImage();

        // Handle resize
        const handleResize = () => {
            drawImage();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };

    }, [progress, imagesLoaded, images]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full bg-black -z-10"
            />

            {/* Loading indicator */}
            {!imagesLoaded && (
                <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
                    <div className="text-center space-y-4">
                        <div className="w-64 h-1 bg-border rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-300"
                                style={{ width: `${loadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-muted font-mono">
                            Loading experience... {Math.round(loadProgress)}%
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
