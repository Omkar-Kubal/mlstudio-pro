"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const W = 420, H = 360;
const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

const CLASS_COLORS = ["#f472b8", "#60a5fa", "#34d399"];
const CENTERS = [{ x: 2.5, y: 7 }, { x: 7, y: 7 }, { x: 5, y: 2.5 }];
const DATA = CENTERS.flatMap((c, ci) =>
    Array.from({ length: 20 }, () => ({
        x: Math.max(0.3, Math.min(9.7, c.x + randNorm(0, 1.3))),
        y: Math.max(0.3, Math.min(9.7, c.y + randNorm(0, 1.3))),
        cls: ci,
    }))
);

function toX(x: number) { return PAD.left + (x / 10) * pW; }
function toY(y: number) { return PAD.top + pH - (y / 10) * pH; }

type Point = { x: number; y: number; cls: number };

function knnClassify(query: { x: number; y: number }, data: Point[], k: number) {
    const sorted = [...data].sort((a, b) =>
        Math.hypot(a.x - query.x, a.y - query.y) - Math.hypot(b.x - query.x, b.y - query.y));
    const neighbors = sorted.slice(0, k);
    const votes = [0, 0, 0];
    neighbors.forEach(n => votes[n.cls]++);
    return { cls: votes.indexOf(Math.max(...votes)), neighbors };
}

const GRID_RES = 35;
const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151" };

export default function KNNClassificationPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [k, setK] = useState(5);
    const [query, setQuery] = useState({ x: 5, y: 5 });

    const { cls: predCls, neighbors } = knnClassify(query, DATA, k);
    const furthest = neighbors.reduce((m, n) => Math.max(m, Math.hypot(n.x - query.x, n.y - query.y)), 0);
    const accuracy = DATA.filter(d => knnClassify(d, DATA.filter(dd => dd !== d), k).cls === d.cls).length / DATA.length;

    // Build color grid
    const grid: { gx: number; gy: number; cls: number }[] = [];
    for (let gy = 0; gy < GRID_RES; gy++)
        for (let gx = 0; gx < GRID_RES; gx++) {
            const x = (gx + 0.5) / GRID_RES * 10, y = (gy + 0.5) / GRID_RES * 10;
            grid.push({ gx, gy, cls: knnClassify({ x, y }, DATA, k).cls });
        }

    useEffect(() => { draw(); }, [k, query]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        const cellW = pW / GRID_RES, cellH = pH / GRID_RES;
        grid.forEach(({ gx, gy, cls }) => {
            ctx.fillStyle = CLASS_COLORS[cls] + "25";
            ctx.fillRect(PAD.left + gx * cellW, PAD.top + (GRID_RES - 1 - gy) * cellH, cellW + 1, cellH + 1);
        });

        // Query radius circle
        const rpx = (furthest / 10) * pW;
        ctx.beginPath(); ctx.arc(toX(query.x), toY(query.y), rpx, 0, Math.PI * 2);
        ctx.fillStyle = CLASS_COLORS[predCls] + "12"; ctx.fill();
        ctx.strokeStyle = CLASS_COLORS[predCls] + "55"; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);

        // Connection lines to neighbors
        neighbors.forEach(n => {
            ctx.beginPath(); ctx.moveTo(toX(query.x), toY(query.y));
            ctx.lineTo(toX(n.x), toY(n.y));
            ctx.strokeStyle = CLASS_COLORS[n.cls] + "66"; ctx.lineWidth = 1.2; ctx.stroke();
        });

        // Data points
        DATA.forEach(d => {
            const isNeighbor = neighbors.some(n => n === d);
            ctx.beginPath(); ctx.arc(toX(d.x), toY(d.y), isNeighbor ? 7 : 5, 0, Math.PI * 2);
            ctx.fillStyle = CLASS_COLORS[d.cls];
            ctx.globalAlpha = isNeighbor ? 1 : 0.55;
            if (isNeighbor) { ctx.shadowColor = CLASS_COLORS[d.cls]; ctx.shadowBlur = 12; }
            ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
            if (isNeighbor) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke(); }
        });

        // Vote tally bar
        const votes = [0, 0, 0];
        neighbors.forEach(n => votes[n.cls]++);
        const bx = PAD.left + pW - 60, by = PAD.top + 8;
        votes.forEach((v, ci) => {
            const bh = (v / k) * 40;
            ctx.fillStyle = CLASS_COLORS[ci] + "cc";
            ctx.fillRect(bx + ci * 22, by + 40 - bh, 16, bh);
            ctx.fillStyle = CLASS_COLORS[ci]; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
            ctx.fillText(v.toString(), bx + ci * 22 + 8, by + 40 - bh - 3);
        });
        ctx.fillStyle = THEME.dim; ctx.font = "8px monospace"; ctx.textAlign = "left";
        ctx.fillText("votes", bx, by + 52);

        // Query point
        const qx = toX(query.x), qy = toY(query.y);
        ctx.beginPath(); ctx.arc(qx, qy, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.shadowColor = CLASS_COLORS[predCls]; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
        ctx.strokeStyle = CLASS_COLORS[predCls]; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = CLASS_COLORS[predCls]; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("?", qx, qy); ctx.textBaseline = "alphabetic";

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("feature₁ →", PAD.left + pW / 2, H - 4);

        ctx.fillStyle = CLASS_COLORS[predCls]; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
        ctx.fillText(`→ Class ${predCls} (k=${k})  acc=${(accuracy * 100).toFixed(0)}%`, PAD.left + 4, PAD.top + 14);
    }

    const handleMove = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        if (cx >= PAD.left && cx <= PAD.left + pW && cy >= PAD.top && cy <= PAD.top + pH) {
            setQuery({
                x: +(cx - PAD.left) / pW * 10,
                y: +(PAD.top + pH - cy) / pH * 10,
            });
        }
    }, []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · CLASSIFICATION · §61</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>KNN Classification</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "KNN is Democratic — it takes a vote among your nearest neighbours, and majority wins."
                </p>
            </div>

            <div style={{ border: `1px solid ${CLASS_COLORS[predCls]}44`, borderRadius: "8px", overflow: "hidden", cursor: "crosshair", transition: "border-color 0.3s", background: THEME.surface, display: "flex", justifyContent: "center" }}
                onMouseMove={handleMove}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            <div style={{ marginTop: "8px", fontSize: "11px", color: "#fbbf24", textAlign: "center" }}>← MOVE MOUSE over the plot to query any point →</div>

            <div style={{ width: "100%", maxWidth: 400, marginTop: "12px", margin: "12px auto 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "6px" }}>
                    <span>k — neighbours to consult</span>
                    <span style={{ color: CLASS_COLORS[predCls] }}>k = {k}</span>
                </div>
                <input type="range" min={1} max={20} step={1} value={k}
                    onChange={e => setK(+e.target.value)}
                    style={{ width: "100%", accentColor: "#94a3b8", cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.dim, marginTop: "4px" }}>
                    <span>k=1 (jagged boundary)</span><span>k=20 (smooth, possibly underfit)</span>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${CLASS_COLORS[predCls]}`, background: CLASS_COLORS[predCls] + "0f", maxWidth: 440, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: CLASS_COLORS[predCls] }}>// INSIGHT:</span> The dashed circle shows the search radius. Bright glowing points are the k neighbours voting. Mini bar chart (top-right) shows the vote split. Odd k prevents ties.
            </div>
        </div>
    );
}

