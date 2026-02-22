"use client";

import { useState, useRef, useEffect } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    embed: "#60a5fa", attn: "#fbbf24", ff: "#a78bfa",
    norm: "#34d399", residual: "#f472b8",
};

const TOKENS = ["The", "cat", "sat", "on", "mat"];

interface TransformerBlock {
    id: string;
    label: string;
    color: string;
    icon: string;
    desc: string;
    formula: string;
    outputShape: string;
}

const BLOCKS: TransformerBlock[] = [
    {
        id: "embed", label: "Embedding",
        color: "#60a5fa", icon: "📍",
        desc: "Each token \u2192 dense vector + sine/cosine positional encoding. Position matters!",
        formula: "E(x) = TokenEmbed(x) + PosEncode(t)",
        outputShape: "[5 \u00D7 512]",
    },
    {
        id: "norm1", label: "Layer Norm \u2460",
        color: "#34d399", icon: "\u229F",
        desc: "Normalise each token's embedding to mean=0, std=1. Stabilises training.",
        formula: "LN(x) = (x \u2212 \u03BC) / \u03C3 \u22C5 \u03B3 + \u03B2",
        outputShape: "[5 \u00D7 512]",
    },
    {
        id: "mha", label: "Multi-Head Attention",
        color: "#fbbf24", icon: "\uD83D\uDC41\uFE0F",
        desc: "H attention heads run in parallel. Each learns different relationship types.",
        formula: "MHA = Concat(head\u2081\u2026head\u2099) \u22C5 W_O",
        outputShape: "[5 \u00D7 512]",
    },
    {
        id: "res1", label: "Residual \u2460",
        color: "#f472b8", icon: "\u2295",
        desc: "Skip connection: x + Attn(x). Prevents vanishing gradients, lets features flow.",
        formula: "x \u2190 x + Attn(LN(x))",
        outputShape: "[5 \u00D7 512]",
    },
    {
        id: "norm2", label: "Layer Norm \u2461",
        color: "#34d399", icon: "\u229F",
        desc: "Second normalisation before the pointwise feed-forward sublayer.",
        formula: "LN(x) = (x \u2212 \u03BC) / \u03C3 \u22C5 \u03B3 + \u03B2",
        outputShape: "[5 \u00D7 512]",
    },
    {
        id: "ffn", label: "Pointwise FFN",
        color: "#a78bfa", icon: "\u2699\uFE0F",
        desc: "Two linear layers with GELU. Projects to 4\u00D7 width (2048), then back to 512.",
        formula: "FFN(x) = GELU(xW\u2081+b\u2081)W\u2082+b\u2082",
        outputShape: "[5 \u00D7 512]",
    },
    {
        id: "res2", label: "Residual \u2461",
        color: "#f472b8", icon: "\u2295",
        desc: "The final skip connection for the block. Ready for the next stack.",
        formula: "x \u2190 x + FFN(LN(x))",
        outputShape: "[5 \u00D7 512]",
    },
];

export default function TransformerPrimitive() {
    const [activeBlock, setActiveBlock] = useState(0);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const block = BLOCKS[activeBlock];

    const runAnim = () => {
        setActiveBlock(0); setAnimating(true); let b = 0;
        function next() {
            b++;
            if (b < BLOCKS.length) {
                setActiveBlock(b);
                timerRef.current = setTimeout(next, 700);
            } else setAnimating(false);
        }
        timerRef.current = setTimeout(next, 600);
    };
    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · DEEP LEARNING · §76</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Transformer Encoder Block</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "The Transformer is Attention + skip connections + normalisation \u2014 stacked N times."
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", width: "100%" }}>

                {/* Vertical block diagram */}
                <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "center" }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "8px" }}>BLOCK STACK</div>

                    {/* Input tokens */}
                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                        {TOKENS.map((t, i) => (
                            <div key={i} style={{ padding: "3px 7px", background: "#1e1e35", border: `1px solid #ffffff22`, borderRadius: "3px", fontSize: "9px", color: THEME.dim }}>{t}</div>
                        ))}
                    </div>
                    <div style={{ fontSize: "14px", color: THEME.dim }}>\u2193</div>

                    {BLOCKS.map((b, i) => {
                        const isActive = activeBlock === i;
                        const isPast = i < activeBlock;
                        const color = b.color;
                        return (
                            <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                                <button onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setAnimating(false); setActiveBlock(i); }}
                                    style={{ width: 220, padding: "10px 14px", border: `2px solid ${isActive ? color : isPast ? color + "44" : THEME.border}`, borderRadius: "6px", background: isActive ? color + "22" : isPast ? color + "0a" : THEME.surface, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.3s", boxShadow: isActive ? `0 0 18px ${color}44` : "none" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "14px" }}>{b.icon}</span>
                                        <div>
                                            <div style={{ fontSize: "10px", color: isActive ? color : isPast ? color + "88" : THEME.dim, fontWeight: isActive ? 700 : 400, letterSpacing: "0.5px" }}>{b.label}</div>
                                            <div style={{ fontSize: "8px", color: THEME.dim, marginTop: "2px", fontFamily: "monospace" }}>{b.outputShape}</div>
                                        </div>
                                    </div>
                                </button>
                                {i < BLOCKS.length - 1 && (
                                    <div style={{ width: 2, height: 10, background: isPast ? color + "55" : "#ffffff0a", margin: "0 auto", transition: "background 0.3s" }} />
                                )}
                            </div>
                        );
                    })}

                    <div style={{ fontSize: "14px", color: THEME.dim, marginTop: 6 }}>\u2193</div>
                    <div style={{ padding: "5px 14px", background: "#1e1e35", border: `1px solid ${THEME.border}`, borderRadius: "4px", fontSize: "9px", color: THEME.dim }}>Next Block in Stack (N\u00D7)</div>
                </div>

                {/* Detail panel */}
                <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: "10px" }}>

                    {/* Active block info */}
                    <div style={{ background: THEME.surface, border: `2px solid ${block.color}`, borderRadius: "10px", padding: "16px", boxShadow: `0 0 24px ${block.color}22` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <span style={{ fontSize: "24px" }}>{block.icon}</span>
                            <div>
                                <div style={{ fontSize: "12px", color: block.color, fontWeight: 700 }}>{block.label}</div>
                                <div style={{ fontSize: "9px", color: THEME.dim, fontFamily: "monospace", marginTop: "2px" }}>{block.outputShape}</div>
                            </div>
                        </div>
                        <div style={{ fontSize: "11px", color: THEME.dim, lineHeight: 1.7, marginBottom: "8px", minHeight: "40px" }}>{block.desc}</div>
                        <div style={{ padding: "7px 10px", background: block.color + "18", borderRadius: "4px", fontFamily: "monospace", fontSize: "10px", color: block.color }}>{block.formula}</div>
                    </div>

                    {/* Token representations */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "8px" }}>TOKEN REPRESENTATIONS</div>
                        {TOKENS.map((token, i) => {
                            const vals = Array.from({ length: 6 }, (_, j) => ((Math.sin(i * 1.5 + j * 0.8 + activeBlock * 0.5) + 1) / 2));
                            return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                                    <div style={{ width: 28, fontSize: "10px", color: block.color, fontWeight: 700 }}>{token}</div>
                                    <div style={{ flex: 1, display: "flex", gap: 2 }}>
                                        {vals.map((v, j) => (
                                            <div key={j} style={{ flex: 1, height: 16, background: `${block.color}${Math.round(v * 200).toString(16).padStart(2, "0")}`, borderRadius: 2, transition: "background 0.4s" }} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: "8px", color: THEME.dim }}>d_model=512</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "10px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "1px", marginBottom: "6px" }}>SUB-LAYER {activeBlock + 1} / {BLOCKS.length}</div>
                        <div style={{ display: "flex", gap: 4 }}>
                            {BLOCKS.map((_, i) => (
                                <div key={i} style={{ flex: 1, height: 6, borderRadius: "3px", background: i <= activeBlock ? BLOCKS[i].color : "#1e1e35", transition: "background 0.3s" }} />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button onClick={runAnim} disabled={animating}
                            style={{ flex: 1, padding: "8px 14px", border: "none", borderRadius: "4px", background: animating ? THEME.dim : "#fbbf24", color: "#000", fontSize: "12px", fontFamily: "inherit", fontWeight: 700, cursor: animating ? "not-allowed" : "pointer", letterSpacing: "1px" }}>
                            {animating ? "AUTO-STEPPING\u2026" : "\u25B6 RUN ANIMATION"}
                        </button>
                        <button onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setActiveBlock(0); setAnimating(false); }}
                            style={{ padding: "8px 14px", border: `1px solid ${THEME.border}`, borderRadius: "4px", background: "transparent", color: THEME.dim, fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>\u21BA</button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", width: "100%", fontSize: "10px" }}>
                {[
                    { color: THEME.embed, label: "Embedding" },
                    { color: THEME.norm, label: "LayerNorm" },
                    { color: THEME.attn, label: "Attention" },
                    { color: THEME.ff, label: "FFN" },
                    { color: THEME.residual, label: "Residual \u2295" },
                ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "2px", background: color }} />
                        <span style={{ color: THEME.dim }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
