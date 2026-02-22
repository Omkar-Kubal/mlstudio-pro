"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const W = 540, H = 280;
const PAD = { top: 28, right: 24, bottom: 44, left: 54 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

// Fixed data points on a line
const LINE_M = 1.1, LINE_B = 2;
const FIXED_PTS = Array.from({ length: 12 }, (_, i) => {
    const x = 1 + i * 0.65;
    return { x: +x.toFixed(2), y: +(LINE_M * x + LINE_B + randNorm(0, 0.5)).toFixed(2), fixed: true };
});

const X_MIN = 0, X_MAX = 10, Y_MIN = 0, Y_MAX = 14;
function toX(x: number) { return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * pH; }
function fromCanvas(cx: number, cy: number) {
    return {
        x: X_MIN + ((cx - PAD.left) / pW) * (X_MAX - X_MIN),
        y: Y_MIN + ((PAD.top + pH - cy) / pH) * (Y_MAX - Y_MIN)
    };
}

const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151", grid: "#111827" };

export default function RegressionMetricsPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [outlier, setOutlier] = useState({ x: 6, y: 11.5, fixed: false });
    const [dragging, setDragging] = useState(false);
    const [metric, setMetric] = useState("both");

    const allPts = [...FIXED_PTS, outlier];
    const errors = allPts.map(p => p.y - (LINE_M * p.x + LINE_B));
    const absErrors = errors.map(Math.abs);
    const mae = absErrors.reduce((s, e) => s + e, 0) / allPts.length;
    const rmse = Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / allPts.length);
    const outlierError = Math.abs(outlier.y - (LINE_M * outlier.x + LINE_B));

    useEffect(() => { draw(); }, [outlier, metric]);

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

        // Regression line
        ctx.beginPath();
        ctx.moveTo(toX(X_MIN), toY(LINE_M * X_MIN + LINE_B));
        ctx.lineTo(toX(X_MAX), toY(LINE_M * X_MAX + LINE_B));
        ctx.strokeStyle = "#60a5fa"; ctx.lineWidth = 2; ctx.stroke();

        // Error visualizations
        allPts.forEach(pt => {
            const pred = LINE_M * pt.x + LINE_B;
            const err = Math.abs(pt.y - pred);
            const cx = toX(pt.x);
            const isOutlier = !pt.fixed;

            if (metric !== "rmse") {
                // MAE: absolute stick
                ctx.beginPath(); ctx.moveTo(cx, toY(pt.y)); ctx.lineTo(cx, toY(pred));
                ctx.strokeStyle = isOutlier ? "#fbbf24aa" : "#34d39955";
                ctx.lineWidth = isOutlier ? 2.5 : 1.5; ctx.stroke();
            }

            if (metric !== "mae") {
                // RMSE: square drawn to the right
                const sqSize = (err / (Y_MAX - Y_MIN)) * pH;
                const sqX = cx + 4;
                const sqY = Math.min(toY(pt.y), toY(pred));
                ctx.fillStyle = isOutlier ? "#f8717133" : "#f4728b22";
                ctx.fillRect(sqX, sqY, sqSize, sqSize);
                ctx.strokeStyle = isOutlier ? "#f87171aa" : "#f4728b55";
                ctx.lineWidth = isOutlier ? 1.5 : 0.8; ctx.strokeRect(sqX, sqY, sqSize, sqSize);
            }
        });

        // Fixed data pts
        FIXED_PTS.forEach(pt => {
            ctx.beginPath(); ctx.arc(toX(pt.x), toY(pt.y), 4, 0, Math.PI * 2);
            ctx.fillStyle = "#60a5fa"; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1;
        });

        // Draggable outlier
        const ox = toX(outlier.x), oy = toY(outlier.y);
        ctx.beginPath(); ctx.arc(ox, oy, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24"; ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = "#000"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("✦", ox, oy); ctx.textBaseline = "alphabetic";

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("X →", PAD.left + pW / 2, H - 6);

        // Metric readout
        ctx.textAlign = "right"; ctx.font = "bold 10px monospace";
        ctx.fillStyle = "#34d399"; ctx.fillText(`MAE  = ${mae.toFixed(3)}`, PAD.left + pW - 4, PAD.top + 14);
        ctx.fillStyle = "#f87171"; ctx.fillText(`RMSE = ${rmse.toFixed(3)}`, PAD.left + pW - 4, PAD.top + 28);
        ctx.fillStyle = "#fbbf24"; ctx.fillText(`outlier err = ${outlierError.toFixed(2)}`, PAD.left + pW - 4, PAD.top + 42);
    }

    const handleDown = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        const d = Math.hypot(cx - toX(outlier.x), cy - toY(outlier.y));
        if (d < 20) setDragging(true);
    }, [outlier]);

    const handleMove = useCallback((e: React.MouseEvent) => {
        if (!dragging) return;
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const { x, y } = fromCanvas((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
        setOutlier({ x: Math.max(0.1, Math.min(9.9, x)), y: Math.max(0.2, Math.min(13.9, y)), fixed: false });
    }, [dragging]);

    const handleUp = useCallback(() => setDragging(false), []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · REGRESSION · §56</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Regression Metrics</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "MAE tells you the Average Mistake; RMSE is a strict parent who punishes large mistakes harder."
                </p>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", justifyContent: "center" }}>
                {[
                    { key: "mae", label: "MAE only", color: "#34d399" },
                    { key: "both", label: "Both", color: "#94a3b8" },
                    { key: "rmse", label: "RMSE only", color: "#f87171" },
                ].map(({ key, label, color }) => (
                    <button key={key} onClick={() => setMetric(key)}
                        style={{ padding: "6px 14px", border: `1.5px solid ${metric === key ? color : THEME.border}`, borderRadius: "4px", background: metric === key ? color + "22" : "transparent", color: metric === key ? color : THEME.dim, fontSize: "11px", fontFamily: "inherit", cursor: "pointer" }}>
                        {label}
                    </button>
                ))}
            </div>

            <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", background: THEME.surface, display: "flex", justifyContent: "center" }}
                onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            <div style={{ marginTop: "8px", fontSize: "11px", color: "#fbbf24", textAlign: "center" }}>← DRAG THE GOLD STAR ✦ far from the line to see the metrics diverge →</div>

            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", maxWidth: 600, width: "100%", margin: "14px auto 0" }}>
                {[
                    { label: "MAE (Mean Absolute Error)", color: "#34d399", formula: "Σ|yᵢ - ŷᵢ| / n", pts: ["Equal weight to all errors", "Robust to outliers", "Same units as target", "Good for: skewed distributions"] },
                    { label: "RMSE (Root Mean Sq. Error)", color: "#f87171", formula: "√( Σ(yᵢ-ŷᵢ)² / n )", pts: ["Large errors penalised heavily", "Sensitive to outliers", "Differentiable everywhere", "Good for: Gaussian errors"] },
                ].map(({ label, color, formula, pts }) => (
                    <div key={label} style={{ border: `1px solid ${color}33`, borderRadius: "6px", padding: "10px 12px", background: color + "08" }}>
                        <div style={{ fontSize: "10px", color, fontWeight: 700, marginBottom: "4px" }}>{label}</div>
                        <div style={{ fontSize: "10px", color: color + "aa", marginBottom: "6px", fontFamily: "monospace" }}>{formula}</div>
                        {pts.map(p => <div key={p} style={{ fontSize: "9px", color: THEME.dim, marginBottom: "3px" }}>· {p}</div>)}
                    </div>
                ))}
            </div>
        </div>
    );
}
