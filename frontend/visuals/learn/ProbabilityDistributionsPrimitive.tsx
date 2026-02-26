"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

// ─── Constants ───────────────────────────────────────────────────────────────
const W = 560, H = 600;
const ROWS = 9;
const COLS = ROWS + 1;
const PEG_RADIUS = 5;
const BALL_RADIUS = 4.5;
const TOP_PAD = 60;
const BOARD_H = 340;
const BIN_Y = TOP_PAD + BOARD_H;
const BIN_H = 160;

const GRAVITY = 0.45;
const BOUNCE_DAMP = 0.42;
const PEG_PUSH = 2.4;

// ─── Types ──────────────────────────────────────────────────────────────────
interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    settled: boolean;
    bin: number;
    flash: number;
    trail: { x: number; y: number }[];
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ProbabilityDistributionsPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const _containerRef = useRef<HTMLDivElement>(null);
    const [_balls, _setBalls] = useState<Ball[]>([]);
    const [bins, setBins] = useState<number[]>(new Array(COLS).fill(0));
    const [totalDropped, setTotalDropped] = useState(0);
    const [autoPlay, setAutoPlay] = useState(false);
    const [speed, setSpeed] = useState(1);
    const ballsRef = useRef<Ball[]>([]);
    const binsRef = useRef<number[]>(new Array(COLS).fill(0));
    const requestRef = useRef<number | undefined>(undefined);

    const PEG_SPACING_X = W / (COLS + 1);
    const PEG_SPACING_Y = BOARD_H / (ROWS + 1);

    const getPegPos = (row: number, col: number) => {
        const totalInRow = row + 1;
        const startX = W / 2 - (totalInRow - 1) * PEG_SPACING_X / 2;
        return {
            x: startX + col * PEG_SPACING_X,
            y: TOP_PAD + (row + 1) * PEG_SPACING_Y
        };
    };

    const spawnBall = useCallback(() => {
        const newBall: Ball = {
            x: W / 2 + (Math.random() - 0.5) * 3,
            y: 0,
            vx: (Math.random() - 0.5) * 0.8,
            vy: 1.0,
            settled: false,
            bin: -1,
            flash: 0,
            trail: []
        };
        ballsRef.current.push(newBall);
        setTotalDropped(prev => prev + 1);
    }, []);

    const dropBatch = useCallback((count: number) => {
        let i = 0;
        const interval = setInterval(() => {
            spawnBall();
            i++;
            if (i >= count) clearInterval(interval);
        }, 30);
    }, [spawnBall]);

    const update = useCallback(() => {
        const activeBalls = ballsRef.current;

        for (let i = 0; i < speed; i++) {
            for (const b of activeBalls) {
                if (b.settled) continue;

                b.trail.push({ x: b.x, y: b.y });
                if (b.trail.length > 5) b.trail.shift();

                b.vy += GRAVITY;
                b.x += b.vx;
                b.y += b.vy;

                // Peg Collisions
                for (let row = 0; row < ROWS; row++) {
                    for (let col = 0; col <= row; col++) {
                        const p = getPegPos(row, col);
                        const dx = b.x - p.x;
                        const dy = b.y - p.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const minD = PEG_RADIUS + BALL_RADIUS;

                        if (dist < minD) {
                            const nx = dx / dist;
                            const ny = dy / dist;
                            const dot = b.vx * nx + b.vy * ny;
                            b.vx = (b.vx - 2 * dot * nx) * BOUNCE_DAMP;
                            b.vy = (b.vy - 2 * dot * ny) * BOUNCE_DAMP;
                            b.vx += (Math.random() > 0.5 ? 1 : -1) * PEG_PUSH;
                            b.vy = Math.abs(b.vy) + 0.5;
                            b.x = p.x + nx * (minD + 0.2);
                            b.y = p.y + ny * (minD + 0.2);
                        }
                    }
                }

                // Boundary Check
                const leftWall = W / 2 - COLS / 2 * PEG_SPACING_X;
                const rightWall = W / 2 + COLS / 2 * PEG_SPACING_X;
                if (b.x < leftWall + BALL_RADIUS) { b.x = leftWall + BALL_RADIUS; b.vx = Math.abs(b.vx); }
                if (b.x > rightWall - BALL_RADIUS) { b.x = rightWall - BALL_RADIUS; b.vx = -Math.abs(b.vx); }

                // Binning
                if (b.y >= BIN_Y) {
                    const nearestBin = Math.floor((b.x - leftWall) / PEG_SPACING_X);
                    const clampedBin = Math.max(0, Math.min(COLS - 1, nearestBin));
                    b.settled = true;
                    b.bin = clampedBin;
                    b.flash = 1.0;
                    binsRef.current[clampedBin]++;
                    setBins([...binsRef.current]);
                }
            }
        }

        // Cleanup settled balls after flash
        ballsRef.current = activeBalls.filter(b => !b.settled || b.flash > 0);
        activeBalls.forEach(b => { if (b.settled && b.flash > 0) b.flash -= 0.1; });

    }, [speed]); // eslint-disable-line react-hooks/exhaustive-deps

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);

        const leftWall = W / 2 - COLS / 2 * PEG_SPACING_X;

        // Draw Grid Pins (Pegs)
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col <= row; col++) {
                const p = getPegPos(row, col);

                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, PEG_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                ctx.stroke();
                ctx.restore();
            }
        }

        // Draw Bin Walls
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= COLS; i++) {
            const bx = leftWall + i * PEG_SPACING_X;
            ctx.beginPath();
            ctx.moveTo(bx, BIN_Y);
            ctx.lineTo(bx, H - 10);
            ctx.stroke();
        }

        // Draw Empirical Bars
        const maxBin = Math.max(...binsRef.current, 1);
        for (let i = 0; i < COLS; i++) {
            const bx = leftWall + i * PEG_SPACING_X;
            const count = binsRef.current[i];
            if (count > 0) {
                const bh = (count / maxBin) * (BIN_H - 20);
                const by = H - 10 - bh;

                ctx.fillStyle = "hsla(var(--primary), 0.4)";
                ctx.fillRect(bx + 2, by, PEG_SPACING_X - 4, bh);

                ctx.fillStyle = "hsl(var(--primary))";
                ctx.font = "bold 9px var(--font-jetbrains)";
                ctx.textAlign = "center";
                ctx.fillText(count.toString(), bx + PEG_SPACING_X / 2, by - 5);
            }
        }

        // Theoretical Overlay (Normal Curve Approximation)
        if (totalDropped > 20) {
            const mean = (COLS - 1) / 2;
            const sigma = Math.sqrt(ROWS * 0.25);
            ctx.beginPath();
            ctx.strokeStyle = "hsla(var(--accent), 0.8)";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);

            for (let i = 0; i < COLS * 10; i++) {
                const t = i / (COLS * 10 - 1);
                const binIdx = t * (COLS - 1);
                const z = (binIdx - mean) / sigma;
                const prob = Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
                const expectedCount = prob * totalDropped;
                const bh = (expectedCount / maxBin) * (BIN_H - 20);
                const px = leftWall + (binIdx + 0.5) * PEG_SPACING_X;
                const py = H - 10 - bh;
                if (i === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw Active Balls
        ballsRef.current.forEach(b => {
            if (!b.settled) {
                // Trail
                b.trail.forEach((t, idx) => {
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, BALL_RADIUS * (idx / b.trail.length), 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(var(--primary), ${0.1 + (idx / b.trail.length) * 0.2})`;
                    ctx.fill();
                });

                // Ball
                ctx.save();
                ctx.shadowBlur = 8;
                ctx.shadowColor = "hsl(var(--primary))";
                ctx.beginPath();
                ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = "hsl(var(--primary))";
                ctx.fill();
                ctx.restore();
            } else if (b.flash > 0) {
                // Settlement Bloom
                const fb = leftWall + (b.bin + 0.5) * PEG_SPACING_X;
                ctx.beginPath();
                ctx.arc(fb, BIN_Y, 15, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(var(--primary), ${b.flash * 0.3})`;
                ctx.fill();
            }
        });

    }, [totalDropped, PEG_SPACING_X]); // eslint-disable-line react-hooks/exhaustive-deps

    const animate = useCallback((_time: number) => {
        update();
        draw();
        requestRef.current = requestAnimationFrame(animate);
    }, [update, draw]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [animate]);

    // Auto-play loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoPlay) {
            interval = setInterval(() => {
                for (let i = 0; i < 2; i++) spawnBall();
            }, 100);
        }
        return () => clearInterval(interval);
    }, [autoPlay, spawnBall]);

    // Stats
    const stats = useMemo(() => {
        let sum = 0, sumSq = 0, count = 0;
        bins.forEach((val, idx) => {
            sum += idx * val;
            sumSq += idx * idx * val;
            count += val;
        });
        if (count === 0) return { mean: 0, std: 0, conv: 0 };
        const mean = sum / count;
        const std = Math.sqrt(sumSq / count - mean * mean);
        const theorMean = (COLS - 1) / 2;
        const conv = Math.max(0, 1 - Math.abs(mean - theorMean) / (theorMean || 1));
        return { mean, std, conv };
    }, [bins]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">blur_on</span>
                        The Galton Board
                    </h3>
                    <p className="text-xs text-muted/60 italic lowercase">Order within randomness (N={totalDropped})</p>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 3, 8].map(s => (
                        <button
                            key={s}
                            onClick={() => setSpeed(s)}
                            className={`px-3 py-1 rounded text-[10px] font-bold border transition-all ${speed === s ? "bg-primary/20 border-primary text-primary" : "bg-surface border-border text-muted hover:border-muted"
                                }`}
                        >
                            ×{s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 relative rounded bg-slate-950/40 border border-border/50 overflow-hidden shadow-2xl h-[600px]">
                    <canvas ref={canvasRef} width={W} height={H} className="w-full h-full object-contain" />
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-surface/80 border border-border rounded-lg p-4 space-y-4">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border pb-2">Drop Sequence</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => spawnBall()} className="px-3 py-2 bg-secondary/10 border border-secondary/20 rounded text-[10px] font-bold hover:bg-secondary/20 transition-all text-secondary">DROP 1</button>
                            <button onClick={() => dropBatch(10)} className="px-3 py-2 bg-secondary/10 border border-secondary/20 rounded text-[10px] font-bold hover:bg-secondary/20 transition-all text-secondary">DROP 10</button>
                        </div>
                        <button
                            onClick={() => setAutoPlay(!autoPlay)}
                            className={`w-full py-3 rounded-lg border font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${autoPlay ? "bg-rose-500/20 border-rose-500 text-rose-500" : "bg-primary/20 border-primary text-primary"
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{autoPlay ? "pause" : "play_arrow"}</span>
                            {autoPlay ? "Stop Auto" : "Auto Play"}
                        </button>
                    </div>

                    <div className="bg-surface/80 border border-border rounded-lg p-4 space-y-3">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border pb-2">Live Convergence</div>
                        <div className="space-y-3">
                            {[
                                { label: "Empirical Mean", val: stats.mean.toFixed(2), icon: "average", color: "text-primary" },
                                { label: "Std Deviation", val: stats.std.toFixed(2), icon: "vibration", color: "text-secondary" },
                                { label: "Convergence", val: `${(stats.conv * 100).toFixed(0)}%`, icon: "target", color: "text-emerald-500" },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`material-symbols-outlined text-xs ${s.color}`}>{s.icon}</span>
                                        <span className="text-[10px] text-muted uppercase font-medium">{s.label}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-foreground">{s.val}</span>
                                </div>
                            ))}
                        </div>
                        <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden mt-1">
                            <motion.div
                                animate={{ width: `${stats.conv * 100}%` }}
                                className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg flex gap-3">
                        <span className="material-symbols-outlined text-accent text-lg">lightbulb</span>
                        <p className="text-[10px] text-muted leading-relaxed">
                            <span className="text-foreground font-bold uppercase tracking-tight italic">Insight:</span> The Galton Board is a mechanical example of the Central Limit Theorem. Each ball performs a random walk; while any single path is unpredictable, the aggregate always forms a Bell Curve.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            ballsRef.current = [];
                            binsRef.current = new Array(COLS).fill(0);
                            setBins([...binsRef.current]);
                            setTotalDropped(0);
                            setAutoPlay(false);
                        }}
                        className="w-full py-2 bg-border/20 border border-border/50 rounded text-[10px] font-bold text-muted hover:text-rose-400 hover:border-rose-400/30 transition-all uppercase tracking-widest"
                    >
                        Reset Board
                    </button>
                </div>
            </div>
        </div>
    );
}

