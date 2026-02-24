"use client";

import { useState, useEffect, useRef } from "react";

const W = 480, H = 280;
const PAD = { top: 28, right: 24, bottom: 44, left: 54 };
const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;
const X_MIN = -4, X_MAX = 4, Y_MIN = -1.5, Y_MAX = 1.5;

function toX(x: number) { return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * pH; }

interface ActivationFunction {
    key: string;
    label: string;
    color: string;
    fn: (x: number) => number;
    deriv: (x: number) => number;
    desc: string;
}

const FUNS: ActivationFunction[] = [
    { key: "relu", label: "ReLU", color: "#60a5fa", fn: x => Math.max(0, x), deriv: x => (x > 0 ? 1 : 0), desc: "max(0,x) — sparsity, fast, but dying neurons" },
    { key: "sigmoid", label: "Sigmoid", color: "#f472b8", fn: x => 1 / (1 + Math.exp(-x)), deriv: x => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s); }, desc: "1/(1+e⁻ˣ) — outputs probability, saturates at extremes" },
    { key: "tanh", label: "Tanh", color: "#fbbf24", fn: x => Math.tanh(x), deriv: x => 1 - Math.tanh(x) ** 2, desc: "tanh(x) — zero-centred, stronger gradients" },
    { key: "leaky", label: "Leaky ReLU", color: "#34d399", fn: x => (x > 0 ? x : 0.1 * x), deriv: x => (x > 0 ? 1 : 0.1), desc: "max(0.1x,x) — prevents dying neurons" },
    { key: "gelu", label: "GELU", color: "#a78bfa", fn: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))), deriv: x => { const c = Math.sqrt(2 / Math.PI); const t = Math.tanh(c * (x + 0.044715 * x ** 3)); return 0.5 * (1 + t) + 0.5 * x * (1 - t ** 2) * c * (1 + 3 * 0.044715 * x ** 2); }, desc: "Smooth ReLU — used in Transformers (GPT/BERT)." },
];

const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151", grid: "#111827" };

export default function ActivationFunctionPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [active, setActive] = useState(new Set(["relu", "sigmoid", "tanh"]));
    const [showDeriv, setShowDeriv] = useState(false);
    const [queryX, setQueryX] = useState(1.5);

    const toggle = (key: string) => setActive(prev => {
        const n = new Set(prev);
        if (n.has(key)) n.delete(key);
        else n.add(key);
        return n;
    });

    useEffect(() => { draw(); }, [active, showDeriv, queryX]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = THEME.grid; ctx.lineWidth = 1;
        [-1, 0, 1].forEach(v => {
            const y = toY(v);
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
            ctx.fillStyle = THEME.dim; ctx.font = "9px monospace"; ctx.textAlign = "right";
            ctx.fillText(v.toString(), PAD.left - 4, y + 4);
        });
        [-4, -2, 0, 2, 4].forEach(v => {
            const x = toX(v);
            ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + pH); ctx.stroke();
            ctx.fillStyle = THEME.dim; ctx.font = "9px monospace"; ctx.textAlign = "center";
            ctx.fillText(v.toString(), x, PAD.top + pH + 14);
        });

        // Zero axes
        ctx.beginPath(); ctx.moveTo(toX(0), PAD.top); ctx.lineTo(toX(0), PAD.top + pH);
        ctx.strokeStyle = "#ffffff22"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(PAD.left, toY(0)); ctx.lineTo(PAD.left + pW, toY(0));
        ctx.stroke();

        // Draw each function
        FUNS.filter(f => active.has(f.key)).forEach(f => {
            // Main function
            ctx.beginPath();
            let started = false;
            for (let i = 0; i <= 200; i++) {
                const x = X_MIN + (i / 200) * (X_MAX - X_MIN);
                const y = f.fn(x);
                const cx = toX(x), cy = toY(y);
                if (cy < PAD.top - 5 || cy > PAD.top + pH + 5) { started = false; continue; }
                if (!started) { ctx.moveTo(cx, cy); started = true; } else ctx.lineTo(cx, cy);
            }
            ctx.strokeStyle = f.color; ctx.lineWidth = 2.5;
            ctx.shadowColor = f.color; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;

            // Derivative (dashed)
            if (showDeriv) {
                ctx.beginPath(); started = false;
                for (let i = 0; i <= 200; i++) {
                    const x = X_MIN + (i / 200) * (X_MAX - X_MIN);
                    const y = f.deriv(x);
                    const cx = toX(x), cy = toY(y);
                    if (cy < PAD.top - 5 || cy > PAD.top + pH + 5) { started = false; continue; }
                    if (!started) { ctx.moveTo(cx, cy); started = true; } else ctx.lineTo(cx, cy);
                }
                ctx.strokeStyle = f.color + "88"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
            }
        });

        // Query line
        const qx = toX(queryX);
        ctx.beginPath(); ctx.moveTo(qx, PAD.top); ctx.lineTo(qx, PAD.top + pH);
        ctx.strokeStyle = "#fbbf2444"; ctx.lineWidth = 1; ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#fbbf24"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText(`x=${queryX.toFixed(1)}`, qx, PAD.top + 8);

        // Query dots
        FUNS.filter(f => active.has(f.key)).forEach(f => {
            const y = f.fn(queryX);
            if (y < Y_MIN || y > Y_MAX) return;
            const cy = toY(y);
            ctx.beginPath(); ctx.arc(qx, cy, 5, 0, Math.PI * 2);
            ctx.fillStyle = f.color; ctx.shadowColor = f.color; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
        });

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("x \u2192", PAD.left + pW / 2, H - 6);
        ctx.save(); ctx.translate(13, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText("f(x)", 0, 0); ctx.restore();
    }

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · DEEP LEARNING · §71</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Activation Functions</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Without activations, deep networks collapse to a single linear layer. Non-linearity is what gives depth meaning."
                </p>
            </div>

            <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                {FUNS.map(f => (
                    <button key={f.key} onClick={() => toggle(f.key)}
                        style={{ padding: "5px 12px", border: `2px solid ${active.has(f.key) ? f.color : THEME.border}`, borderRadius: "4px", background: active.has(f.key) ? f.color + "22" : "transparent", color: active.has(f.key) ? f.color : THEME.dim, fontSize: "11px", fontFamily: "inherit", cursor: "pointer", fontWeight: active.has(f.key) ? 700 : 400, transition: "all 0.2s" }}>
                        {f.label}
                    </button>
                ))}
                <button onClick={() => setShowDeriv(s => !s)}
                    style={{ padding: "5px 12px", border: `2px solid ${showDeriv ? "#ffffff55" : THEME.border}`, borderRadius: "4px", background: showDeriv ? "#ffffff11" : "transparent", color: showDeriv ? "#fff" : THEME.dim, fontSize: "11px", fontFamily: "inherit", cursor: "pointer" }}>
                    {showDeriv ? "Hide f'(x)" : "Show f'(x)"}
                </button>
            </div>

            <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "10px", background: THEME.surface }}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", margin: "0 auto" }} />
            </div>

            <div style={{ width: "100%", maxWidth: 440, margin: "0 auto 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "4px" }}>
                    <span>Query x</span><span style={{ color: "#fbbf24" }}>{queryX.toFixed(2)}</span>
                </div>
                <input type="range" min={X_MIN} max={X_MAX} step={0.05} value={queryX}
                    onChange={e => setQueryX(+e.target.value)}
                    style={{ width: "100%", accentColor: "#fbbf24", cursor: "pointer" }} />
            </div>

            {/* Value table */}
            <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden", maxWidth: 480, width: "100%", margin: "0 auto 14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${showDeriv ? 4 : 3}, 1fr)`, background: THEME.border }}>
                    {["Function", "f(x)", "Range", showDeriv ? "f'(x)" : null].filter(Boolean).map(h => (
                        <div key={h!} style={{ padding: "6px 10px", fontSize: "9px", color: THEME.dim, letterSpacing: "1px", textAlign: "center" }}>{h}</div>
                    ))}
                </div>
                {FUNS.filter(f => active.has(f.key)).map(f => {
                    const y = f.fn(queryX), dy = f.deriv(queryX);
                    return (
                        <div key={f.key} style={{ display: "grid", gridTemplateColumns: `repeat(${showDeriv ? 4 : 3}, 1fr)`, borderTop: `1px solid ${THEME.border}` }}>
                            <div style={{ padding: "7px 10px", fontSize: "10px", color: f.color, fontWeight: 700 }}>{f.label}</div>
                            <div style={{ padding: "7px 10px", fontSize: "11px", color: f.color, textAlign: "center", fontWeight: 700 }}>{y.toFixed(4)}</div>
                            <div style={{ padding: "7px 10px", fontSize: "9px", color: THEME.dim, textAlign: "center" }}>{f.key === "relu" ? "[0,\u221E)" : f.key === "sigmoid" ? "(0,1)" : f.key === "tanh" ? "(-1,1)" : "(-\u221E,\u221E)"}</div>
                            {showDeriv && <div style={{ padding: "7px 10px", fontSize: "11px", color: f.color + "aa", textAlign: "center" }}>{dy.toFixed(4)}</div>}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxWidth: 480, width: "100%", margin: "0 auto" }}>
                {[
                    { label: "Vanishing gradient", color: "#f87171", desc: "Sigmoid/Tanh saturate \u2192 tiny gradients \u2192 no learning" },
                    { label: "Dying ReLU", color: "#fbbf24", desc: "ReLU outputs 0 for x<0 \u2192 some neurons never activate" },
                    { label: "Zero-centred", color: "#34d399", desc: "Tanh is zero-centred \u2192 faster convergence than sigmoid" },
                    { label: "Modern default", color: "#a78bfa", desc: "GELU used in Transformers; ReLU still dominates CNNs" },
                ].map(({ label, color, desc }) => (
                    <div key={label} style={{ border: `1px solid ${color}33`, borderRadius: "6px", padding: "8px 10px", background: color + "08" }}>
                        <div style={{ fontSize: "10px", color, fontWeight: 700, marginBottom: "3px" }}>{label}</div>
                        <div style={{ fontSize: "9px", color: THEME.dim, lineHeight: 1.6 }}>{desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

