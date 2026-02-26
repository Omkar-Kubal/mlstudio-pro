"use client";

import { useState, useMemo } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    accent: "#60a5fa", // Blue for regression line
    data: "#f472b6",   // Pink for data points
    residual: "#ef444466", // Red for error lines
};

const POINTS = [
    { x: 10, y: 80 }, { x: 25, y: 70 }, { x: 40, y: 55 }, { x: 55, y: 45 },
    { x: 70, y: 35 }, { x: 85, y: 20 }, { x: 30, y: 65 }, { x: 60, y: 40 },
    { x: 20, y: 75 }, { x: 80, y: 25 }
];

export default function LinearRegressionPrimitive() {
    const [slope, setSlope] = useState(-0.75);
    const [intercept, setIntercept] = useState(85);
    const [showResiduals, setShowResiduals] = useState(true);

    const stats = useMemo(() => {
        let totalError = 0;
        POINTS.forEach(p => {
            const pred = p.x * slope + intercept;
            totalError += Math.pow(p.y - pred, 2);
        });
        const mse = totalError / POINTS.length;
        return { mse };
    }, [slope, intercept]);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · REGRESSION · §46</div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>Linear Regression</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, fontStyle: "italic" }}>
                    "Regression finds the line that minimizes the total distance (error) to all points."
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>

                {/* Canvas Area */}
                <div style={{ position: "relative", width: 320, height: 320, background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: 20 }}>
                    <svg width="280" height="280" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                        {/* Grid */}
                        <line x1="0" y1="100" x2="100" y2="100" stroke={THEME.border} strokeWidth="0.5" />
                        <line x1="0" y1="0" x2="0" y2="100" stroke={THEME.border} strokeWidth="0.5" />

                        {/* Residuals */}
                        {showResiduals && POINTS.map((p, i) => {
                            const pred = p.x * slope + intercept;
                            return <line key={i} x1={p.x} y1={100 - p.y} x2={p.x} y2={100 - pred} stroke={THEME.residual} strokeWidth="1" strokeDasharray="1,1" />;
                        })}

                        {/* Regression Line */}
                        <line
                            x1="0" y1={100 - intercept}
                            x2="100" y2={100 - (100 * slope + intercept)}
                            stroke={THEME.accent}
                            strokeWidth="2"
                            style={{ transition: "all 0.1s" }}
                        />

                        {/* Points */}
                        {POINTS.map((p, i) => (
                            <circle key={i} cx={p.x} cy={100 - p.y} r="2" fill={THEME.data} />
                        ))}
                    </svg>
                    <div style={{ position: "absolute", bottom: 5, right: 10, fontSize: "9px", color: THEME.dim }}>X Feature</div>
                    <div style={{ position: "absolute", top: 10, left: 5, fontSize: "9px", color: THEME.dim, transform: "rotate(-90deg)" }}>Y Target</div>
                </div>

                {/* Controls */}
                <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "12px" }}>

                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "16px" }}>EQUATION: y = mx + b</div>

                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                                <span>Slope (m)</span>
                                <span style={{ color: THEME.accent, fontWeight: 700 }}>{slope.toFixed(2)}</span>
                            </div>
                            <input type="range" min={-2} max={2} step={0.05} value={slope} onChange={e => setSlope(+e.target.value)} style={{ width: "100%", accentColor: THEME.accent }} />
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                                <span>Intercept (b)</span>
                                <span style={{ color: THEME.accent, fontWeight: 700 }}>{intercept.toFixed(1)}</span>
                            </div>
                            <input type="range" min={0} max={100} step={1} value={intercept} onChange={e => setIntercept(+e.target.value)} style={{ width: "100%", accentColor: THEME.accent }} />
                        </div>

                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", cursor: "pointer" }}>
                            <input type="checkbox" checked={showResiduals} onChange={e => setShowResiduals(e.target.checked)} />
                            Show Residuals (Error)
                        </label>
                    </div>

                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px", flex: 1 }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>ERROR METRIC (MSE)</div>
                        <div style={{ fontSize: "32px", fontWeight: 800, color: stats.mse < 30 ? THEME.accent : THEME.text }}>
                            {stats.mse.toFixed(1)}
                        </div>
                        <p style={{ fontSize: "11px", color: THEME.dim, marginTop: "8px" }}>
                            {stats.mse < 30 ? "Excellent fit! Error is minimized." : "High error. Adjust slope and intercept to better cut through the data."}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

