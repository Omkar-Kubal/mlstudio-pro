"use client";

import { useState, useMemo } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    observed: "#fff", trend: "#60a5fa", seasonal: "#f472b8", residual: "#a78bfa"
};

const N = 40;
const H = 84, W = 680;
const PAD = 20;

export default function TimeSeriesPrimitive() {
    const [trendScale, setTrendScale] = useState(1);
    const [seasonScale, setSeasonScale] = useState(1);
    const [noiseScale, setNoiseScale] = useState(1);

    // Generate synthetic decomposition
    const data = useMemo(() => {
        const d = [];
        for (let i = 0; i < N; i++) {
            const trend = (i / N) * 50 * trendScale;
            const seasonal = Math.sin((i / 8) * Math.PI * 2) * 15 * seasonScale;
            const residual = (Math.random() - 0.5) * 10 * noiseScale;
            const observed = trend + seasonal + residual;
            d.push({ i, observed, trend, seasonal, residual });
        }
        return d;
    }, [trendScale, seasonScale, noiseScale]);

    const maxVal = Math.max(...data.map(d => Math.abs(d.observed)), 20);

    const Sparkline = ({ title, field, color, height = H }: { title: string, field: keyof typeof data[0], color: string, height?: number }) => {
        const pts = data.map((d, i) => {
            const x = PAD + (i / (N - 1)) * (W - PAD * 2);
            const val = d[field] as number;
            const y = (height / 2) - (val / (maxVal * 1.2)) * (height / 2);
            return `${x},${y}`;
        }).join(" ");

        return (
            <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "12px", marginBottom: "10px", position: "relative" }}>
                <div style={{ position: "absolute", top: 10, left: 12, display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "10px", fontWeight: 700, color: THEME.dim, letterSpacing: "2px" }}>{title.toUpperCase()}</span>
                </div>
                <svg width={W} height={height} style={{ display: "block" }}>
                    {/* Grid lines */}
                    <line x1={PAD} y1={height / 2} x2={W - PAD} y2={height / 2} stroke={THEME.border} strokeWidth="1" strokeDasharray="4,4" />
                    <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
                    {/* Data points */}
                    {data.map((d, i) => (
                        <circle key={i} cx={PAD + (i / (N - 1)) * (W - PAD * 2)} cy={(height / 2) - (d[field] as number / (maxVal * 1.2)) * (height / 2)} r="2" fill={color} opacity="0.4" />
                    ))}
                </svg>
            </div>
        );
    };

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VII · TIME SERIES · §140</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Time Series Decomposition</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "A time series is a 'Chord' — Trend, Seasonality, and Noise harmonizing together."
                </p>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
                {[
                    { label: "Trend", val: trendScale, set: setTrendScale, c: THEME.trend },
                    { label: "Season", val: seasonScale, set: setSeasonScale, c: THEME.seasonal },
                    { label: "Noise", val: noiseScale, set: setNoiseScale, c: THEME.residual }
                ].map(s => (
                    <div key={s.label} style={{ flex: 1, background: THEME.surface, padding: "10px", borderRadius: "8px", border: `1px solid ${THEME.border}` }}>
                        <div style={{ fontSize: "9px", color: s.c, marginBottom: "8px" }}>{s.label.toUpperCase()} INTENSITY</div>
                        <input type="range" min="0" max="2" step="0.1" value={s.val} onChange={e => s.set(parseFloat(e.target.value))}
                            style={{ width: "100%", accentColor: s.c, cursor: "pointer" }} />
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <Sparkline title="Observed (Raw Data)" field="observed" color={THEME.observed} height={120} />
                <div style={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "14px", color: THEME.dim }}>=</div>
                </div>
                <Sparkline title="Trend" field="trend" color={THEME.trend} />
                <div style={{ height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "14px", color: THEME.dim }}>+</div>
                </div>
                <Sparkline title="Seasonal" field="seasonal" color={THEME.seasonal} />
                <div style={{ height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: "14px", color: THEME.dim }}>+</div>
                </div>
                <Sparkline title="Residual" field="residual" color={THEME.residual} />
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "15px", marginBottom: "20px" }}>
                <div style={{ flex: 1, background: "#0a0b14", border: `1px solid ${THEME.border}`, padding: "12px", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "12px", color: THEME.trend, margin: "0 0 6px" }}>Stationarity</h4>
                    <p style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.4", margin: 0 }}>
                        Models like ARIMA require constant mean/variance. Decomposition helps isolate components to achieve stationarity.
                    </p>
                </div>
                <div style={{ flex: 1, background: "#0a0b14", border: `1px solid ${THEME.border}`, padding: "12px", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "12px", color: THEME.residual, margin: "0 0 6px" }}>Fourier Analysis</h4>
                    <p style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.4", margin: 0 }}>
                        Complex seasonality can be broken down into multiple sine/cosine waves of different frequencies.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${THEME.trend}`, background: THEME.trend + "0f", maxWidth: "100%", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                <span style={{ color: THEME.trend }}>// Concept:</span> Classical decomposition (additive or multiplicative) is the first step in understanding the underlying drivers of a time series signal. By stripping away trend and seasonality, we can analyze the "white noise" (Residuals) for patterns that may indicate missing features.
            </div>
        </div>
    );
}

