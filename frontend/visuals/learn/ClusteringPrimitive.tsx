"use client";

import { useState, useMemo, useEffect } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    clusters: ["#60a5fa", "#f472b8", "#34d399", "#fbbf24"],
    centroid: "#fff"
};

const N = 45;
const W = 600, H = 340;

export default function ClusteringPrimitive() {
    const [numClusters, setNumClusters] = useState(3);
    const [step, setStep] = useState(0);

    // Generate fixed points
    const points = useMemo(() => {
        const d = [];
        const seed = 42;
        const random = (s: number) => {
            let x = Math.sin(s) * 10000;
            return x - Math.floor(x);
        };

        // 3 true clusters
        const centers = [[150, 100], [450, 150], [250, 250]];
        for (let i = 0; i < N; i++) {
            const c = centers[i % 3];
            const r = random(seed + i) * 60;
            const angle = random(seed + i + 1) * Math.PI * 2;
            d.push({
                x: c[0] + Math.cos(angle) * r,
                y: c[1] + Math.sin(angle) * r,
                id: i
            });
        }
        return d;
    }, []);

    // Centroids state
    const [centroids, setCentroids] = useState(() => {
        return Array.from({ length: 4 }, (_, i) => ({
            x: 100 + i * 120,
            y: 100 + i * 40,
            id: i
        }));
    });

    // Assign points to clusters
    const assignments = useMemo(() => {
        const activeCentroids = centroids.slice(0, numClusters);
        return points.map(p => {
            let minDist = Infinity;
            let cluster = 0;
            activeCentroids.forEach((c, idx) => {
                const d = Math.hypot(p.x - c.x, p.y - c.y);
                if (d < minDist) { minDist = d; cluster = idx; }
            });
            return cluster;
        });
    }, [points, centroids, numClusters]);

    const updateCentroids = () => {
        const nextCentroids = [...centroids];
        for (let i = 0; i < numClusters; i++) {
            const clusterPoints = points.filter((_, idx) => assignments[idx] === i);
            if (clusterPoints.length > 0) {
                nextCentroids[i] = {
                    x: clusterPoints.reduce((acc, p) => acc + p.x, 0) / clusterPoints.length,
                    y: clusterPoints.reduce((acc, p) => acc + p.y, 0) / clusterPoints.length,
                    id: i
                };
            }
        }
        setCentroids(nextCentroids);
        setStep(s => s + 1);
    };

    const reset = () => {
        setCentroids(Array.from({ length: 4 }, (_, i) => ({
            x: 50 + Math.random() * (W - 100),
            y: 50 + Math.random() * (H - 100),
            id: i
        })));
        setStep(0);
    };

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · UNSUPERVISED · §66</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>K-Means Clustering</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Assign, Move, Repeat. Finding natural groupings in unlabeled data."
                </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
                <div style={{ background: THEME.surface, padding: "12px", borderRadius: "8px", border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", gap: "15px" }}>
                    <span style={{ fontSize: "10px", color: THEME.dim }}>CLUSTERS (K)</span>
                    <div style={{ display: "flex", gap: "5px" }}>
                        {[2, 3, 4].map(k => (
                            <button key={k} onClick={() => { setNumClusters(k); reset(); }}
                                style={{ width: 28, height: 28, border: `1px solid ${numClusters === k ? THEME.clusters[k - 1] : THEME.border}`, borderRadius: "4px", background: numClusters === k ? THEME.clusters[k - 1] + "33" : "transparent", color: numClusters === k ? THEME.clusters[k - 1] : THEME.dim, fontSize: "12px", cursor: "pointer" }}>
                                {k}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={updateCentroids} style={{ padding: "0 20px", borderRadius: "8px", border: "none", background: "#60a5fa", color: "#000", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                    NEXT ITERATION ({step})
                </button>
                <button onClick={reset} style={{ padding: "0 15px", borderRadius: "8px", border: `1px solid ${THEME.border}`, background: "transparent", color: THEME.dim, fontSize: "12px", cursor: "pointer" }}>
                    RESET
                </button>
            </div>

            <div style={{ background: THEME.surface, borderRadius: "8px", border: `1px solid ${THEME.border}`, position: "relative", overflow: "hidden", marginBottom: "20px" }}>
                <svg width={W} height={H} style={{ display: "block", margin: "0 auto" }}>
                    {/* Assignment Lines */}
                    {points.map((p, i) => (
                        <line key={`l-${i}`} x1={p.x} y1={p.y} x2={centroids[assignments[i]].x} y2={centroids[assignments[i]].y} stroke={THEME.clusters[assignments[i]]} strokeWidth="1" opacity="0.1" style={{ transition: "all 0.5s ease" }} />
                    ))}

                    {/* Points */}
                    {points.map((p, i) => (
                        <circle key={p.id} cx={p.x} cy={p.y} r="3.5" fill={THEME.clusters[assignments[i]]} style={{ transition: "fill 0.5s ease" }} />
                    ))}

                    {/* Centroids */}
                    {centroids.slice(0, numClusters).map((c, i) => (
                        <g key={`c-${i}`} style={{ transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} transform={`translate(${c.x}, ${c.y})`}>
                            <rect x="-8" y="-8" width="16" height="16" fill={THEME.clusters[i]} stroke="#fff" strokeWidth="2" transform="rotate(45)" />
                            <text y="24" textAnchor="middle" fill={THEME.clusters[i]} fontSize="9" fontWeight="bold">CENTROID {i + 1}</text>
                        </g>
                    ))}
                </svg>

                <div style={{ position: "absolute", top: 12, left: 12, background: THEME.bg + "88", padding: "8px", borderRadius: "6px", fontSize: "9px", border: `1px solid ${THEME.border}` }}>
                    <div style={{ color: THEME.dim, marginBottom: "4px" }}>WHATS HAPPENING?</div>
                    {step % 2 === 0 ? "1. Points assigned to nearest centroid" : "2. Centroids moved to average of assigned points"}
                </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <div style={{ flex: 1, background: "#0a0b14", border: `1px solid ${THEME.border}`, padding: "14px", borderRadius: "10px" }}>
                    <h4 style={{ fontSize: "12px", color: "#fbbf24", margin: "0 0 6px" }}>The "K" Problem</h4>
                    <p style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.5", margin: 0 }}>
                        K-Means requires specifying K in advance. We use the "Elbow Method" to find the point where adding clusters gives diminishing returns.
                    </p>
                </div>
                <div style={{ flex: 1, background: "#0a0b14", border: `1px solid ${THEME.border}`, padding: "14px", borderRadius: "10px" }}>
                    <h4 style={{ fontSize: "12px", color: "#34d399", margin: "0 0 6px" }}>Convergence</h4>
                    <p style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.5", margin: 0 }}>
                        The algorithm stops when centroid positions stabilize. While guaranteed to converge, it may land in a local optimum.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${THEME.clusters[0]}`, background: THEME.clusters[0] + "0f", maxWidth: "100%", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                <span style={{ color: THEME.clusters[0] }}>// K-Means:</span> This iterative process minimizes the "inertia" (within-cluster sum-of-squares). Click "Next Iteration" to watch the centroids gravitate toward the geometric center of their assigned points.
            </div>
        </div>
    );
}

