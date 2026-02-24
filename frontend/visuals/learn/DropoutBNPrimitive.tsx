"use client";

import { useState, useEffect, useRef } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    active: "#60a5fa", dropped: "#f87171", bn: "#34d399", norm: "#a78bfa",
};

const N_NEURONS = 12;

function randNorm(m = 0, s = 1) { let u = 0; while (!u) u = Math.random(); return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); }

function makeBatch() {
    return Array.from({ length: 8 }, () => Array.from({ length: N_NEURONS }, () => Math.abs(randNorm(1.5, 2.5))));
}

export default function DropoutBNPrimitive() {
    const [mode, setMode] = useState("dropout");
    const [rate, setRate] = useState(0.4);
    const [mask, setMask] = useState(() => Array(N_NEURONS).fill(true));
    const [batch, setBatch] = useState(() => makeBatch());
    const [training, setTraining] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const activeMask = mask.map(m_val => training ? m_val : true);

    const regen = () => {
        setMask(Array.from({ length: N_NEURONS }, () => Math.random() > rate));
        setBatch(makeBatch());
    };

    useEffect(() => { regen(); }, [rate]);
    useEffect(() => { draw(); }, [activeMask, batch, mode]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const CW = canvas.width, CH = canvas.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, CW, CH); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, CW, CH);

        if (mode === "dropout") {
            // Input layer
            const R = 18, xGap = CW / (N_NEURONS + 1);
            const yIn = 50, yOut = CH - 50;

            // Connections + output neurons
            for (let i = 0; i < N_NEURONS; i++) {
                const x = xGap * (i + 1);
                const alive = activeMask[i];
                // Connections (to a subset of 8 logic neurons)
                for (let j = 0; j < 8; j++) {
                    const ox = xGap * (j + 2.5);
                    ctx.beginPath(); ctx.moveTo(x, yIn + R); ctx.lineTo(ox, yOut - R);
                    ctx.strokeStyle = alive ? THEME.active + "28" : THEME.dropped + "15";
                    ctx.lineWidth = alive ? 1 : 0.4; ctx.stroke();
                }
                // Neuron with dropout
                ctx.beginPath(); ctx.arc(x, yIn, R, 0, Math.PI * 2);
                ctx.fillStyle = alive ? THEME.active + "44" : THEME.dropped + "22";
                ctx.strokeStyle = alive ? THEME.active : THEME.dropped;
                ctx.lineWidth = alive ? 2 : 1;
                if (alive) { ctx.shadowColor = THEME.active; ctx.shadowBlur = 8; }
                ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
                if (!alive) {
                    ctx.strokeStyle = THEME.dropped; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(x - 8, yIn - 8); ctx.lineTo(x + 8, yIn + 8);
                    ctx.moveTo(x + 8, yIn - 8); ctx.lineTo(x - 8, yIn + 8); ctx.stroke();
                }
            }

            // Output neurons
            for (let j = 0; j < 8; j++) {
                const ox = xGap * (j + 2.5);
                ctx.beginPath(); ctx.arc(ox, yOut, R, 0, Math.PI * 2);
                ctx.fillStyle = THEME.active + "22"; ctx.strokeStyle = THEME.active + "66"; ctx.lineWidth = 1.5;
                ctx.fill(); ctx.stroke();
            }

            const scale = 1 / (1 - rate);
            ctx.fillStyle = THEME.active; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
            ctx.fillText(`${activeMask.filter(Boolean).length}/${N_NEURONS} neurons active`, CW / 2, CH / 2);
            ctx.fillStyle = THEME.dim; ctx.font = "9px monospace";
            ctx.fillText(`(scaling at inference = 1/p = ${scale.toFixed(2)}\u00D7)`, CW / 2, CH / 2 + 15);

        } else {
            // Batch norm
            const PAD = { t: 30, b: 30, l: 40, r: 20 };
            const bW = CW - PAD.l - PAD.r, bH = (CH - PAD.t - PAD.b) / 2 - 8;

            const drawHist = (data: number[], y0: number, color: string, label: string, normalized = false) => {
                const bins = 16, min = normalized ? -3 : 0, max = normalized ? 3 : 5;
                const counts = Array(bins).fill(0);
                data.forEach(v => {
                    const b = Math.min(bins - 1, Math.max(0, Math.floor((v - min) / (max - min) * bins)));
                    counts[b]++;
                });
                const maxC = Math.max(...counts, 1);
                const bWidth = bW / bins;
                counts.forEach((c, i) => {
                    const h = (c / maxC) * bH;
                    ctx.fillStyle = color + (normalized ? "88" : "66");
                    ctx.fillRect(PAD.l + i * bWidth, y0 + bH - h, bWidth - 1, h);
                });
                // Mean line
                const mean = data.reduce((s, v) => s + v, 0) / data.length;
                const mx = PAD.l + Math.min(1, Math.max(0, (mean - min) / (max - min))) * bW;
                ctx.beginPath(); ctx.moveTo(mx, y0); ctx.lineTo(mx, y0 + bH);
                ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([4, 2]); ctx.stroke(); ctx.setLineDash([]);

                ctx.fillStyle = color; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
                ctx.fillText(`\u03BC=${mean.toFixed(2)}`, mx, y0 - 4);
                ctx.fillStyle = THEME.dim; ctx.font = "9px monospace"; ctx.textAlign = "left";
                ctx.fillText(label, PAD.l, y0 - 4);
            };

            const rawData = batch.flat();
            const mean = rawData.reduce((s, v) => s + v, 0) / rawData.length;
            const std = Math.sqrt(rawData.reduce((s, v) => s + (v - mean) ** 2, 0) / rawData.length) + 0.001;
            const normData = rawData.map(v => (v - mean) / std);

            drawHist(rawData, PAD.t, THEME.bn, "Raw Activations", false);
            drawHist(normData, PAD.t + bH + 20, THEME.norm, "After Batch Norm (\u03BC=0, \u03C3=1)", true);
        }
    }

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · DEEP LEARNING · §77</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Regularization Techniques</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Dropout prevents co-adaptation; Batch Norm stabilizes the data distribution."
                </p>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "14px", justifyContent: "center" }}>
                {[{ key: "dropout", label: "Dropout", color: THEME.active }, { key: "batchnorm", label: "Batch Norm", color: THEME.bn }].map(m => (
                    <button key={m.key} onClick={() => setMode(m.key)}
                        style={{ padding: "6px 18px", border: `1.5px solid ${mode === m.key ? m.color : THEME.border}`, borderRadius: "4px", background: mode === m.key ? m.color + "22" : "transparent", color: mode === m.key ? m.color : THEME.dim, fontSize: "11px", fontFamily: "inherit", cursor: "pointer", fontWeight: 700 }}>
                        {m.label}
                    </button>
                ))}
            </div>

            <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "14px", background: THEME.surface }}>
                <canvas ref={canvasRef} width={480} height={240} style={{ display: "block", margin: "0 auto" }} />
            </div>

            {mode === "dropout" ? (
                <div style={{ width: "100%", maxWidth: 440, margin: "0 auto 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "6px" }}>
                        <span>Dropout rate (p)</span>
                        <span style={{ color: THEME.dropped }}>{(rate * 100).toFixed(0)}% dropped</span>
                    </div>
                    <input type="range" min={0} max={0.8} step={0.05} value={rate}
                        onChange={e => setRate(+e.target.value)}
                        style={{ width: "100%", accentColor: THEME.dropped, cursor: "pointer" }} />
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: THEME.dim, marginTop: "10px", cursor: "pointer", justifyContent: "center" }}>
                        <input type="checkbox" checked={training} onChange={e => setTraining(e.target.checked)} style={{ accentColor: THEME.active }} />
                        Training mode (active dropout)
                    </label>
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                    <button onClick={regen}
                        style={{ padding: "8px 22px", border: "none", borderRadius: "4px", background: THEME.bn, color: "#000", fontSize: "12px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer", letterSpacing: "1px" }}>
                        \u21BA NEW BATCH SAMPLE
                    </button>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", margin: "0 auto" }}>
                {[
                    { label: "Dropout", color: THEME.dropped, pts: ["Prevents neuron co-adaptation", "Forces distributed representations", "Acts as an ensemble mechanism", "Used only during training"] },
                    { label: "Batch Norm", color: THEME.bn, pts: ["Normalises per mini-batch", "Accelerates convergence", "Reduces sensitivity to init", "Adds slight regularisation effect"] },
                ].map(({ label, color, pts }) => (
                    <div key={label} style={{ border: `1px solid ${color}33`, borderRadius: "6px", padding: "10px", background: color + "08" }}>
                        <div style={{ fontSize: "10px", color, fontWeight: 700, marginBottom: "5px" }}>{label}</div>
                        {pts.map(p => <div key={p} style={{ fontSize: "9px", color: THEME.dim, marginBottom: "2px" }}>\u2022 {p}</div>)}
                    </div>
                ))}
            </div>
        </div>
    );
}

