"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const W = 540, H = 320;
const PAD = { top: 28, right: 24, bottom: 44, left: 54 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

const trueF = (x: number) => Math.sin(x * 0.9) * 2.5 + x * 0.4 + 3;
const DATA = Array.from({ length: 35 }, (_, i) => {
    const x = 0.4 + i * 0.26;
    return { x: +x.toFixed(3), y: +(trueF(x) + randNorm(0, 0.8)).toFixed(3) };
});

const X_MIN = 0, X_MAX = 10, Y_MIN = 0, Y_MAX = 12;
function toX(x: number) { return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * pH; }
function fromCanvasX(cx: number) { return X_MIN + ((cx - PAD.left) / pW) * (X_MAX - X_MIN); }

function knnPredict(query: number, data: typeof DATA, k: number) {
    const sorted = [...data].sort((a, b) => Math.abs(a.x - query) - Math.abs(b.x - query));
    const neighbors = sorted.slice(0, k);
    const pred = neighbors.reduce((s, d) => s + d.y, 0) / k;
    return { pred, neighbors };
}

function buildKNNCurve(data: typeof DATA, k: number) {
    return Array.from({ length: 200 }, (_, i) => {
        const x = X_MIN + (i / 199) * X_MAX;
        return { x, y: knnPredict(x, data, k).pred };
    });
}

const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151", grid: "#111827" };
const K_COLORS: Record<number, string> = { 1: "#f87171", 2: "#f87171", 3: "#fbbf24", 5: "#34d399", 7: "#60a5fa", 10: "#a78bfa", 15: "#a78bfa" };

export default function KNNRegressionPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [k, setK] = useState(5);
    const [queryX, setQueryX] = useState(5.0);

    const { pred, neighbors } = knnPredict(queryX, DATA, k);
    const curve = buildKNNCurve(DATA, k);
    const color = K_COLORS[Math.min(15, k)] || "#60a5fa";

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { draw(); }, [k, queryX]);

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

        // KNN curve
        ctx.beginPath();
        curve.forEach(({ x, y }, i) => {
            const cx = toX(x), cy = toY(y);
            if (cy < PAD.top - 5 || cy > PAD.top + pH + 5) { return; }
            if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        });
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.shadowColor = color; ctx.shadowBlur = 5; ctx.stroke(); ctx.shadowBlur = 0;

        // Neighbor connection lines
        neighbors.forEach(n => {
            ctx.beginPath();
            ctx.moveTo(toX(queryX), toY(pred));
            ctx.lineTo(toX(n.x), toY(n.y));
            ctx.strokeStyle = color + "55"; ctx.lineWidth = 1.5; ctx.stroke();
        });

        // Query region highlight
        const furthest = neighbors.reduce((m, n) => Math.max(m, Math.abs(n.x - queryX)), 0);
        const rx1 = toX(queryX - furthest), rx2 = toX(queryX + furthest);
        ctx.fillStyle = color + "12";
        ctx.fillRect(rx1, PAD.top, rx2 - rx1, pH);
        ctx.strokeStyle = color + "33"; ctx.lineWidth = 1; ctx.setLineDash([3, 2]);
        ctx.strokeRect(rx1, PAD.top, rx2 - rx1, pH); ctx.setLineDash([]);

        // Data points
        DATA.forEach(d => {
            const isNeighbor = neighbors.some(n => n === d);
            const cx = toX(d.x), cy = toY(d.y);
            ctx.beginPath(); ctx.arc(cx, cy, isNeighbor ? 7 : 4, 0, Math.PI * 2);
            ctx.fillStyle = isNeighbor ? color : "#60a5fa";
            ctx.globalAlpha = isNeighbor ? 1 : 0.5;
            if (isNeighbor) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
            ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
            if (isNeighbor) {
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.fillStyle = "#000"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(d.y.toFixed(1), cx, cy); ctx.textBaseline = "alphabetic";
            }
        });

        // Query point
        const qx = toX(queryX), qy = toY(pred);
        ctx.beginPath(); ctx.arc(qx, qy, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.shadowColor = "#fff"; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.fillStyle = color; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("?", qx, qy); ctx.textBaseline = "alphabetic";

        // Prediction label
        ctx.fillStyle = "#fff"; ctx.font = "bold 11px monospace"; ctx.textAlign = "left";
        ctx.fillText(`ŷ = ${pred.toFixed(2)}`, qx + 12, qy + 4);

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("X →", PAD.left + pW / 2, H - 6);

        ctx.fillStyle = color; ctx.font = "bold 10px monospace"; ctx.textAlign = "right";
        const label = k === 1 ? "overfit (wiggly)" : k >= 15 ? "underfit (over-smooth)" : "good fit";
        ctx.fillText(`k = ${k}  (${label})`, PAD.left + pW - 4, PAD.top + 14);
    }

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const scaleX = W / rect.width;
        const scaledCX = cx * scaleX;
        if (scaledCX >= PAD.left && scaledCX <= PAD.left + pW) {
            setQueryX(+Math.max(X_MIN + 0.1, Math.min(X_MAX - 0.1, fromCanvasX(scaledCX))).toFixed(3));
        }
    }, []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · REGRESSION · §54</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>KNN Regression</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "KNN is Locality — your value is just the average of the K people standing closest to you."
                </p>
            </div>

            <div style={{ border: `1px solid ${color}44`, borderRadius: "8px", overflow: "hidden", cursor: "crosshair", transition: "border-color 0.3s", background: THEME.surface, display: "flex", justifyContent: "center" }}
                onMouseMove={handleMouseMove}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            <div style={{ marginTop: "8px", fontSize: "11px", color: THEME.dim, textAlign: "center" }}>← MOVE MOUSE OVER CHART to reposition query point →</div>

            <div style={{ width: "100%", maxWidth: 480, marginTop: "12px", margin: "12px auto 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "6px" }}>
                    <span>k — number of neighbors</span>
                    <span style={{ color }}>k = {k}</span>
                </div>
                <input type="range" min={1} max={20} step={1} value={k}
                    onChange={e => setK(+e.target.value)}
                    style={{ width: "100%", accentColor: color, cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.dim, marginTop: "4px" }}>
                    <span>k=1 (jagged, overfit)</span><span>k=20 (smooth, underfit)</span>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${color}`, background: color + "0f", maxWidth: 500, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color }}>// BIAS-VARIANCE:</span> k=1 memorises every point (zero bias, high variance). Large k averages too broadly (high bias, low variance). The shaded box shows which k neighbours contribute to the white query point's prediction.
            </div>
        </div>
    );
}

