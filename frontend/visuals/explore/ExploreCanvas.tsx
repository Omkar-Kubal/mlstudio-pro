"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, MotionValue, useMotionValueEvent } from "framer-motion";

interface ExploreCanvasProps {
    progress: MotionValue<number>;
    onLoadingChange?: (isLoading: boolean) => void;
}

const TOTAL_EXPLORE_FRAMES = 192;

export default function ExploreCanvas({ progress, onLoadingChange }: ExploreCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<(HTMLImageElement | null)[]>([]);
    const [initialBatchLoaded, setInitialBatchLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const INITIAL_BATCH = 40;

    // Check for reduced motion
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    // Notify parent of loading state
    useEffect(() => {
        onLoadingChange?.(!initialBatchLoaded);
    }, [initialBatchLoaded, onLoadingChange]);

    // Frame loading logic
    useEffect(() => {
        const loadFrame = (index: number): Promise<HTMLImageElement | null> => {
            return new Promise((resolve) => {
                const frameNumber = String(index).padStart(3, "0");
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = `/explorepage/ezgif-frame-${frameNumber}.jpg`;
            });
        };

        const loadImages = async () => {
            const imageArray: (HTMLImageElement | null)[] = new Array(TOTAL_EXPLORE_FRAMES).fill(null);

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

            for (let i = INITIAL_BATCH + 1; i <= TOTAL_EXPLORE_FRAMES; i++) {
                loadFrame(i).then((img) => {
                    imageArray[i - 1] = img;
                    setImages([...imageArray]);
                });
            }
        };

        loadImages();
    }, []);

    const getOptimizedDPR = useCallback(() => {
        const rawDPR = window.devicePixelRatio || 1;
        // Increase cap for higher fidelity, especially on high-DPI screens
        return Math.min(rawDPR, 2);
    }, []);

    // Optimized Render Logic: Use MotionValue events to bypass React render cycle
    useMotionValueEvent(progress, "change", (latest) => {
        if (!initialBatchLoaded || images.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const dpr = getOptimizedDPR();

        // Manual resize check if needed (usually handled by resize event below, 
        // but ensuring dimensions match canvas state)
        if (canvas.width !== canvas.clientWidth * dpr || canvas.height !== canvas.clientHeight * dpr) {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }

        const frameFloat = latest * (TOTAL_EXPLORE_FRAMES - 1);
        const frameIndex = Math.round(frameFloat);
        const safeIndex = Math.max(0, Math.min(frameIndex, images.length - 1));
        const img = images[safeIndex];

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

        // Ensure smoothing is enabled for high quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
    });

    // Initial and resize rendering
    useEffect(() => {
        if (!initialBatchLoaded) return;

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

            // Clear and set high quality
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // Trigger a re-render of current frame on resize
            const currentProgress = progress.get();
            const frameFloat = currentProgress * (TOTAL_EXPLORE_FRAMES - 1);
            const frameIndex = Math.round(frameFloat);
            const safeIndex = Math.max(0, Math.min(frameIndex, images.length - 1));
            const img = images[safeIndex];

            if (img) {
                const imgAspect = img.width / img.height;
                const canvasAspect = rect.width / rect.height;
                let dw, dh, dx, dy;
                if (imgAspect > canvasAspect) {
                    dh = rect.height;
                    dw = rect.height * imgAspect;
                    dx = (rect.width - dw) / 2;
                    dy = 0;
                } else {
                    dw = rect.width;
                    dh = rect.width / imgAspect;
                    dx = 0;
                    dy = (rect.height - dh) / 2;
                }
                const roundedX = Math.round(dx);
                const roundedY = Math.round(dy);
                const roundedWidth = Math.round(dw);
                const roundedHeight = Math.round(dh);
                ctx.drawImage(img, roundedX, roundedY, roundedWidth, roundedHeight);
            }
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, [initialBatchLoaded, images, progress, getOptimizedDPR]);

    if (prefersReducedMotion) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center space-y-4 max-w-xl px-6">
                    <h2 className="text-3xl font-bold text-white">Visual Roadmap Experience</h2>
                    <p className="text-white/60">Animation disabled for accessibility preference.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black">
            {!initialBatchLoaded && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black">
                    <div className="text-lg font-medium text-white/70 mb-4">Initializing roadmap...</div>
                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ display: initialBatchLoaded ? "block" : "none" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(0,0,0,0.4)_100%)] pointer-events-none" />
        </div>
    );
}
