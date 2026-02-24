"use client";

import { useState, useEffect, useRef } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    q: "#f472b8", k: "#60a5fa", v: "#34d399", attn: "#fbbf24",
};

const SENTENCE = ["The", "cat", "sat", "on", "the", "mat"];
const N = SENTENCE.length;

function softmax(arr: number[]) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((s, e) => s + e, 0);
    return exps.map(e => e / sum);
}

// Simulate Q\u22C5K^T attention scores
const RAW_SCORES = [
    [3.2, 0.8, 0.4, 0.2, 2.8, 0.5],  // "The" attends mostly to "the"
    [0.6, 3.5, 2.1, 0.3, 0.4, 1.8],  // "cat" attends to "cat","sat","mat"
    [0.4, 2.3, 3.8, 0.8, 0.3, 1.4],  // "sat" attends to "sat","cat"
    [0.2, 0.3, 0.7, 3.1, 0.2, 0.9],  // "on" attends to "on"
    [2.9, 0.5, 0.3, 0.2, 3.3, 0.4],  // "the" attends to "the","The"
    [0.5, 1.9, 1.6, 0.8, 0.4, 3.6],  // "mat" attends to "mat","cat","sat"
];

const ATTN = RAW_SCORES.map(row => softmax(row));

export default function AttentionPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [queryWord, setQueryWord] = useState(1); // "cat"
    const [dim, setDim] = useState(64);

    const attnRow = ATTN[queryWord];

    useEffect(() => { draw(); }, [queryWord, dim]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const CW = canvas.width, CH = canvas.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, CW, CH);
        ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, CW, CH);

        const CELL = Math.floor(Math.min(CW, CH - 30) / (N + 1.5));
        const OFFSET = 64;

        // Draw full attention matrix
        ATTN.forEach((row, qi) => {
            row.forEach((score, ki) => {
                const isQueryRow = qi === queryWord;
                const x = OFFSET + ki * CELL, y = 30 + qi * CELL;
                const intensity = score;
                ctx.fillStyle = `rgba(251,191,36,${isQueryRow ? intensity : intensity * 0.3})`;
                ctx.fillRect(x, y, CELL - 2, CELL - 2);
                ctx.strokeStyle = isQueryRow ? THEME.attn + "88" : "#ffffff08";
                ctx.lineWidth = isQueryRow ? 1.5 : 0.5; ctx.strokeRect(x, y, CELL - 2, CELL - 2);
                // Score text
                if (CELL > 28) {
                    ctx.fillStyle = isQueryRow ? "#000" : "#ffffff44";
                    ctx.font = `${isQueryRow ? "bold " : ""}${CELL > 36 ? 9 : 8}px monospace`;
                    ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(score.toFixed(2), x + CELL / 2, y + CELL / 2);
                    ctx.textBaseline = "alphabetic";
                }
            });
        });

        // Row/col labels
        ctx.font = "10px 'SF Mono',monospace"; ctx.textAlign = "right";
        SENTENCE.forEach((w, i) => {
            const isQ = i === queryWord;
            ctx.fillStyle = isQ ? THEME.q : THEME.dim;
            ctx.fillText(w, OFFSET - 6, 30 + i * CELL + CELL / 2 + 4);
        });
        ctx.textAlign = "center";
        SENTENCE.forEach((w, i) => {
            ctx.fillStyle = THEME.k;
            ctx.fillText(w, OFFSET + i * CELL + CELL / 2, 24);
        });

        // Query indicator
        ctx.fillStyle = THEME.q + "22";
        ctx.fillRect(2, 30 + queryWord * CELL, OFFSET - 4, CELL - 2);
        ctx.fillStyle = THEME.q; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
        ctx.fillText("Q\u2192", OFFSET / 2, 30 + queryWord * CELL + CELL / 2 + 3);

        // Axis labels
        ctx.fillStyle = THEME.dim; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("Keys (K) \u2014 attended TO", OFFSET + N * CELL / 2, CH - 6);
        ctx.save(); ctx.translate(13, 30 + N * CELL / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText("Queries (Q) \u2014 attending FROM", 0, 0); ctx.restore();
    }

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · DEEP LEARNING · §75</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Attention Mechanism</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Attention lets every word ask: which other words should I pay attention to right now?"
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", width: "100%" }}>

                {/* Attention heatmap */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", textAlign: "center" }}>ATTENTION MATRIX softmax(QK^T / \u221Ad)</div>
                    <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden", background: THEME.surface }}>
                        <canvas ref={canvasRef} width={420} height={280} style={{ display: "block" }} />
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", fontSize: "10px" }}>
                        {[{ color: THEME.q, label: "Query row" }, { color: THEME.k, label: "Key col" }, { color: THEME.attn, label: "Attention score" }].map(({ color, label }) => (
                            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{ width: 10, height: 10, borderRadius: "2px", background: color }} />
                                <span style={{ color: THEME.dim }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel */}
                <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "12px" }}>

                    {/* Query selector */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "8px" }}>QUERY WORD</div>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {SENTENCE.map((w, i) => (
                                <button key={i} onClick={() => setQueryWord(i)}
                                    style={{ padding: "4px 10px", border: `1.5px solid ${queryWord === i ? THEME.q : THEME.border}`, borderRadius: "4px", background: queryWord === i ? THEME.q + "22" : "transparent", color: queryWord === i ? THEME.q : THEME.dim, fontSize: "11px", fontFamily: "inherit", cursor: "pointer" }}>
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Attention weights for selected query */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.q}44`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.q, letterSpacing: "2px", marginBottom: "10px" }}>
                            "{SENTENCE[queryWord]}" ATTENDS TO\u2026
                        </div>
                        {SENTENCE.map((word, ki) => {
                            const score = attnRow[ki];
                            return (
                                <div key={ki} style={{ marginBottom: "7px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                                        <span style={{ color: ki === queryWord ? THEME.attn : THEME.text }}>{word}</span>
                                        <span style={{ color: THEME.attn, fontWeight: 700 }}>{(score * 100).toFixed(1)}%</span>
                                    </div>
                                    <div style={{ height: 8, background: "#1e1e35", borderRadius: "4px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${score * 100}%`, background: `linear-gradient(90deg,${THEME.attn}88,${THEME.attn})`, borderRadius: "4px", transition: "width 0.4s" }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Formula */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "8px" }}>FORMULA</div>
                        <div style={{ fontSize: "11px", fontFamily: "monospace", lineHeight: 2.2 }}>
                            <div><span style={{ color: THEME.q }}>Q</span> = W_Q \u22C5 x <span style={{ color: THEME.dim }}>(what I want)</span></div>
                            <div><span style={{ color: THEME.k }}>K</span> = W_K \u22C5 x <span style={{ color: THEME.dim }}>(what I have)</span></div>
                            <div><span style={{ color: THEME.v }}>V</span> = W_V \u22C5 x <span style={{ color: THEME.dim }}>(what I give)</span></div>
                            <div style={{ marginTop: 6, color: "#fff" }}>
                                Attn = softmax(QKᵀ / \u221Ad) \u22C5 V
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* √d slider */}
            <div style={{ width: "100%", maxWidth: 1000, margin: "20px auto 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: THEME.dim, marginBottom: "4px" }}>
                    <span>Dimension d (scaling factor)</span>
                    <span style={{ color: THEME.attn }}>\u221Ad = {Math.sqrt(dim).toFixed(1)}</span>
                </div>
                <input type="range" min={4} max={256} step={4} value={dim}
                    onChange={e => setDim(+e.target.value)}
                    style={{ width: "100%", accentColor: THEME.attn, cursor: "pointer" }} />
                <div style={{ fontSize: "9px", color: THEME.dim, marginTop: "3px" }}>Larger d \u2192 softer attention (prevents gradient vanishing/explosion)</div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${THEME.attn}`, background: THEME.attn + "0f", maxWidth: 800, margin: "14px auto 0", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                <span style={{ color: THEME.attn }}>// INSIGHT:</span> Each row of the attention matrix is a probability distribution. "cat" attends to "sat" and "mat" \u2014 semantically related tokens over which information is pooled.
            </div>
        </div>
    );
}

