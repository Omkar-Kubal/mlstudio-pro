"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const W = 540, H = 300;
const PAD = { top: 28, right: 24, bottom: 44, left: 54 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

// Generate two-class data
const CLASS0 = Array.from({ length: 22 }, () => ({ x: randNorm(2.5, 1.0), cls: 0 }));
const CLASS1 = Array.from({ length: 22 }, () => ({ x: randNorm(6.5, 1.0), cls: 1 }));
const DATA = [...CLASS0, ...CLASS1];

const X_MIN = -1, X_MAX = 10;
const Y_MIN = -0.05, Y_MAX = 1.1;

function toX(x: number) { return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * pH; }
function fromCanvasX(cx: number) { return X_MIN + ((cx - PAD.left) / pW) * (X_MAX - X_MIN); }

const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151", grid: "#111827" };

export default function LogisticRegressionPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [weight, setWeight] = useState(2.0);
    const [bias, setBias] = useState(-4.5);
    const [queryX, setQueryX] = useState(4.5);

    const boundary = -bias / weight;
    const queryProb = sigmoid(weight * queryX + bias);
    const predClass = queryProb >= 0.5 ? 1 : 0;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { draw(); }, [weight, bias, queryX]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = THEME.grid; ctx.lineWidth = 1;
        [0, 0.25, 0.5, 0.75, 1.0].forEach(v => {
            const y = toY(v);
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
            ctx.fillStyle = THEME.dim; ctx.font = "9px 'SF Mono',monospace"; ctx.textAlign = "right";
            ctx.fillText(v.toFixed(2), PAD.left - 6, y + 4);
        });

        // Class region shading
        const bx = toX(boundary);
        ctx.fillStyle = "#60a5fa0a";
        ctx.fillRect(bx, PAD.top, Math.max(0, PAD.left + pW - bx), pH);
        ctx.fillStyle = "#f472b80a";
        ctx.fillRect(PAD.left, PAD.top, Math.max(0, bx - PAD.left), pH);

        // 0.5 threshold line
        ctx.beginPath(); ctx.moveTo(PAD.left, toY(0.5)); ctx.lineTo(PAD.left + pW, toY(0.5));
        ctx.strokeStyle = "#ffffff22"; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#ffffff33"; ctx.font = "9px monospace"; ctx.textAlign = "left";
        ctx.fillText("threshold = 0.5", PAD.left + 4, toY(0.5) - 5);

        // Decision boundary vertical
        if (boundary >= X_MIN && boundary <= X_MAX) {
            ctx.beginPath(); ctx.moveTo(bx, PAD.top); ctx.lineTo(bx, PAD.top + pH);
            ctx.strokeStyle = "#ffffff55"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = "#fff"; ctx.font = "9px monospace"; ctx.textAlign = "center";
            ctx.fillText(`boundary = ${boundary.toFixed(2)}`, bx, PAD.top + 10);
        }

        // Sigmoid curve
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
            const x = X_MIN + (i / 200) * (X_MAX - X_MIN);
            const p = sigmoid(weight * x + bias);
            const cx = toX(x), cy = toY(p);
            if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 2.5;
        ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;

        // Data points (jittered on y=0 and y=1)
        DATA.forEach(d => {
            const cx = toX(d.x), cy = toY(d.cls === 0 ? -0.02 : 1.02);
            ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = d.cls === 0 ? "#f472b8" : "#60a5fa";
            ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1;
        });

        // Query point
        const qcx = toX(queryX), qcy = toY(queryProb);
        // Horizontal dashed to y-axis
        ctx.beginPath(); ctx.moveTo(PAD.left, qcy); ctx.lineTo(qcx, qcy);
        ctx.strokeStyle = "#fbbf2455"; ctx.lineWidth = 1; ctx.setLineDash([3, 2]); ctx.stroke();
        // Vertical dashed to x-axis
        ctx.beginPath(); ctx.moveTo(qcx, toY(0)); ctx.lineTo(qcx, qcy);
        ctx.stroke(); ctx.setLineDash([]);

        ctx.beginPath(); ctx.arc(qcx, qcy, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24"; ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();

        // Probability label
        const probColor = predClass === 1 ? "#60a5fa" : "#f472b8";
        ctx.fillStyle = probColor; ctx.font = "bold 11px monospace"; ctx.textAlign = qcx > W / 2 ? "right" : "left";
        const lx = qcx > W / 2 ? qcx - 14 : qcx + 14;
        ctx.fillText(`P(class=1) = ${queryProb.toFixed(3)}`, lx, qcy - 10);
        ctx.fillText(`→ Class ${predClass}`, lx, qcy + 4);

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("X (feature) →", PAD.left + pW / 2, H - 6);
        ctx.save(); ctx.translate(13, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText("P(class=1)", 0, 0); ctx.restore();
    }

    const handleMove = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const cx = (e.clientX - rect.left) * scaleX;
        if (cx >= PAD.left && cx <= PAD.left + pW) {
            setQueryX(+fromCanvasX(cx).toFixed(3));
        }
    }, []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · CLASSIFICATION · §57</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Logistic Regression</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Logistic regression squashes any number through the Sigmoid Gate — output always between 0 and 1."
                </p>
            </div>

            <div style={{ border: `1px solid #a78bfa44`, borderRadius: "8px", overflow: "hidden", cursor: "crosshair", background: THEME.surface, display: "flex", justifyContent: "center" }}
                onMouseMove={handleMove}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            <div style={{ marginTop: "8px", fontSize: "11px", color: "#fbbf24", textAlign: "center" }}>← MOVE MOUSE to query any X value →</div>

            <div style={{ display: "flex", gap: "16px", marginTop: "14px", flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ flex: "1 1 200px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "4px" }}>
                        <span>Weight (w)</span><span style={{ color: "#a78bfa" }}>{weight.toFixed(1)}</span>
                    </div>
                    <input type="range" min={0.3} max={5} step={0.1} value={weight}
                        onChange={e => setWeight(+e.target.value)}
                        style={{ width: "100%", accentColor: "#a78bfa", cursor: "pointer" }} />
                    <div style={{ fontSize: "9px", color: THEME.dim, marginTop: "2px" }}>Controls sigmoid steepness</div>
                </div>
                <div style={{ flex: "1 1 200px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "4px" }}>
                        <span>Bias (b)</span><span style={{ color: "#a78bfa" }}>{bias.toFixed(1)}</span>
                    </div>
                    <input type="range" min={-12} max={0} step={0.5} value={bias}
                        onChange={e => setBias(+e.target.value)}
                        style={{ width: "100%", accentColor: "#a78bfa", cursor: "pointer" }} />
                    <div style={{ fontSize: "9px", color: THEME.dim, marginTop: "2px" }}>Shifts boundary left/right</div>
                </div>
            </div>

            <div style={{ marginTop: "14px", display: "flex", gap: "12px", fontSize: "10px", justifyContent: "center" }}>
                {[
                    { color: "#f472b8", label: "Class 0 (negative)" },
                    { color: "#60a5fa", label: "Class 1 (positive)" },
                    { color: "#a78bfa", label: "Sigmoid curve" },
                    { color: "#fbbf24", label: "Query point" },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                        <span style={{ color: THEME.dim }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

