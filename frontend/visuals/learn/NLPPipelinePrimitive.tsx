"use client";

import { useState, useRef } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    raw: "#94a3b8", token: "#60a5fa", clean: "#34d399",
    id: "#fbbf24", embed: "#a78bfa", out: "#f472b8",
};

const EXAMPLES = [
    "Hello! The cats are running quickly...",
    "I LOVE machine learning 😍 #AI",
    "Dr. Smith's 3.14 score isn't bad!",
];

const PIPELINE = [
    {
        id: "raw", label: "Raw Text", color: "#94a3b8", icon: "📝",
        desc: "Input string — messy, unstructured, mixed case and punctuation.",
        transform: (text: string) => [text],
    },
    {
        id: "lower", label: "Lowercase", color: "#60a5fa", icon: "🔡",
        desc: "Normalise case so 'Hello' and 'hello' are treated identically.",
        transform: (text: string) => [text.toLowerCase()],
    },
    {
        id: "clean", label: "Clean / Strip", color: "#34d399", icon: "🧹",
        desc: "Remove URLs, special chars, extra whitespace. Keep linguistic content.",
        transform: (text: string) => [text.toLowerCase().replace(/[^a-z0-9\s']/g, "").replace(/\s+/g, " ").trim()],
    },
    {
        id: "token", label: "Tokenize", color: "#fbbf24", icon: "✂️",
        desc: "Split into tokens (words or subwords). Each token is a unit of meaning.",
        transform: (text: string) => text.toLowerCase().replace(/[^a-z0-9\s']/g, "").replace(/\s+/g, " ").trim().split(" ").filter(Boolean),
    },
    {
        id: "stop", label: "Remove Stopwords", color: "#f472b8", icon: "🚫",
        desc: "Drop high-frequency words (the, is, are…) that carry little meaning.",
        transform: (text: string) => {
            const stops = new Set(["the", "a", "an", "is", "are", "am", "was", "were", "i", "it", "in", "on", "at", "to", "of", "and", "or", "but", "not", "this", "that", "these", "those", "be", "been", "being"]);
            return text.toLowerCase().replace(/[^a-z0-9\s']/g, "").replace(/\s+/g, " ").trim().split(" ").filter(w => !stops.has(w) && w.length > 0);
        },
    },
    {
        id: "stem", label: "Stem / Lemmatize", color: "#a78bfa", icon: "🌱",
        desc: "Reduce to root form: 'running'→'run', 'cats'→'cat', 'quickly'→'quick'.",
        transform: (text: string) => {
            const stops = new Set(["the", "a", "an", "is", "are", "am", "was", "were", "i", "it", "in", "on", "at", "to", "of", "and", "or", "but", "not", "this", "that"]);
            const stems: Record<string, string> = { "running": "run", "cats": "cat", "quickly": "quick", "loves": "love", "loved": "love", "machines": "machine", "learning": "learn", "bad": "bad", "score": "score", "hello": "hello", "isnt": "is not", "smiths": "smith", "dr": "doctor" };
            return text.toLowerCase().replace(/[^a-z0-9\s']/g, "").replace(/\s+/g, " ").trim().split(" ").filter(w => !stops.has(w) && w.length > 0).map(w => stems[w] || w);
        },
    },
    {
        id: "ids", label: "Token IDs", color: "#f87171", icon: "🔢",
        desc: "Map each token to a unique integer ID from the vocabulary dictionary.",
        transform: (text: string) => {
            const stops = new Set(["the", "a", "an", "is", "are", "am", "was", "were", "i", "it", "in", "on", "at", "to", "of", "and", "or", "but", "not", "this", "that"]);
            const stems: Record<string, string> = { "running": "run", "cats": "cat", "quickly": "quick", "loves": "love", "loved": "love", "machines": "machine", "learning": "learn" };
            const tokens = text.toLowerCase().replace(/[^a-z0-9\s']/g, "").replace(/\s+/g, " ").trim().split(" ").filter(w => !stops.has(w) && w.length > 0).map(w => stems[w] || w);
            const vocab = ["[PAD]", "[UNK]", "hello", "cat", "run", "quick", "machine", "learn", "love", "score", "bad", "doctor", "smith"];
            return tokens.map(t => { const i = vocab.indexOf(t); return i >= 0 ? i : 1; });
        },
    },
];

export default function NLPPipelinePrimitive() {
    const [inputText, setInputText] = useState(EXAMPLES[0]);
    const [step, setStep] = useState(0);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const currentStage = PIPELINE[step];
    const output = currentStage.transform(inputText);

    const runAnim = () => {
        setStep(0); setAnimating(true); let s = 0;
        function next() {
            s++;
            setStep(s);
            if (s < PIPELINE.length - 1) {
                timerRef.current = setTimeout(next, 700);
            } else {
                setAnimating(false);
            }
        }
        timerRef.current = setTimeout(next, 500);
    };
    const reset = () => { if (timerRef.current) clearTimeout(timerRef.current); setStep(0); setAnimating(false); };

    const isTokenArray = step >= 3;

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VII · NLP · §128</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>NLP Text Pipeline</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Raw text is chaos. The pipeline is civilisation — turning noise into structured signal."
                </p>
            </div>

            {/* Input selector */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap", justifyContent: "center" }}>
                {EXAMPLES.map((ex, i) => (
                    <button key={i} onClick={() => { setInputText(ex); reset(); }}
                        style={{ padding: "5px 12px", border: `1px solid ${inputText === ex ? "#60a5fa" : THEME.border}`, borderRadius: "4px", background: inputText === ex ? "#60a5fa22" : "transparent", color: inputText === ex ? "#60a5fa" : THEME.dim, fontSize: "10px", fontFamily: "inherit", cursor: "pointer", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ex.slice(0, 32)}…
                    </button>
                ))}
            </div>

            {/* Pipeline stages */}
            <div style={{ width: "100%", maxWidth: 700, margin: "0 auto" }}>
                {/* Stage stepper */}
                <div style={{ display: "flex", gap: 0, marginBottom: "16px", border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden" }}>
                    {PIPELINE.map((stage, i) => (
                        <button key={stage.id} onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setAnimating(false); setStep(i); }}
                            style={{ flex: 1, padding: "8px 4px", border: "none", borderRight: i < PIPELINE.length - 1 ? `1px solid ${THEME.border}` : "none", background: step === i ? stage.color + "22" : i < step ? stage.color + "0a" : "transparent", color: step === i ? stage.color : i < step ? stage.color + "66" : THEME.dim, cursor: "pointer", fontFamily: "inherit", fontSize: "11px", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", transition: "all 0.2s" }}>
                            <span style={{ fontSize: "14px" }}>{stage.icon}</span>
                            <span style={{ fontSize: "8px", lineHeight: 1.2, textAlign: "center", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{stage.label}</span>
                        </button>
                    ))}
                </div>

                {/* Stage info */}
                <div style={{ background: THEME.surface, border: `2px solid ${currentStage.color}`, borderRadius: "10px", padding: "16px", marginBottom: "14px", boxShadow: `0 0 24px ${currentStage.color}18`, transition: "border-color 0.3s, box-shadow 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "22px" }}>{currentStage.icon}</span>
                        <div>
                            <div style={{ fontSize: "14px", fontWeight: 700, color: currentStage.color }}>{currentStage.label}</div>
                            <div style={{ fontSize: "11px", color: THEME.dim, marginTop: "2px" }}>{currentStage.desc}</div>
                        </div>
                    </div>

                    {/* Output display */}
                    <div style={{ background: "#0a0b14", borderRadius: "6px", padding: "12px", border: `1px solid ${currentStage.color}33` }}>
                        <div style={{ fontSize: "9px", color: THEME.dim, letterSpacing: "2px", marginBottom: "8px" }}>OUTPUT ↓</div>
                        {isTokenArray ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {(output as (string | number)[]).map((token, i) => (
                                    <div key={i} style={{ padding: "4px 10px", border: `1px solid ${currentStage.color}66`, borderRadius: "4px", background: currentStage.color + "18", fontSize: "12px", color: currentStage.color, fontWeight: 700, transition: "all 0.3s" }}>
                                        {step === 6 ? (<><span style={{ fontSize: "9px", color: THEME.dim, display: "block", textAlign: "center" }}>id:{token}</span><span>{["[PAD]", "[UNK]", "hello", "cat", "run", "quick", "machine", "learn", "love", "score", "bad", "doctor", "smith"][token as number] ?? `id:${token}`}</span></>) : token}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: "13px", color: currentStage.color, lineHeight: 1.6, wordBreak: "break-all" }}>{(output as string[])[0]}</div>
                        )}
                    </div>

                    {isTokenArray && (
                        <div style={{ marginTop: "8px", fontSize: "10px", color: THEME.dim }}>
                            {(output as (string | number)[]).length} tokens {step === 6 ? `• vocab IDs` : `• ${step === 4 ? "stopwords removed" : "stemmed"}`}
                        </div>
                    )}
                </div>

                {/* Progress arrow */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", overflowX: "auto", paddingBottom: "8px" }}>
                    {PIPELINE.map((stage, i) => (
                        <div key={stage.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <div style={{ padding: "3px 8px", borderRadius: "3px", background: i <= step ? stage.color + "33" : THEME.border, border: `1px solid ${i <= step ? stage.color : THEME.border}`, fontSize: "9px", color: i <= step ? stage.color : THEME.dim, transition: "all 0.3s", whiteSpace: "nowrap" }}>
                                {stage.icon} {stage.label}
                            </div>
                            {i < PIPELINE.length - 1 && <div style={{ fontSize: "12px", color: i < step ? stage.color : THEME.dim, transition: "color 0.3s" }}>→</div>}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "16px" }}>
                <button onClick={runAnim} disabled={animating}
                    style={{ padding: "8px 22px", border: "none", borderRadius: "4px", background: animating ? THEME.dim : "#60a5fa", color: "#000", fontSize: "12px", fontFamily: "inherit", fontWeight: 700, cursor: animating ? "not-allowed" : "pointer", letterSpacing: "1px" }}>
                    {animating ? "PROCESSING…" : "▶ RUN PIPELINE"}
                </button>
                <button onClick={reset} style={{ padding: "8px 14px", border: `1px solid ${THEME.border}`, borderRadius: "4px", background: "transparent", color: THEME.dim, fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>↺</button>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${currentStage.color}`, background: currentStage.color + "0f", maxWidth: 700, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: currentStage.color }}>// {currentStage.label}:</span> {currentStage.desc} The pipeline moves from high-level linguistic constructs (words, semantics) to machine-readable numeric indices (Token IDs).
            </div>
        </div>
    );
}

