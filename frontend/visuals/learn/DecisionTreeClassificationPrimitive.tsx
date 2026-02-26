"use client";

import { useState, useEffect, useRef } from "react";

const W = 400, H = 340;
const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

const CLASS_COLORS = ["#f472b8", "#60a5fa", "#34d399", "#fbbf24"];
const CLASSES = [
    { cx: 2, cy: 2, label: "A" }, { cx: 7, cy: 2, label: "B" },
    { cx: 2, cy: 7, label: "C" }, { cx: 7, cy: 7, label: "D" },
];
const DATA = CLASSES.flatMap((c, ci) =>
    Array.from({ length: 18 }, () => ({
        x: Math.max(0.2, Math.min(9.8, c.cx + randNorm(0, 1.1))),
        y: Math.max(0.2, Math.min(9.8, c.cy + randNorm(0, 1.1))),
        cls: ci,
    }))
);

function toX(x: number) { return PAD.left + (x / 10) * pW; }
function toY(y: number) { return PAD.top + pH - (y / 10) * pH; }

type Point = { x: number; y: number; cls: number };
type TreeNode = {
    leaf?: boolean;
    cls?: number;
    split?: { axis: 'x' | 'y'; val: number };
    left?: TreeNode;
    right?: TreeNode;
};

// Simple axis-aligned tree classifier
function buildTree(data: Point[], depth: number): TreeNode {
    function split(pts: Point[], d: number): TreeNode {
        if (d === 0 || pts.length < 6) {
            const counts = [0, 0, 0, 0];
            pts.forEach(p => counts[p.cls]++);
            return { leaf: true, cls: counts.indexOf(Math.max(...counts)) };
        }
        // Try both axes, find best split
        let best: { axis: 'x' | 'y'; val: number } | null = null, bestGini = Infinity;
        (['x', 'y'] as const).forEach(axis => {
            const vals = [...new Set(pts.map(p => p[axis]))].sort((a, b) => a - b);
            vals.forEach(v => {
                const left = pts.filter(p => p[axis] <= v);
                const right = pts.filter(p => p[axis] > v);
                if (!left.length || !right.length) return;
                const gini = (left.length * giniImpurity(left) + right.length * giniImpurity(right)) / pts.length;
                if (gini < bestGini) { bestGini = gini; best = { axis, val: v }; }
            });
        });
        if (!best) {
            const counts = [0, 0, 0, 0]; pts.forEach(p => counts[p.cls]++);
            return { leaf: true, cls: counts.indexOf(Math.max(...counts)) };
        }
        const left = pts.filter(p => p[best!.axis] <= best!.val);
        const right = pts.filter(p => p[best!.axis] > best!.val);
        return { split: best, left: split(left, d - 1), right: split(right, d - 1) };
    }
    return split(data, depth);
}

function giniImpurity(pts: Point[]) {
    const total = pts.length;
    const counts = [0, 0, 0, 0];
    pts.forEach(p => counts[p.cls]++);
    return 1 - counts.reduce((s, c) => s + (c / total) ** 2, 0);
}

function predictTree(tree: TreeNode, pt: Point | { x: number; y: number }): number {
    if (tree.leaf) return tree.cls!;
    const val = tree.split!.axis === 'x' ? pt.x : pt.y;
    return val <= tree.split!.val ? predictTree(tree.left!, pt) : predictTree(tree.right!, pt);
}

type SplitLine = { x0: number; x1: number; y0: number; y1: number; axis: string };
function collectSplits(tree: TreeNode, bounds = { x0: 0, x1: 10, y0: 0, y1: 10 }): SplitLine[] {
    if (tree.leaf) return [];
    const lines: SplitLine[] = [];
    if (tree.split!.axis === "x") {
        lines.push({ x0: tree.split!.val, x1: tree.split!.val, y0: bounds.y0, y1: bounds.y1, axis: "x" });
        lines.push(...collectSplits(tree.left!, { ...bounds, x1: tree.split!.val }));
        lines.push(...collectSplits(tree.right!, { ...bounds, x0: tree.split!.val }));
    } else {
        lines.push({ x0: bounds.x0, x1: bounds.x1, y0: tree.split!.val, y1: tree.split!.val, axis: "y" });
        lines.push(...collectSplits(tree.left!, { ...bounds, y1: tree.split!.val }));
        lines.push(...collectSplits(tree.right!, { ...bounds, y0: tree.split!.val }));
    }
    return lines;
}

const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151" };
const GRID_RES = 40;

export default function DecisionTreeClassificationPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [depth, setDepth] = useState(2);
    const tree = buildTree(DATA, depth);

    // Pre-compute color grid
    const grid: { gx: number; gy: number; cls: number }[] = [];
    for (let gy = 0; gy < GRID_RES; gy++) {
        for (let gx = 0; gx < GRID_RES; gx++) {
            const x = (gx + 0.5) / GRID_RES * 10;
            const y = (gy + 0.5) / GRID_RES * 10;
            grid.push({ gx, gy, cls: predictTree(tree, { x, y }) });
        }
    }

    const splits = collectSplits(tree);
    const accuracy = DATA.filter(d => predictTree(tree, d) === d.cls).length / DATA.length;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { draw(); }, [depth]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        const cellW = pW / GRID_RES, cellH = pH / GRID_RES;

        // Decision regions
        grid.forEach(({ gx, gy, cls }) => {
            const rx = PAD.left + gx * cellW, ry = PAD.top + (GRID_RES - 1 - gy) * cellH;
            ctx.fillStyle = CLASS_COLORS[cls] + "28";
            ctx.fillRect(rx, ry, cellW + 1, cellH + 1);
        });

        // Decision boundary lines
        splits.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(toX(line.x0), toY(line.y0));
            ctx.lineTo(toX(line.x1), toY(line.y1));
            ctx.strokeStyle = "#ffffff55"; ctx.lineWidth = 1.5; ctx.stroke();
        });

        // Data points
        DATA.forEach(d => {
            const pred = predictTree(tree, d);
            const correct = pred === d.cls;
            ctx.beginPath(); ctx.arc(toX(d.x), toY(d.y), correct ? 5 : 7, 0, Math.PI * 2);
            ctx.fillStyle = CLASS_COLORS[d.cls]; ctx.globalAlpha = correct ? 0.85 : 0.9; ctx.fill(); ctx.globalAlpha = 1;
            if (!correct) {
                ctx.strokeStyle = "#f8717188"; ctx.lineWidth = 2; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(toX(d.x) - 5, toY(d.y) - 5); ctx.lineTo(toX(d.x) + 5, toY(d.y) + 5);
                ctx.moveTo(toX(d.x) + 5, toY(d.y) - 5); ctx.lineTo(toX(d.x) - 5, toY(d.y) + 5);
                ctx.strokeStyle = "#f87171"; ctx.lineWidth = 1.5; ctx.stroke();
            }
        });

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("feature₁ →", PAD.left + pW / 2, H - 4);
        ctx.save(); ctx.translate(12, PAD.top + pH / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText("feature₂", 0, 0); ctx.restore();

        // Stats
        const overfit = depth >= 6;
        ctx.fillStyle = overfit ? "#f87171" : "#34d399"; ctx.font = "bold 10px monospace"; ctx.textAlign = "right";
        ctx.fillText(`depth=${depth}  acc=${(accuracy * 100).toFixed(0)}%  ${overfit ? "⚠ overfit" : ""}`, PAD.left + pW - 2, PAD.top + 14);
    }

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · CLASSIFICATION · §58</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Decision Tree Classification</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "A decision tree is 20 Questions — each split halves the space until only one class remains."
                </p>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
                <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden", background: THEME.surface }}>
                    <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Legend */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "8px" }}>CLASSES</div>
                        {CLASSES.map((c, i) => (
                            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <div style={{ width: 12, height: 12, borderRadius: "3px", background: CLASS_COLORS[i] }} />
                                <span style={{ fontSize: "11px", color: CLASS_COLORS[i] }}>Class {c.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Depth stats */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "8px" }}>TREE STATS</div>
                        {[
                            { label: "Depth", val: depth },
                            { label: "Leaves", val: Math.min(2 ** depth, 16) },
                            { label: "Splits", val: splits.length },
                            { label: "Accuracy", val: `${(accuracy * 100).toFixed(0)}%` },
                        ].map(({ label, val }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                                <span style={{ color: THEME.dim }}>{label}</span>
                                <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ width: "100%", maxWidth: 480, marginTop: "14px", margin: "14px auto 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "6px" }}>
                    <span>Tree Depth</span>
                    <span style={{ color: depth >= 6 ? "#f87171" : depth <= 1 ? "#fbbf24" : "#34d399" }}>
                        {depth <= 1 ? "Underfit" : depth >= 6 ? "Overfit — memorising" : "Good split"}
                    </span>
                </div>
                <input type="range" min={1} max={8} step={1} value={depth}
                    onChange={e => setDepth(+e.target.value)}
                    style={{ width: "100%", accentColor: "#a78bfa", cursor: "pointer" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: THEME.dim, marginTop: "4px" }}>
                    <span>depth=1 (stump)</span><span>depth=8 (overfit)</span>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: "3px solid #a78bfa", background: "#a78bfa0f", maxWidth: 480, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: "#a78bfa" }}>// AXIS-ALIGNED SPLITS:</span> Each white line is a split. Colour regions show predicted class. Crossed-out points (✗) are misclassified. Deep trees perfectly partition training points — but the jagged boundaries won't generalise.
            </div>
        </div>
    );
}

