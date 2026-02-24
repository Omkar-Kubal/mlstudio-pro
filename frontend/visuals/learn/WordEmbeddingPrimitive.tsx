"use client";

import { useState, useEffect, useRef } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
};

interface WordNode {
    word: string;
    x: number;
    y: number;
    group: string;
    color: string;
}

// 2D PCA-projected word embeddings (realistic semantic positions)
const WORDS: WordNode[] = [
    // Royalty cluster
    { word: "king", x: 0.82, y: 0.78, group: "royalty", color: "#fbbf24" },
    { word: "queen", x: 0.30, y: 0.76, group: "royalty", color: "#fbbf24" },
    { word: "prince", x: 0.75, y: 0.60, group: "royalty", color: "#fbbf24" },
    { word: "princess", x: 0.25, y: 0.58, group: "royalty", color: "#fbbf24" },
    // Animals
    { word: "dog", x: 0.20, y: 0.30, group: "animals", color: "#34d399" },
    { word: "cat", x: 0.12, y: 0.20, group: "animals", color: "#34d399" },
    { word: "puppy", x: 0.28, y: 0.22, group: "animals", color: "#34d399" },
    { word: "kitten", x: 0.10, y: 0.12, group: "animals", color: "#34d399" },
    // Countries / capitals
    { word: "Paris", x: 0.65, y: 0.18, group: "places", color: "#60a5fa" },
    { word: "France", x: 0.72, y: 0.10, group: "places", color: "#60a5fa" },
    { word: "Berlin", x: 0.85, y: 0.20, group: "places", color: "#60a5fa" },
    { word: "Germany", x: 0.90, y: 0.12, group: "places", color: "#60a5fa" },
    // Actions
    { word: "walk", x: 0.45, y: 0.48, group: "verbs", color: "#f472b8" },
    { word: "run", x: 0.50, y: 0.38, group: "verbs", color: "#f472b8" },
    { word: "jump", x: 0.40, y: 0.40, group: "verbs", color: "#f472b8" },
    { word: "swim", x: 0.55, y: 0.45, group: "verbs", color: "#f472b8" },
];

const W = 440, H = 360;
const PAD = { top: 30, right: 20, bottom: 30, left: 20 };
const pW = W - PAD.left - PAD.right, pH = H - PAD.top - PAD.bottom;

function toX(x: number) { return PAD.left + x * pW; }
function toY(y: number) { return PAD.top + (1 - y) * pH; }

function cosSim(a: WordNode, b: WordNode) {
    // Approximate from 2D positions
    const ax = a.x - 0.5, ay = a.y - 0.5, bx = b.x - 0.5, by = b.y - 0.5;
    const dot = ax * bx + ay * by;
    const na = Math.hypot(ax, ay) || 0.001, nb = Math.hypot(bx, by) || 0.001;
    return dot / (na * nb);
}

// Famous analogy: king - man + woman ≈ queen
const ANALOGIES = [
    { a: "king", b: "queen", c: "man", d: "woman", label: "king − man + woman ≈ queen", color: "#fbbf24" },
    { a: "Paris", b: "France", c: "Berlin", d: "Germany", label: "Paris − France + Germany ≈ Berlin", color: "#60a5fa" },
    { a: "dog", b: "puppy", c: "cat", d: "kitten", label: "dog − puppy + kitten ≈ cat", color: "#34d399" },
];

export default function WordEmbeddingPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [analogy, setAnalogy] = useState(0);
    const [showGroups, setShowGroups] = useState(true);

    const an = ANALOGIES[analogy];

    useEffect(() => { draw(); }, [selected, analogy, showGroups]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        // Group ellipses
        if (showGroups) {
            const groups: Record<string, WordNode[]> = {};
            WORDS.forEach(w => { if (!groups[w.group]) groups[w.group] = []; groups[w.group].push(w); });
            Object.entries(groups).forEach(([g, ws]) => {
                const xs = ws.map(w => toX(w.x)), ys = ws.map(w => toY(w.y));
                const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
                const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + 22, ry = (Math.max(...ys) - Math.min(...ys)) / 2 + 22;
                ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.fillStyle = ws[0].color + "0e"; ctx.fill();
                ctx.strokeStyle = ws[0].color + "33"; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
                ctx.fillStyle = ws[0].color + "66"; ctx.font = "9px monospace"; ctx.textAlign = "left";
                ctx.fillText(g.toUpperCase(), Math.min(...xs) - 4, Math.min(...ys) - 10);
            });
        }

        // Analogy arrow
        const analogyNodes = [an.a, an.b, an.c, an.d].map(n => WORDS.find(w => w.word === n));
        const [wa, wb, wc, wd] = analogyNodes;
        if (wa && wb && wc && wd) {
            // Draw king→queen and man→woman arrows
            ([[wa, wb], [wc, wd]] as [WordNode, WordNode][]).forEach(([p1, p2]) => {
                ctx.beginPath(); ctx.moveTo(toX(p1.x), toY(p1.y)); ctx.lineTo(toX(p2.x), toY(p2.y));
                ctx.strokeStyle = an.color + "88"; ctx.lineWidth = 2;
                ctx.shadowColor = an.color; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
                const dx = toX(p2.x) - toX(p1.x), dy = toY(p2.y) - toY(p1.y);
                const len = Math.hypot(dx, dy) || 1;
                const hx = toX(p2.x) - dx / len * 8, hy = toY(p2.y) - dy / len * 8;
                ctx.beginPath(); ctx.moveTo(toX(p2.x), toY(p2.y));
                const perp = [-dy / len, dx / len];
                ctx.lineTo(hx + perp[0] * 4, hy + perp[1] * 4); ctx.lineTo(hx - perp[0] * 4, hy - perp[1] * 4);
                ctx.closePath(); ctx.fillStyle = an.color; ctx.fill();
            });
        }

        // Similarity line from selected
        if (selected) {
            const sw = WORDS.find(w => w.word === selected);
            if (sw) {
                WORDS.filter(w => w.word !== selected).slice(0, 5).sort((a, b) => cosSim(b, sw) - cosSim(a, sw)).slice(0, 3).forEach(w => {
                    const sim = cosSim(w, sw);
                    ctx.beginPath(); ctx.moveTo(toX(sw.x), toY(sw.y)); ctx.lineTo(toX(w.x), toY(w.y));
                    ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, (sim + 1) / 2) * 0.3})`; ctx.lineWidth = 1; ctx.stroke();
                });
            }
        }

        // Word nodes
        WORDS.forEach(w => {
            const cx = toX(w.x), cy = toY(w.y);
            const isSelected = selected === w.word;
            const isAnalogy = [an.a, an.b, an.c, an.d].includes(w.word);
            const r = isSelected ? 10 : isAnalogy ? 8 : 6;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = w.color + (isSelected ? "ff" : isAnalogy ? "cc" : "88");
            ctx.shadowColor = w.color; ctx.shadowBlur = isSelected ? 18 : isAnalogy ? 10 : 0;
            ctx.fill(); ctx.shadowBlur = 0;
            ctx.strokeStyle = isSelected ? "#fff" : w.color; ctx.lineWidth = isSelected ? 2 : 1; ctx.stroke();
            ctx.fillStyle = isSelected ? "#fff" : w.color;
            ctx.font = `${isSelected ? "bold " : ""}${isSelected ? 11 : 10}px 'SF Mono',monospace`;
            ctx.textAlign = w.x > 0.5 ? "right" : "left";
            ctx.fillText(w.word, cx + (w.x > 0.5 ? -r - 4 : r + 4), cy + 4);
        });

        // Axis labels
        ctx.fillStyle = THEME.dim; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("← PC2 →", W / 2, H - 6);
        ctx.save(); ctx.translate(8, H / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText("← PC1 →", 0, 0); ctx.restore();
        ctx.fillStyle = "#ffffff22"; ctx.font = "9px monospace"; ctx.textAlign = "right";
        ctx.fillText("2D PCA projection of 300-dim embeddings", W - PAD.right, PAD.top - 4);
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        const hit = WORDS.find(w => Math.hypot(cx - toX(w.x), cy - toY(w.y)) < 14);
        setSelected(hit ? hit.word : null);
    };

    const selectedWord = WORDS.find(w => w.word === selected);
    const nearest = selected && selectedWord ? [...WORDS].filter(w => w.word !== selected).sort((a, b) => cosSim(b, selectedWord) - cosSim(a, selectedWord)).slice(0, 4) : [];

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VII · NLP · §129</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Word Embeddings</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Word2Vec turns words into coordinates — similar words land near each other in vector space."
                </p>
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start", marginBottom: "20px" }}>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {/* Analogy selector */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                        {ANALOGIES.map((a, i) => (
                            <button key={i} onClick={() => setAnalogy(i)}
                                style={{ padding: "5px 10px", border: `1.5px solid ${analogy === i ? a.color : THEME.border}`, borderRadius: "4px", background: analogy === i ? a.color + "22" : "transparent", color: analogy === i ? a.color : THEME.dim, fontSize: "9px", fontFamily: "inherit", cursor: "pointer" }}>
                                {a.label}
                            </button>
                        ))}
                        <button onClick={() => setShowGroups(s => !s)}
                            style={{ padding: "5px 10px", border: `1px solid ${THEME.border}`, borderRadius: "4px", background: "transparent", color: THEME.dim, fontSize: "9px", fontFamily: "inherit", cursor: "pointer" }}>
                            {showGroups ? "Hide" : "Show"} clusters
                        </button>
                    </div>

                    <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden", cursor: "crosshair", background: THEME.surface }} onClick={handleClick}>
                        <canvas ref={canvasRef} width={W} height={H} style={{ display: "block" }} />
                    </div>
                    <div style={{ fontSize: "10px", color: THEME.dim, textAlign: "center" }}>← CLICK a word to find its nearest neighbours →</div>
                </div>

                {/* Right panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: 220 }}>

                    {/* Analogy detail */}
                    <div style={{ background: THEME.surface, border: `1px solid ${ANALOGIES[analogy].color}44`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: ANALOGIES[analogy].color, letterSpacing: "2px", marginBottom: "8px" }}>VECTOR ANALOGY</div>
                        <div style={{ fontFamily: "monospace", fontSize: "12px", lineHeight: 2.2, color: THEME.text }}>
                            <div><span style={{ color: ANALOGIES[analogy].color, fontWeight: 700 }}>{an.a}</span> − <span style={{ color: THEME.dim }}>{an.c}</span></div>
                            <div style={{ color: THEME.dim, fontSize: "10px" }}>vector offset:</div>
                            <div>+ <span style={{ color: THEME.dim }}>{an.d}</span></div>
                            <div style={{ marginTop: 4 }}>≈ <span style={{ color: ANALOGIES[analogy].color, fontWeight: 700, fontSize: "14px" }}>{an.b}</span></div>
                        </div>
                        <div style={{ fontSize: "9px", color: THEME.dim, marginTop: "8px", lineHeight: 1.6 }}>
                            The direction "male→female" is consistent across the space. Arithmetic in embedding space encodes relationships.
                        </div>
                    </div>

                    {/* Nearest neighbours */}
                    {selected && selectedWord && (
                        <div style={{ background: THEME.surface, border: `1px solid ${selectedWord.color}44`, borderRadius: "8px", padding: "12px 14px" }}>
                            <div style={{ fontSize: "10px", color: selectedWord.color, letterSpacing: "2px", marginBottom: "8px" }}>NEAREST TO "{selected}"</div>
                            {(nearest as WordNode[]).map(w => {
                                const sim = (cosSim(w, selectedWord) + 1) / 2;
                                return (
                                    <div key={w.word} style={{ marginBottom: "6px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "2px" }}>
                                            <span style={{ color: w.color }}>{w.word}</span>
                                            <span style={{ color: THEME.dim }}>{(sim * 100).toFixed(0)}%</span>
                                        </div>
                                        <div style={{ height: 5, background: "#1e1e35", borderRadius: "2px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${sim * 100}%`, background: w.color, borderRadius: "2px" }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Concept explanation */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "8px" }}>KEY IDEAS</div>
                        {[
                            { label: "Distributional hypothesis", desc: "Words in similar contexts have similar meaning" },
                            { label: "Skip-gram training", desc: "Predict context words from center word" },
                            { label: "300-dim vectors", desc: "Each word = point in 300D space" },
                            { label: "Semantic arithmetic", desc: "king−man+woman≈queen encodes gender" },
                        ].map(({ label, desc }) => (
                            <div key={label} style={{ marginBottom: "7px" }}>
                                <div style={{ fontSize: "10px", color: "#60a5fa", fontWeight: 700 }}>{label}</div>
                                <div style={{ fontSize: "9px", color: THEME.dim, lineHeight: 1.5 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${ANALOGIES[analogy].color}`, background: ANALOGIES[analogy].color + "0f", maxWidth: 700, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: ANALOGIES[analogy].color }}>// Analogy:</span> The PCA projection above shows how words clusters naturally. The arrows represent vector subtraction and addition, demonstrating that "meaning" is represented by consistent directions in the hidden high-dimensional space.
            </div>
        </div>
    );
}

