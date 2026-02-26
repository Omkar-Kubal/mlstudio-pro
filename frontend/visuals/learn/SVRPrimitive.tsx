"use client";

import { useState, useEffect, useRef } from "react";

const W = 540, H = 300;
const PAD = { top: 28, right: 24, bottom: 44, left: 54 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

const trueF = (x: number) => 1.2 * x + 2 + Math.sin(x * 0.8) * 0.8;
const DATA = Array.from({ length: 28 }, (_, i) => {
    const x = 0.5 + i * 0.33;
    return { x: +x.toFixed(3), y: +(trueF(x) + randNorm(0, 0.9)).toFixed(3) };
});

// Simple linear SVR fit (for demo: use OLS line)
function olsLine(data: typeof DATA) {
    const n = data.length;
    const mx = data.reduce((s, d) => s + d.x, 0) / n;
    const my = data.reduce((s, d) => s + d.y, 0) / n;
    const m = data.reduce((s, d) => s + (d.x - mx) * (d.y - my), 0) /
        data.reduce((s, d) => s + (d.x - mx) ** 2, 0);
    return { m, b: my - m * mx };
}

const { m, b } = olsLine(DATA);

const X_MIN = 0, X_MAX = 10, Y_MIN = 0, Y_MAX = 14;
function toX(x: number) { return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * pH; }

const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151", grid: "#111827" };

export default function SVRPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [epsilon, setEpsilon] = useState(1.0);

    const insideCount = DATA.filter(d => Math.abs(d.y - (m * d.x + b)) <= epsilon).length;
    const supportVectors = DATA.filter(d => Math.abs(d.y - (m * d.x + b)) > epsilon);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { draw(); }, [epsilon]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = THEME.grid; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = PAD.top + (i / 4) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }

        // Epsilon tube fill
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
            const x = X_MIN + (i / 100) * X_MAX;
            ctx.lineTo(toX(x), toY(m * x + b + epsilon));
        }
        for (let i = 100; i >= 0; i--) {
            const x = X_MIN + (i / 100) * X_MAX;
            ctx.lineTo(toX(x), toY(m * x + b - epsilon));
        }
        ctx.closePath();
        ctx.fillStyle = "#60a5fa18"; ctx.fill();

        // Tube borders
        [+epsilon, -epsilon].forEach(e => {
            ctx.beginPath();
            for (let i = 0; i <= 100; i++) {
                const x = X_MIN + (i / 100) * X_MAX;
                const cx = toX(x), cy = toY(m * x + b + e);
                if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
            }
            ctx.strokeStyle = "#60a5fa66"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
        });

        // Regression line
        ctx.beginPath();
        ctx.moveTo(toX(X_MIN), toY(m * X_MIN + b));
        ctx.lineTo(toX(X_MAX), toY(m * X_MAX + b));
        ctx.strokeStyle = "#60a5fa"; ctx.lineWidth = 2.5;
        ctx.shadowColor = "#60a5fa"; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;

        // Data points
        DATA.forEach(d => {
            const pred = m * d.x + b;
            const err = Math.abs(d.y - pred);
            const isSV = err > epsilon;
            const cx = toX(d.x), cy = toY(d.y);

            if (isSV) {
                // Slack line to tube boundary
                const boundary = d.y > pred ? pred + epsilon : pred - epsilon;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, toY(boundary));
                ctx.strokeStyle = "#f8717166"; ctx.lineWidth = 1.5; ctx.stroke();
            }

            ctx.beginPath(); ctx.arc(cx, cy, isSV ? 6 : 4, 0, Math.PI * 2);
            ctx.fillStyle = isSV ? "#f87171" : "#60a5fa";
            ctx.globalAlpha = isSV ? 1 : 0.65;
            if (isSV) { ctx.shadowColor = "#f87171"; ctx.shadowBlur = 10; }
            ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
            ctx.strokeStyle = isSV ? "#f87171cc" : "#60a5fa44"; ctx.lineWidth = 1.5; ctx.stroke();
        });

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("X →", PAD.left + pW / 2, H - 6);

        // Epsilon annotation
        ctx.fillStyle = "#60a5fa"; ctx.font = "bold 10px monospace"; ctx.textAlign = "right";
        ctx.fillText(`ε = ${epsilon.toFixed(1)}  inside: ${insideCount}/${DATA.length}`, PAD.left + pW - 4, PAD.top + 14);
        ctx.fillStyle = "#f87171"; ctx.fillText(`SVs: ${supportVectors.length} (outside tube)`, PAD.left + pW - 4, PAD.top + 28);
    }

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · REGRESSION · §53</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Support Vector Regression</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "SVR is a Tunnel fit — ignore errors inside the tunnel, care only when a point escapes."
                </p>
            </div>

            <div style={{ border: `1px solid #60a5fa44`, borderRadius: "8px", overflow: "hidden", display: "flex", justifyContent: "center", background: THEME.surface }}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            <div style={{ width: "100%", maxWidth: 480, marginTop: "14px", margin: "14px auto 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "6px" }}>
                    <span>Epsilon (ε) — tube width</span>
                    <span style={{ color: "#60a5fa" }}>ε = {epsilon.toFixed(1)}</span>
                </div>
                <input type="range" min={0.1} max={3.0} step={0.1} value={epsilon}
                    onChange={e => setEpsilon(+e.target.value)}
                    style={{ width: "100%", accentColor: "#60a5fa", cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.dim, marginTop: "4px" }}>
                    <span>ε=0.1 (tight, many SVs)</span><span>ε=3.0 (wide, few SVs)</span>
                </div>
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "16px", fontSize: "11px", justifyContent: "center" }}>
                {[
                    { color: "#60a5fa", label: "Inside tube — zero loss, ignored" },
                    { color: "#f87171", label: "Outside tube — support vectors, penalised" },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                        <span style={{ color: THEME.dim }}>{label}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: "3px solid #60a5fa", background: "#60a5fa0f", maxWidth: 500, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: "#60a5fa" }}>// KEY INSIGHT:</span> Only the <span style={{ color: "#f87171" }}>red points</span> (support vectors outside the tube) contribute to the loss and influence the fitted line. Points inside the ε-tube cost exactly zero — making SVR robust to small noise.
            </div>
        </div>
    );
}

