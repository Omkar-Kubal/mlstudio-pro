"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TOTAL_FRAMES } from "@/data/sections";

interface SystemScrollCanvasProps {
    progress: number; // 0 to 1, controlled by parent
}

export default function SystemScrollCanvas({ progress }: SystemScrollCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<(HTMLImageElement | null)[]>([]);
    const [initialBatchLoaded, setInitialBatchLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const INITIAL_BATCH = 30; // Load first 30 frames immediately

    // Check for reduced motion preference
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Progressive frame loading
    useEffect(() => {
        const loadFrame = (index: number): Promise<HTMLImageElement | null> => {
            return new Promise((resolve) => {
                const frameNumber = String(index).padStart(3, "0");
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = `/frames/ezgif-frame-${frameNumber}.jpg`;
            });
        };

        const loadImages = async () => {
            // Initialize array with nulls
            const imageArray: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);

            // Load initial batch first (frames 1-30)
            const initialPromises = [];
            for (let i = 1; i <= INITIAL_BATCH; i++) {
                initialPromises.push(
                    loadFrame(i).then((img) => {
                        imageArray[i - 1] = img;
                        setLoadingProgress((i / INITIAL_BATCH) * 100);
                    })
                );
            }

            await Promise.all(initialPromises);
            setImages([...imageArray]);
            setInitialBatchLoaded(true);

            // Load remaining frames in background (non-blocking)
            for (let i = INITIAL_BATCH + 1; i <= TOTAL_FRAMES; i++) {
                loadFrame(i).then((img) => {
                    imageArray[i - 1] = img;
                    setImages([...imageArray]);
                });
            }
        };

        loadImages();
    }, []);

    // Optimized DPR calculation
    const getOptimizedDPR = useCallback(() => {
        const rawDPR = window.devicePixelRatio || 1;
        const isMobile = window.innerWidth < 768;
        // Clamp DPR: 1.25 for mobile, 1.5 for desktop
        return Math.min(rawDPR, isMobile ? 1.25 : 1.5);
    }, []);

    // Render frame on canvas
    useEffect(() => {
        if (!initialBatchLoaded || images.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const dpr = getOptimizedDPR();

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const renderFrame = () => {
            const frameFloat = progress * (TOTAL_FRAMES - 1);
            const frameIndex = Math.round(frameFloat);
            const safeIndex = Math.max(0, Math.min(frameIndex, images.length - 1));
            const img = images[safeIndex];

            // Fallback to nearest loaded frame if current isn't ready
            let fallbackImg = img;
            if (!fallbackImg) {
                for (let i = safeIndex; i >= 0; i--) {
                    if (images[i]) {
                        fallbackImg = images[i];
                        break;
                    }
                }
            }

            if (!fallbackImg) return;

            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            // Calculate dimensions with 'cover' behavior
            const imgAspect = fallbackImg.width / fallbackImg.height;
            const canvasAspect = rect.width / rect.height;

            let drawWidth: number, drawHeight: number, drawX: number, drawY: number;

            if (imgAspect > canvasAspect) {
                drawHeight = rect.height;
                drawWidth = rect.height * imgAspect;
                drawX = (rect.width - drawWidth) / 2;
                drawY = 0;
            } else {
                drawWidth = rect.width;
                drawHeight = rect.width / imgAspect;
                drawX = 0;
                drawY = (rect.height - drawHeight) / 2;
            }

            ctx.drawImage(fallbackImg, drawX, drawY, drawWidth, drawHeight);
        };

        renderFrame();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [initialBatchLoaded, images, progress, getOptimizedDPR]);

    // Reduced motion: show static content
    if (prefersReducedMotion) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-background">
                <div className="text-center space-y-4 max-w-xl px-6">
                    <h2 className="text-3xl font-bold text-foreground">
                        Visual ML Learning Experience
                    </h2>
                    <p className="text-muted">
                        Animation disabled due to reduced motion preference.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Loading overlay - scoped to this component, not fixed */}
            {!initialBatchLoaded && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background">
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

            {/* Canvas - decorative, marked for accessibility */}
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full"
                style={{ display: initialBatchLoaded ? "block" : "none" }}
            />
        </>
    );
}
