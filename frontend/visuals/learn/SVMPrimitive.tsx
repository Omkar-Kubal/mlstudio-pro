"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const W = 480, H = 360;
const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

function toX(x: number) { return PAD.left + ((x + 1) / 12) * pW; }
function toY(y: number) { return PAD.top + pH - ((y + 1) / 12) * pH; }
function fromCanvas(cx: number, cy: number) {
    return { x: (cx - PAD.left) / pW * 12 - 1, y: (PAD.top + pH - cy) / pH * 12 - 1 };
}

// Fixed background data
const BG_NEG = Array.from({ length: 18 }, () => ({ x: randNorm(-4, 1.2), y: randNorm(-3, 1.5), cls: -1 }));
const BG_POS = Array.from({ length: 18 }, () => ({ x: randNorm(4, 1.2), y: randNorm(3, 1.5), cls: 1 }));

// Support vectors (draggable)
const INIT_SVS = [
    { x: -1.8, y: -0.5, cls: -1, id: 0 },
    { x: -1.2, y: 1.2, cls: -1, id: 1 },
    { x: 1.5, y: 0.3, cls: 1, id: 2 },
    { x: 1.0, y: -1.2, cls: 1, id: 3 },
];

// Fit linear SVM hyperplane from support vectors (simplified: midline between centroids)
function fitHyperplane(svs: typeof INIT_SVS) {
    const neg = svs.filter(s => s.cls === -1);
    const pos = svs.filter(s => s.cls === 1);
    if (!neg.length || !pos.length) return { wx: 1, wy: 0, b: 0, margin: 0 };
    const cx_neg = neg.reduce((s, v) => s + v.x, 0) / neg.length;
    const cy_neg = neg.reduce((s, v) => s + v.y, 0) / neg.length;
    const cx_pos = pos.reduce((s, v) => s + v.x, 0) / pos.length;
    const cy_pos = pos.reduce((s, v) => s + v.y, 0) / pos.length;
    // Normal vector: from neg centroid to pos centroid
    const dx = cx_pos - cx_neg, dy = cy_pos - cy_neg;
    const norm = Math.hypot(dx, dy) || 1;
    const wx = dx / norm, wy = dy / norm;
    // Midpoint
    const mx = (cx_neg + cx_pos) / 2, my = (cy_neg + cy_pos) / 2;
    const b = -(wx * mx + wy * my);
    // Margin = half distance between centroids
    const margin = norm / 2;
    return { wx, wy, b, margin };
}

const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151" };

export default function SVMPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [svs, setSvs] = useState(INIT_SVS);
    const [dragging, setDragging] = useState<number | null>(null);

    const { wx, wy, b, margin } = fitHyperplane(svs);

    useEffect(() => { draw(); }, [svs]);

    function hyperplaneY(x: number, offset = 0) {
        if (Math.abs(wy) < 1e-6) return 0;
        return (-wx * x - b + offset) / wy;
    }

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        // Decision region fill
        const steps = 50;
        for (let i = 0; i <= steps; i++) {
            const x = -1 + (i / steps) * 12;
            const hy = hyperplaneY(x);
            ctx.fillStyle = "#60a5fa08";
            ctx.fillRect(toX(x), PAD.top, pW / steps, Math.max(0, toY(hy) - PAD.top));
            ctx.fillStyle = "#f472b808";
            ctx.fillRect(toX(x), toY(hy), pW / steps, Math.max(0, PAD.top + pH - toY(hy)));
        }

        // Margin lines
        [-margin, margin].forEach(off => {
            ctx.beginPath();
            ctx.moveTo(toX(-1), toY(hyperplaneY(-1, off)));
            ctx.lineTo(toX(11), toY(hyperplaneY(11, off)));
            ctx.strokeStyle = off < 0 ? "#f472b855" : "#60a5fa55";
            ctx.lineWidth = 1.5; ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
        });

        // Margin width bracket (visual)
        const midX_val = 5;
        const my0 = toY(hyperplaneY(midX_val, -margin));
        const my1 = toY(hyperplaneY(midX_val, margin));
        const midX_px = toX(midX_val);
        ctx.beginPath(); ctx.moveTo(midX_px, my0); ctx.lineTo(midX_px, my1);
        ctx.strokeStyle = "#ffffff44"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = "#ffffff88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
        ctx.fillText(`margin = ${(2 * margin).toFixed(2)}`, midX_px + 4, (my0 + my1) / 2 + 4);

        // Hyperplane
        ctx.beginPath();
        ctx.moveTo(toX(-1), toY(hyperplaneY(-1)));
        ctx.lineTo(toX(11), toY(hyperplaneY(11)));
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5;
        ctx.shadowColor = "#fff"; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;

        // Background data
        [...BG_NEG, ...BG_POS].forEach(d => {
            ctx.beginPath(); ctx.arc(toX(d.x), toY(d.y), 4, 0, Math.PI * 2);
            ctx.fillStyle = d.cls === 1 ? "#60a5fa" : "#f472b8";
            ctx.globalAlpha = 0.45; ctx.fill(); ctx.globalAlpha = 1;
        });

        // Support vectors
        svs.forEach((sv) => {
            const cx = toX(sv.x), cy = toY(sv.y);
            const col = sv.cls === 1 ? "#60a5fa" : "#f472b8";
            // Perpendicular to hyperplane connector
            const dist = -wx * sv.x - wy * sv.y - b;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(toX(-wx * dist + sv.x), toY(-wy * dist + sv.y));
            ctx.strokeStyle = col + "33"; ctx.lineWidth = 1; ctx.stroke();

            ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
            ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = "#000"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(sv.cls === 1 ? "+" : "−", cx, cy); ctx.textBaseline = "alphabetic";
        });

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("feature₁ →", PAD.left + pW / 2, H - 4);
    }

    const handleDown = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        const idx = svs.findIndex(sv => Math.hypot(cx - toX(sv.x), cy - toY(sv.y)) < 18);
        if (idx >= 0) setDragging(idx);
    }, [svs]);

    const handleMove = useCallback((e: React.MouseEvent) => {
        if (dragging === null) return;
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const { x, y } = fromCanvas((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
        setSvs(prev => prev.map((sv, i) => i === dragging ? { ...sv, x: Math.max(-0.5, Math.min(10.5, x)), y: Math.max(-0.5, Math.min(10.5, y)) } : sv));
    }, [dragging]);

    const handleUp = useCallback(() => setDragging(null), []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · CLASSIFICATION · §59</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>SVM Classification</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "SVM finds the road with the widest sidewalks — max margin keeps classes furthest apart."
                </p>
            </div>

            <div style={{ border: `1px solid #ffffff33`, borderRadius: "8px", overflow: "hidden", cursor: dragging !== null ? "grabbing" : "grab", background: THEME.surface, display: "flex", justifyContent: "center" }}
                onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
            </div>

            <div style={{ marginTop: "8px", fontSize: "11px", color: "#fbbf24", textAlign: "center" }}>← DRAG THE GLOWING SUPPORT VECTORS ± to reshape the boundary →</div>

            <div style={{ marginTop: "12px", display: "flex", gap: "16px", fontSize: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                {[
                    { color: "#60a5fa", label: "Class +1 (blue side)" },
                    { color: "#f472b8", label: "Class −1 (pink side)" },
                    { color: "#fff", label: "Max-margin hyperplane" },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: 10, height: 2, background: color }} />
                        <span style={{ color: THEME.dim }}>{label}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: "3px solid #fff", background: "#ffffff0a", maxWidth: 500, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: "#fff" }}>// SUPPORT VECTORS:</span> Only the glowing border points define the hyperplane — all other data is ignored. Moving a support vector pivots the hyperplane. This is why SVM is memory-efficient and generalises well. Margin = {(2 * (margin || 0)).toFixed(2)}.
            </div>
        </div>
    );
}

