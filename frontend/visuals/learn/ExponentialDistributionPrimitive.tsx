"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Constants & Types ───────────────────────────────────────────────────────
const TW = 900, TH = 180;
const PDF_W = 340, PDF_H = 220;

interface EventMarker {
    time: number;
    wait: number;
    id: number;
}

// ─── Mathematical Helpers ───────────────────────────────────────────────────
const expPDF = (x: number, lam: number) => lam * Math.exp(-lam * x);
const expCDF = (x: number, lam: number) => 1 - Math.exp(-lam * x);
const expSample = (lam: number) => -Math.log(1 - Math.random()) / lam;

// ─── Component ──────────────────────────────────────────────────────────────
export default function ExponentialDistributionPrimitive() {
    const [lambda, setLambda] = useState(1.0);
    const [events, setEvents] = useState<EventMarker[]>([]);
    const [waitedTime, setWaitedTime] = useState(1.0);

    const timelineRef = useRef<HTMLCanvasElement>(null);
    const pdfRef = useRef<HTMLCanvasElement>(null);
    const cdfRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | undefined>(undefined);

    // ─── Simulation ─────────────────────────────────────────────────────────
    const generateEvents = useCallback(() => {
        const newEvents: EventMarker[] = [];
        let totalTime = 0;
        let id = 1;
        // Generate events up to relative time 1.0 (scaled to canvas width)
        while (totalTime < 1.0) {
            const wait = expSample(lambda);
            if (totalTime + wait > 1.0) break;
            totalTime += wait;
            newEvents.push({ time: totalTime, wait, id: id++ });
        }
        setEvents(newEvents);
    }, [lambda]);

    useEffect(() => {
        generateEvents();
    }, [generateEvents]);

    // ─── Drawing Logic ──────────────────────────────────────────────────────
    const draw = useCallback(() => {
        // Timeline Draw
        const tlCtx = timelineRef.current?.getContext("2d");
        if (tlCtx) {
            tlCtx.clearRect(0, 0, TW, TH);
            tlCtx.fillStyle = "#121212";
            tlCtx.fillRect(0, 0, TW, TH);

            const PAD_L = 60, PAD_R = 60;
            const drawW = TW - PAD_L - PAD_R;
            const midY = TH / 2 + 10;

            // Track
            tlCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            tlCtx.lineWidth = 4;
            tlCtx.lineCap = "round";
            tlCtx.beginPath();
            tlCtx.moveTo(PAD_L, midY);
            tlCtx.lineTo(PAD_L + drawW, midY);
            tlCtx.stroke();

            // Markers & Waits
            events.forEach((ev, i) => {
                const ex = PAD_L + ev.time * drawW;
                const prevX = i === 0 ? PAD_L : PAD_L + events[i - 1].time * drawW;

                // Wait Segment
                tlCtx.strokeStyle = "rgba(212, 212, 212, 0.4)";
                tlCtx.lineWidth = 2;
                tlCtx.beginPath();
                tlCtx.moveTo(prevX, midY - 15);
                tlCtx.lineTo(prevX, midY - 25);
                tlCtx.lineTo(ex, midY - 25);
                tlCtx.lineTo(ex, midY - 15);
                tlCtx.stroke();

                tlCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
                tlCtx.font = "9px var(--font-jetbrains)";
                tlCtx.textAlign = "center";
                tlCtx.fillText(`${ev.wait.toFixed(2)}s`, (prevX + ex) / 2, midY - 30);

                // Event Dot
                tlCtx.beginPath();
                tlCtx.arc(ex, midY, 6, 0, Math.PI * 2);
                tlCtx.fillStyle = "#F59E0B";
                tlCtx.fill();

                // Glow
                tlCtx.shadowBlur = 10;
                tlCtx.shadowColor = "rgba(245, 158, 11, 0.5)";
                tlCtx.beginPath();
                tlCtx.arc(ex, midY, 3, 0, Math.PI * 2);
                tlCtx.fillStyle = "white";
                tlCtx.fill();
                tlCtx.shadowBlur = 0;
            });

            // Start Label
            tlCtx.fillStyle = "rgba(255, 255, 255, 0.2)";
            tlCtx.textAlign = "left";
            tlCtx.fillText("t=0", PAD_L - 10, midY + 30);

            // X-Axis Labels
            tlCtx.textAlign = "center";
            for (let i = 1; i <= 5; i++) {
                const tx = PAD_L + (i / 5) * drawW;
                tlCtx.fillText(`${(i / lambda).toFixed(1)}s`, tx, midY + 30);
                tlCtx.fillRect(tx, midY + 10, 1, 5);
            }
        }

        // PDF Draw
        const pdfCtx = pdfRef.current?.getContext("2d");
        if (pdfCtx) {
            pdfCtx.clearRect(0, 0, PDF_W, PDF_H);
            const m = { t: 20, r: 20, b: 30, l: 40 };
            const cw = PDF_W - m.l - m.r, ch = PDF_H - m.t - m.b;
            const xMax = 5 / lambda; // Show 5 means
            const yMax = lambda * 1.2;

            // Grid
            pdfCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            pdfCtx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const py = m.t + ch * (1 - i / 4);
                pdfCtx.beginPath(); pdfCtx.moveTo(m.l, py); pdfCtx.lineTo(m.l + cw, py); pdfCtx.stroke();
            }

            // Curve
            pdfCtx.beginPath();
            pdfCtx.strokeStyle = "#D4D4D4";
            pdfCtx.lineWidth = 3;
            for (let i = 0; i <= 100; i++) {
                const x = (i / 100) * xMax;
                const y = expPDF(x, lambda);
                const px = m.l + (x / xMax) * cw;
                const py = m.t + ch - (y / yMax) * ch;
                if (i === 0) { pdfCtx.moveTo(px, py); } else { pdfCtx.lineTo(px, py); }
            }
            pdfCtx.stroke();

            // Fill
            pdfCtx.lineTo(m.l + cw, m.t + ch);
            pdfCtx.lineTo(m.l, m.t + ch);
            const grad = pdfCtx.createLinearGradient(0, m.t, 0, m.t + ch);
            grad.addColorStop(0, "rgba(212, 212, 212, 0.2)");
            grad.addColorStop(1, "transparent");
            pdfCtx.fillStyle = grad;
            pdfCtx.fill();
        }

        // CDF Draw
        const cdfCtx = cdfRef.current?.getContext("2d");
        if (cdfCtx) {
            cdfCtx.clearRect(0, 0, PDF_W, PDF_H);
            const m = { t: 20, r: 20, b: 30, l: 40 };
            const cw = PDF_W - m.l - m.r, ch = PDF_H - m.t - m.b;
            const xMax = 5 / lambda;

            // Grid
            cdfCtx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            for (let i = 0; i <= 4; i++) {
                const py = m.t + ch * (1 - i / 4);
                cdfCtx.beginPath(); cdfCtx.moveTo(m.l, py); cdfCtx.lineTo(m.l + cw, py); cdfCtx.stroke();
            }

            // Curve
            cdfCtx.beginPath();
            cdfCtx.strokeStyle = "#3B82F6";
            cdfCtx.lineWidth = 3;
            for (let i = 0; i <= 100; i++) {
                const x = (i / 100) * xMax;
                const y = expCDF(x, lambda);
                const px = m.l + (x / xMax) * cw;
                const py = m.t + ch - y * ch;
                if (i === 0) { cdfCtx.moveTo(px, py); } else { cdfCtx.lineTo(px, py); }
            }
            cdfCtx.stroke();
        }

        requestRef.current = requestAnimationFrame(draw);
    }, [lambda, events]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(draw);
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [draw]);

    // Stats
    const stats = useMemo(() => ({
        mean: 1 / lambda,
        std: 1 / lambda,
        median: Math.log(2) / lambda,
        probWaited: Math.exp(-lambda * waitedTime)
    }), [lambda, waitedTime]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">hourglass_empty</span>
                            Exponential Distribution
                        </h3>
                        <p className="text-xs text-muted/60 max-w-lg">
                            Modeling the <strong>waiting time</strong> until the next event in a Poisson process.
                        </p>
                    </div>
                    {/* Aha Intuition Block */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4">
                        <span className="text-2xl mt-1">🌧</span>
                        <div className="text-[11px] leading-relaxed">
                            <strong className="text-primary block mb-1 uppercase tracking-tighter">The "Gap" Logic</strong>
                            If Poisson says 3 raindrops hit per minute, the Exponential says the average <strong>gap</strong> between drops is 1/3 of a minute.
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-black/40 border border-border/60 rounded-xl px-5 py-3 flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-[9px] uppercase font-bold text-muted/50 tracking-widest mb-1">Rate (λ)</span>
                        <span className="text-3xl font-black text-primary">{lambda.toFixed(1)}</span>
                    </div>
                    <div className="bg-black/40 border border-border/60 rounded-xl px-5 py-3 flex flex-col items-center justify-center min-w-[120px]">
                        <span className="text-[9px] uppercase font-bold text-muted/50 tracking-widest mb-1">Mean Wait</span>
                        <span className="text-3xl font-black text-blue-400">{(1 / lambda).toFixed(2)}s</span>
                    </div>
                </div>
            </div>

            {/* Timeline Pane */}
            <div className="bg-black/60 border border-border rounded-xl overflow-hidden shadow-2xl relative group">
                <div className="absolute top-3 left-4 flex gap-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest z-10">
                    <span>Inter-arrival Simulation</span>
                    <span className="text-primary italic">Modeled Gaps between events</span>
                </div>
                <canvas ref={timelineRef} width={TW} height={TH} className="w-full h-auto" />
                <button
                    onClick={generateEvents}
                    className="absolute bottom-3 right-4 p-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 rounded-full text-primary transition-all group-hover:scale-110"
                >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>

            {/* Chart Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface2/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-black text-muted uppercase tracking-tighter border-b border-border/40 pb-2">PDF: f(x) = λe^(−λx)</div>
                        <canvas ref={pdfRef} width={PDF_W} height={PDF_H} className="w-full h-auto" />
                    </div>
                    <div className="bg-surface2/40 border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-black text-muted uppercase tracking-tighter border-b border-border/40 pb-2">CDF: F(x) = 1 − e^(−λx)</div>
                        <canvas ref={cdfRef} width={PDF_W} height={PDF_H} className="w-full h-auto" />
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    {/* Controls */}
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-6">
                        <div className="space-y-4">
                            <div className="text-[10px] font-black text-muted uppercase tracking-widest">Adjust Rate (λ)</div>
                            <input
                                type="range" min="0.2" max="4.0" step="0.1"
                                value={lambda} onChange={e => setLambda(+e.target.value)}
                                className="w-full h-1.5 bg-border rounded-full appearance-none accent-primary cursor-pointer"
                            />
                            <div className="flex justify-between text-[9px] font-bold text-muted/40">
                                <span>SLOW (0.2)</span>
                                <span>FAST (4.0)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface2 p-3 rounded-lg border border-border/40">
                                <span className="text-[9px] font-bold text-muted uppercase block mb-1 opacity-60">Median</span>
                                <span className="text-base font-black text-foreground">{stats.median.toFixed(3)}s</span>
                            </div>
                            <div className="bg-surface2 p-3 rounded-lg border border-border/40">
                                <span className="text-[9px] font-bold text-muted uppercase block mb-1 opacity-60">Std Dev</span>
                                <span className="text-base font-black text-foreground">{stats.std.toFixed(3)}s</span>
                            </div>
                        </div>
                    </div>

                    {/* Memoryless Property Demo */}
                    <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-5 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="material-symbols-outlined text-4xl">memory</span>
                        </div>
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-blue-500/20 pb-2">Memoryless Property</div>
                        <div className="space-y-4">
                            <div className="text-[11px] text-muted leading-relaxed">
                                If you've already waited <span className="text-foreground font-bold">{waitedTime.toFixed(1)}s</span>, your remaining wait is still distributed exactly the same. The process has no "memory" of the past.
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="range" min="0" max="5.0" step="0.1"
                                    value={waitedTime} onChange={e => setWaitedTime(+e.target.value)}
                                    className="w-full h-1 bg-border rounded-full appearance-none accent-blue-500 cursor-pointer"
                                />
                                <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg">
                                    <span className="text-[10px] font-bold text-muted italic">P(T &gt; {waitedTime.toFixed(1)})</span>
                                    <span className="text-lg font-black text-blue-400">{(stats.probWaited * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

