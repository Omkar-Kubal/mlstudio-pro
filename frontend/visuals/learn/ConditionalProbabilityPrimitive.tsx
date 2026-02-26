"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";

// ─── Types & Constants ──────────────────────────────────────────────────────
type ScenarioKey = 'disease' | 'spam' | 'rain' | 'custom';

interface Scenario {
    label: [string, string, string];
    priorLabel: string;
    evidenceLabel: string;
    toggleLabel: string;
    leg: [string, string, string];
    defaults: [number, number, number];
    aName: string;
    bName: string;
}

const SCENARIOS: Record<ScenarioKey, Scenario> = {
    disease: {
        label: ['P(A) — prevalence', 'P(B|A) — sensitivity', 'P(B|¬A) — false positive rate'],
        priorLabel: 'Prior — P(Has Disease)',
        evidenceLabel: 'Evidence — P(Positive | Disease)',
        toggleLabel: 'Apply Evidence (received a positive test)',
        leg: ['Has disease', 'False Positive', 'True Positive (A ∩ B)'],
        defaults: [1, 95, 5],
        aName: 'Disease', bName: 'Positive test'
    },
    spam: {
        label: ['P(A) — base spam rate', 'P(B|A) — word in spam', 'P(B|¬A) — word in ham'],
        priorLabel: 'Prior — P(Email is Spam)',
        evidenceLabel: 'Evidence — P(Contains "Offer" | Spam)',
        toggleLabel: 'Apply Evidence (email contains "Offer")',
        leg: ['Is spam', 'Ham with word', 'Spam + "Offer"'],
        defaults: [30, 80, 10],
        aName: 'Spam', bName: 'Contains "Offer"'
    },
    rain: {
        label: ['P(A) — base rain chance', 'P(B|A) — cloudy given rain', 'P(B|¬A) — cloudy without rain'],
        priorLabel: 'Prior — P(Rain today)',
        evidenceLabel: 'Evidence — P(Cloudy | Rain)',
        toggleLabel: 'Apply Evidence (it\'s cloudy outside)',
        leg: ['Rain', 'Cloudy (no rain)', 'Rain + Clouds'],
        defaults: [20, 90, 30],
        aName: 'Rain', bName: 'Cloudy sky'
    },
    custom: {
        label: ['P(A) — prior probability', 'P(B|A) — likelihood', 'P(B|¬A) — false positive rate'],
        priorLabel: 'Prior — P(A)',
        evidenceLabel: 'Evidence — P(B | A)',
        toggleLabel: 'Apply Evidence (B observed)',
        leg: ['Event A', 'Event B only', 'Both A and B'],
        defaults: [25, 70, 20],
        aName: 'A', bName: 'B'
    }
};

const WAFFLE_SIZE = 400; // 20x20

// ─── Component ──────────────────────────────────────────────────────────────
export default function ConditionalProbabilityPrimitive() {
    const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('disease');
    const [pA, setPA] = useState(0.01);
    const [pBgA, setPBgA] = useState(0.95);
    const [pBgNA, setPBgNA] = useState(0.05);
    const [evidenceOn, setEvidenceOn] = useState(false);
    const vennCanvasRef = useRef<HTMLCanvasElement>(null);

    const scenario = SCENARIOS[scenarioKey];

    // Derived Values
    const stats = useMemo(() => {
        const pNotA = 1 - pA;
        const pB = pA * pBgA + pNotA * pBgNA;
        const pAB = pA * pBgA; // joint P(A∩B)
        const pAgB = pB > 0 ? pAB / pB : 0; // posterior
        const pNotAB = pNotA * pBgNA; // false positives
        const beliefRatio = pA > 0 ? pAgB / pA : 1;

        return { pA, pNotA, pB, pAB, pNotAB, pAgB, beliefRatio };
    }, [pA, pBgA, pBgNA]);

    const switchScenario = (key: ScenarioKey) => {
        setScenarioKey(key);
        const s = SCENARIOS[key];
        setPA(s.defaults[0] / 100);
        setPBgA(s.defaults[1] / 100);
        setPBgNA(s.defaults[2] / 100);
        setEvidenceOn(false);
    };

    // ─── Drawing Venn ─────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = vennCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, 220, 180);
        const cx = 110, cy = 90;
        const totalR = 75;

        const rA = Math.max(10, totalR * Math.sqrt(stats.pA));
        const rB = Math.max(10, totalR * Math.sqrt(stats.pB));

        // Calculate distance based on overlap
        const pMax = Math.max(stats.pA, stats.pB);
        const overlapFactor = stats.pAB / (pMax || 1);
        const centerDist = (rA + rB) * (1 - Math.min(0.9, overlapFactor * 1.1));

        const aX = cx - centerDist * 0.45;
        const bX = cx + centerDist * 0.45;

        // Draw A
        ctx.globalAlpha = evidenceOn ? 0.2 : 0.6;
        ctx.fillStyle = "hsl(var(--primary))";
        ctx.beginPath(); ctx.arc(aX, cy, rA, 0, Math.PI * 2); ctx.fill();

        // Draw B
        ctx.globalAlpha = evidenceOn ? 0.8 : 0.4;
        ctx.fillStyle = "hsl(var(--secondary))";
        ctx.beginPath(); ctx.arc(bX, cy, rB, 0, Math.PI * 2); ctx.fill();

        // Intersection
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.beginPath(); ctx.arc(aX, cy, rA, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = "hsl(var(--accent))";
        ctx.beginPath(); ctx.arc(bX, cy, rB, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Labels
        ctx.font = "bold 10px var(--font-jetbrains)";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(scenario.aName, aX - rA * 0.2, cy + 4);
        ctx.fillText(scenario.bName, bX + rB * 0.2, cy + 4);

    }, [stats, evidenceOn, scenario]);

    return (
        <div className="bg-surface/50 border border-border rounded-lg p-6 space-y-6">
            {/* Header/Scenario Strip */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(SCENARIOS) as ScenarioKey[]).map(k => (
                        <button
                            key={k}
                            onClick={() => switchScenario(k)}
                            className={`px-4 py-2 rounded border text-[10px] font-bold uppercase tracking-widest transition-all ${scenarioKey === k ? "bg-primary/20 border-primary text-primary" : "bg-surface border-border text-muted hover:border-muted"
                                }`}
                        >
                            {k === 'disease' ? "🧪 Disease" : k === 'spam' ? "📧 Spam" : k === 'rain' ? "🌧 Rain" : "✏️ Custom"}
                        </button>
                    ))}
                </div>
                <p className="text-[11px] text-muted italic leading-relaxed border-l-2 border-primary pl-4 max-w-2xl">
                    "New evidence doesn't create a new truth — it <span className="text-primary font-bold">carves away</span> the impossible. Observe how observing Event B restricts the sample space."
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visualizers (Left) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface/80 border border-border rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-bold text-muted uppercase tracking-widest">
                            <span>Population Map (N=400)</span>
                            <span className={evidenceOn ? "text-primary italic animate-pulse" : ""}>
                                {evidenceOn ? `Restricted to ${scenario.bName} sample space` : "Prior Distribution"}
                            </span>
                        </div>

                        <div className="grid grid-cols-20 gap-1 aspect-[20/10]">
                            {Array.from({ length: WAFFLE_SIZE }).map((_, i) => {
                                const nA = Math.round(stats.pA * WAFFLE_SIZE);
                                const nAB = Math.round(stats.pAB * WAFFLE_SIZE);
                                const nBnotA = Math.round(stats.pNotAB * WAFFLE_SIZE);

                                let type: 'joint' | 'prior' | 'evidence' | 'none';
                                if (i < nAB) type = 'joint';
                                else if (i < nA) type = 'prior';
                                else if (i < nA + nBnotA) type = 'evidence';
                                else type = 'none';

                                let color = "rgba(255, 255, 255, 0.05)";
                                let opacity = 1;

                                if (evidenceOn) {
                                    if (type === 'joint') color = "hsl(var(--accent))";
                                    else if (type === 'evidence') color = "hsl(var(--secondary))";
                                    else opacity = 0.1;
                                } else {
                                    if (type === 'joint') color = "hsl(var(--accent))";
                                    else if (type === 'prior') color = "hsl(var(--primary))";
                                    else if (type === 'evidence') color = "hsl(var(--secondary))";
                                }

                                return (
                                    <div key={i} className="rounded-[1px] transition-all duration-500" style={{ backgroundColor: color, opacity }} />
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2 border-t border-border/40">
                            {[
                                { color: "bg-primary", label: scenario.leg[0] },
                                { color: "bg-secondary", label: scenario.leg[1] },
                                { color: "bg-accent", label: scenario.leg[2] },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                                    <span className="text-[9px] text-muted font-medium uppercase tracking-tighter">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-surface/80 border border-border rounded-xl p-5 flex items-center justify-center min-h-[200px]">
                            <canvas ref={vennCanvasRef} width={220} height={180} />
                        </div>
                        <div className="bg-surface/80 border border-border rounded-xl p-5 space-y-4">
                            <div className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border pb-2">Probabilities</div>
                            <div className="space-y-4">
                                {[
                                    { label: `Prior P(${scenario.aName})`, val: `${(stats.pA * 100).toFixed(1)}%`, color: "text-primary" },
                                    { label: `Evidence P(${scenario.bName})`, val: `${(stats.pB * 100).toFixed(1)}%`, color: "text-secondary" },
                                    { label: `Joint P(${scenario.aName}∩B)`, val: `${(stats.pAB * 100).toFixed(2)}%`, color: "text-accent" },
                                    { label: `Posterior P(${scenario.aName}|B)`, val: `${(stats.pAgB * 100).toFixed(1)}%`, color: "text-primary font-bold shadow-primary" },
                                ].map(p => (
                                    <div key={p.label} className="flex justify-between items-baseline">
                                        <span className="text-[10px] text-muted uppercase font-medium">{p.label}</span>
                                        <span className={`text-lg font-mono tracking-tighter ${p.color}`}>{p.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls (Right) */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-surface border border-border rounded-xl p-5 space-y-6 shadow-xl">
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="text-[10px] font-bold text-muted uppercase tracking-widest">{scenario.priorLabel}</div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-medium">
                                        <span className="text-muted/60 lowercase italic">Prevalence</span>
                                        <span className="text-primary">{(pA * 100).toFixed(1)}%</span>
                                    </div>
                                    <input
                                        type="range" min="0.5" max="50" step="0.5"
                                        value={pA * 100}
                                        onChange={e => setPA(+e.target.value / 100)}
                                        className="w-full h-1 bg-border rounded-full appearance-none accent-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-border/40">
                                <div className="text-[10px] font-bold text-muted uppercase tracking-widest">{scenario.evidenceLabel}</div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-medium">
                                            <span className="text-muted/60 lowercase italic">Sensitivity</span>
                                            <span className="text-secondary">{(pBgA * 100).toFixed(0)}%</span>
                                        </div>
                                        <input
                                            type="range" min="10" max="99" step="1"
                                            value={pBgA * 100}
                                            onChange={e => setPBgA(+e.target.value / 100)}
                                            className="w-full h-1 bg-border rounded-full appearance-none accent-secondary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[11px] font-medium">
                                            <span className="text-muted/60 lowercase italic">False Positive Rate</span>
                                            <span className="text-secondary">{(pBgNA * 100).toFixed(0)}%</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="50" step="1"
                                            value={pBgNA * 100}
                                            onChange={e => setPBgNA(+e.target.value / 100)}
                                            className="w-full h-1 bg-border rounded-full appearance-none accent-secondary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setEvidenceOn(!evidenceOn)}
                            className={`w-full py-4 rounded-lg border font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 ${evidenceOn ? "bg-primary/20 border-primary text-primary" : "bg-surface border-border text-muted hover:border-muted"
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">{evidenceOn ? "visibility_off" : "visibility"}</span>
                            {evidenceOn ? "Evidence Applied" : "Reveal Evidence"}
                        </button>
                    </div>

                    <div className="bg-surface/80 border border-border rounded-xl p-5 space-y-4">
                        <div className="text-[10px] font-bold text-muted uppercase tracking-widest border-b border-border pb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">calculate</span>
                            Bayesian Update
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] text-muted/60 uppercase font-bold tracking-tight">
                                <span>Prior Belief</span>
                                <span>Posterior</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-mono text-primary font-bold">{(stats.pA * 100).toFixed(1)}%</span>
                                <div className="flex-1 space-y-1">
                                    <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ width: `${Math.min(100, (evidenceOn ? stats.pAgB : stats.pA) * 100 * 2)}%` }}
                                            className="h-full bg-gradient-to-r from-primary to-primary"
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <span className="material-symbols-outlined text-muted text-xs">arrow_forward</span>
                                    </div>
                                </div>
                                <span className={`text-xl font-mono font-bold transition-all duration-500 ${evidenceOn ? "text-primary scale-110" : "text-muted"}`}>
                                    {(stats.pAgB * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="text-center">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-black/40 ${stats.beliefRatio >= 1 ? "text-primary" : "text-rose-400"}`}>
                                    {stats.beliefRatio.toFixed(1)}× Signal boost
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-sm">tips_and_updates</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Aha! Insight</span>
                        </div>
                        <p className="text-[10px] text-muted leading-relaxed">
                            {stats.pA < 0.05 && stats.pAgB > 0.3 ? (
                                "Notice the Base-Rate Neglect: Even with high sensitivity, a rare prior means most positives are false alarms."
                            ) : stats.beliefRatio > 5 ? (
                                "Powerful Signal: The evidence has drastically reduced the sample space, making the posterior far more certain."
                            ) : (
                                "Weak Signal: The false positive rate is high relative to the prior, resulting in a modest belief update."
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

