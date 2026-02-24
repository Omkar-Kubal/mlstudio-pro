"use client";

import { useState, useEffect, useRef } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    pixel: "#60a5fa", filter: "#fbbf24", output: "#34d399", pool: "#f472b8",
};

const INPUT = [
    [1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1],
];

const FILTER = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
];

function convolve(input: number[][], filter: number[][], stride = 1) {
    const inH = input.length, inW = input[0].length;
    const fH = filter.length, fW = filter[0].length;
    const outH = Math.floor((inH - fH) / stride) + 1;
    const outW = Math.floor((inW - fW) / stride) + 1;
    return Array.from({ length: outH }, (_, i) =>
        Array.from({ length: outW }, (_, j) => {
            let s = 0;
            for (let fi = 0; fi < fH; fi++) for (let fj = 0; fj < fW; fj++)
                s += input[i * stride + fi][j * stride + fj] * filter[fi][fj];
            return s;
        })
    );
}

function maxPool(fm: number[][], size = 2) {
    const h = Math.floor(fm.length / size), w = Math.floor(fm[0].length / size);
    return Array.from({ length: h }, (_, i) =>
        Array.from({ length: w }, (_, j) => {
            let mx = -Infinity;
            for (let pi = 0; pi < size; pi++) for (let pj = 0; pj < size; pj++)
                mx = Math.max(mx, fm[i * size + pi][j * size + pj]);
            return mx;
        })
    );
}

const CONV_OUT = convolve(INPUT, FILTER);
const POOL_OUT = maxPool(CONV_OUT);

export default function CNNPrimitive() {
    const [scanPos, setScanPos] = useState({ r: 0, c: 0 });
    const [phase, setPhase] = useState("input"); // input | conv | pool | flat
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const CELL = 32;

    const runAnim = () => {
        setPhase("input"); setScanPos({ r: 0, c: 0 }); setAnimating(true);
        const outR = CONV_OUT.length, outC = CONV_OUT[0].length;
        const positions = [...Array.from({ length: outR }, (_, r) => Array.from({ length: outC }, (_, c) => ({ r, c }))).flat()];
        let i = 0;
        function step() {
            if (i < positions.length) {
                setPhase("conv"); setScanPos(positions[i]); i++;
                timerRef.current = setTimeout(step, 180);
            } else {
                setPhase("pool");
                setTimeout(() => { setPhase("flat"); setAnimating(false); }, 800);
            }
        }
        timerRef.current = setTimeout(step, 300);
    };
    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    const Grid = ({ data, label, color, highlight, highlightCell, scale = 1 }: { data: number[][], label: string, color: string, highlight?: { r: number, c: number } | null, highlightCell?: { r: number, c: number } | null, scale?: number }) => {
        const cellSize = CELL * scale;
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "9px", color: THEME.dim, letterSpacing: "2px" }}>{label}</div>
                <div style={{ display: "inline-flex", flexDirection: "column", gap: 1, border: `1px solid ${color}44`, borderRadius: "4px", padding: 3, background: THEME.surface }}>
                    {data.map((row, ri) => (
                        <div key={ri} style={{ display: "flex", gap: 1 }}>
                            {row.map((v, ci) => {
                                const isHL = highlight && ri >= highlight.r && ri < highlight.r + 3 && ci >= highlight.c && ci < highlight.c + 3;
                                const isCell = highlightCell && ri === highlightCell.r && ci === highlightCell.c;
                                const intensity = Math.min(1, Math.max(0, v / 5));
                                return (
                                    <div key={ci} style={{
                                        width: cellSize, height: cellSize, borderRadius: 2,
                                        background: isCell ? color : isHL ? color + "44" : `${color}${Math.round(intensity * 255).toString(16).padStart(2, "0")}`,
                                        border: `1px solid ${isHL || isCell ? color : color + "22"}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all 0.1s",
                                        fontSize: cellSize > 20 ? 8 : 6, color: "#fff", fontWeight: 700,
                                        boxShadow: isHL ? `0 0 6px ${color}55` : "none"
                                    }}>
                                        {cellSize > 22 ? v : null}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: "9px", color, textAlign: "center" }}>{data.length}\u00D7{data[0].length}</div>
            </div>
        );
    };

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · DEEP LEARNING · §73</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>CNN Architecture</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "A convolution filter is a Flashlight sliding across the image, lighting up patterns it recognises."
                </p>
            </div>

            {/* Pipeline labels */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap", justifyContent: "center" }}>
                {[
                    { label: "Input", color: THEME.pixel },
                    { label: "\u2192", color: THEME.dim },
                    { label: "Conv + ReLU", color: THEME.filter },
                    { label: "\u2192", color: THEME.dim },
                    { label: "Max Pool", color: THEME.pool },
                    { label: "\u2192", color: THEME.dim },
                    { label: "Flatten", color: THEME.output },
                ].map(({ label, color }, i) => (
                    <div key={i} style={{ fontSize: "10px", color, fontWeight: label === "\u2192" ? 400 : 700, letterSpacing: "1px" }}>{label}</div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
                {/* Input */}
                <Grid data={INPUT} label="INPUT IMAGE 7\u00D77" color={THEME.pixel}
                    highlight={phase !== "input" ? scanPos : null} />

                {/* Filter */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", alignSelf: "center" }}>
                    <div style={{ fontSize: "9px", color: THEME.dim, letterSpacing: "1px" }}>FILTER 3\u00D73</div>
                    <div style={{ display: "inline-flex", flexDirection: "column", gap: 1, border: `2px solid ${THEME.filter}`, borderRadius: "4px", padding: 3, background: THEME.filter + "18", boxShadow: `0 0 16px ${THEME.filter}33` }}>
                        {FILTER.map((row, ri) => (
                            <div key={ri} style={{ display: "flex", gap: 1 }}>
                                {row.map((v, ci) => (
                                    <div key={ci} style={{ width: CELL, height: CELL, borderRadius: 2, background: v ? THEME.filter + "88" : "#1e1e35", border: `1px solid ${THEME.filter}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>{v}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ fontSize: "9px", color: THEME.filter }}>learned weights</div>
                    <div style={{ fontSize: "16px", color: THEME.dim }}>\u229B</div>
                </div>

                {/* Conv output */}
                <Grid data={CONV_OUT.map(row => row.map(v => Math.max(0, v)))} label="FEATURE MAP 5\u00D75" color={THEME.filter}
                    highlightCell={phase === "conv" ? scanPos : null} scale={1.1} />

                {/* Pool output */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", alignSelf: "center" }}>
                    <div style={{ fontSize: "12px", color: THEME.dim }}>\u2193 MaxPool 2\u00D72</div>
                    <Grid data={POOL_OUT} label="POOLED 2\u00D72" color={THEME.pool}
                        highlight={phase === "pool" || phase === "flat" ? null : undefined} scale={1.4} />
                </div>

                {/* Flat */}
                {(phase === "flat" || phase === "pool") && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", alignSelf: "center" }}>
                        <div style={{ fontSize: "9px", color: THEME.dim, letterSpacing: "1px" }}>FLATTEN</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {POOL_OUT.flat().map((v, i) => (
                                <div key={i} style={{ width: 44, height: 20, borderRadius: 2, background: THEME.output + "33", border: `1px solid ${THEME.output}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: THEME.output, fontWeight: 700, transition: "all 0.3s", opacity: phase === "flat" ? 1 : 0 }}>
                                    {v.toFixed(0)}
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: "9px", color: THEME.output }}>{POOL_OUT.flat().length} neurons \u2192 FC</div>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "18px", justifyContent: "center" }}>
                <button onClick={runAnim} disabled={animating}
                    style={{ padding: "8px 22px", border: "none", borderRadius: "4px", background: animating ? THEME.dim : THEME.filter, color: "#000", fontSize: "12px", fontFamily: "inherit", fontWeight: 700, cursor: animating ? "not-allowed" : "pointer", letterSpacing: "1px" }}>
                    {animating ? "SCANNING\u2026" : "\u25B6 SLIDE FILTER"}
                </button>
                <button onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setPhase("input"); setScanPos({ r: 0, c: 0 }); setAnimating(false); }}
                    style={{ padding: "8px 14px", border: `1px solid ${THEME.border}`, borderRadius: "4px", background: "transparent", color: THEME.dim, fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>\u21BA</button>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${THEME.filter}`, background: THEME.filter + "0f", maxWidth: 800, margin: "0 auto", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                <span style={{ color: THEME.filter }}>// HOW IT WORKS:</span> The yellow filter slides across the input. At each position, element-wise multiply + sum \u2192 one output value. ReLU zeroes negatives. MaxPool downsamples by taking the max in each 2\u00D72 window. Flatten \u2192 fully-connected layer.
            </div>
        </div>
    );
}

