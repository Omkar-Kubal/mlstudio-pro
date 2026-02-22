"use client";

import { useState, useRef, useEffect } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    input: "#60a5fa", hidden: "#a78bfa", output: "#34d399",
    gate: "#fbbf24", forget: "#f87171",
};

const SEQUENCE = ["The", "cat", "sat", "on", "the", "mat"];
const HIDDEN_SIZE = 4;

function tanh(x: number) { return Math.tanh(x); }

// Simulate simple RNN hidden states
function runRNN(words: string[]) {
    let h = Array(HIDDEN_SIZE).fill(0);
    const states = [h];
    const Wx = Array.from({ length: HIDDEN_SIZE }, () => Array.from({ length: 1 }, () => (Math.random() - 0.5)));
    const Wh = Array.from({ length: HIDDEN_SIZE }, () => Array.from({ length: HIDDEN_SIZE }, () => (Math.random() - 0.5) * 0.8));
    words.forEach((w, t) => {
        const embedding = (w.charCodeAt(0) / 128);
        h = Array.from({ length: HIDDEN_SIZE }, (_, i) =>
            tanh(Wx[i][0] * embedding + Wh[i].reduce((s, weight, j) => s + weight * h[j], 0))
        );
        states.push([...h]);
    });
    return states;
}

const RNN_STATES = runRNN(SEQUENCE);

const MODES = [
    { key: "rnn", label: "Vanilla RNN", color: "#a78bfa", desc: "Simple recurrence \u2014 short memory" },
    { key: "lstm", label: "LSTM", color: "#34d399", desc: "Gated memory cells \u2014 long-range deps" },
    { key: "gru", label: "GRU", color: "#f472b8", desc: "Simplified LSTM \u2014 fewer params" },
];

function LSTMGates({ step }: { step: number }) {
    const gates = [
        { name: "Forget Gate", symbol: "\u03C3(f)", color: "#f87171", val: (0.3 + step * 0.1).toFixed(2), desc: "How much to erase from cell state" },
        { name: "Input Gate", symbol: "\u03C3(i)", color: "#60a5fa", val: (0.7 - step * 0.05).toFixed(2), desc: "How much new info to write" },
        { name: "Output Gate", symbol: "\u03C3(o)", color: "#34d399", val: (0.5 + step * 0.06).toFixed(2), desc: "What to expose as hidden state" },
    ];
    return (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
            {gates.map(g => (
                <div key={g.name} style={{ flex: "1 1 130px", padding: "8px 10px", border: `1px solid ${g.color}44`, borderRadius: "6px", background: g.color + "10" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", color: g.color, fontWeight: 700 }}>{g.name} {g.symbol}</span>
                        <span style={{ fontSize: "11px", color: g.color, fontWeight: 700 }}>{Math.min(1, Math.max(0, parseFloat(g.val))).toFixed(2)}</span>
                    </div>
                    <div style={{ height: 6, background: "#1e1e35", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, parseFloat(g.val) * 100))}%`, background: g.color, borderRadius: "3px", transition: "width 0.4s" }} />
                    </div>
                    <div style={{ fontSize: "9px", color: THEME.dim, marginTop: "4px" }}>{g.desc}</div>
                </div>
            ))}
        </div>
    );
}

export default function RNNPrimitive() {
    const [mode, setMode] = useState("rnn");
    const [step, setStep] = useState(0);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const m = MODES.find(x => x.key === mode)!;
    const currentWord = SEQUENCE[step] ?? "\u2014";
    const currentH = RNN_STATES[step + 1] ?? RNN_STATES[0];
    const maxH = Math.max(...currentH.map(Math.abs), 0.1);

    const runAnim = () => {
        setStep(0); setAnimating(true); let s = 0;
        function next() {
            s++; setStep(s);
            if (s < SEQUENCE.length) { timerRef.current = setTimeout(next, 600); }
            else setAnimating(false);
        }
        timerRef.current = setTimeout(next, 400);
    };
    const reset = () => { if (timerRef.current) clearTimeout(timerRef.current); setStep(0); setAnimating(false); };

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · DEEP LEARNING · §74</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Recurrent Neural Networks</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "An RNN is a reader with a notepad \u2014 it updates its notes with each word, carrying memory forward."
                </p>
            </div>

            {/* Mode tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px", justifyContent: "center" }}>
                {MODES.map(mo => (
                    <button key={mo.key} onClick={() => { setMode(mo.key); reset(); }}
                        style={{ padding: "6px 14px", border: `1.5px solid ${mode === mo.key ? mo.color : THEME.border}`, borderRadius: "4px", background: mode === mo.key ? mo.color + "22" : "transparent", color: mode === mo.key ? mo.color : THEME.dim, fontSize: "11px", fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s" }}>
                        {mo.label}
                    </button>
                ))}
            </div>

            {/* Unrolled RNN diagram */}
            <div style={{ width: "100%", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "10px", textAlign: "center" }}>UNROLLED THROUGH TIME</div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", overflowX: "auto", justifyContent: "center", padding: "10px" }}>
                    {SEQUENCE.map((word, t) => {
                        const isActive = t === step;
                        const isPast = t < step;
                        const color = m.color;
                        const h = RNN_STATES[t + 1];
                        return (
                            <div key={t} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                                    {/* Input token */}
                                    <div style={{ padding: "4px 8px", background: isActive ? "#60a5fa22" : isPast ? "#60a5fa0a" : THEME.border, border: `1px solid ${isActive ? "#60a5fa" : isPast ? "#60a5fa44" : THEME.border}`, borderRadius: "4px", fontSize: "10px", color: isActive ? "#60a5fa" : isPast ? "#60a5fa88" : THEME.dim, transition: "all 0.3s" }}>
                                        {word}
                                    </div>
                                    <div style={{ fontSize: "10px", color: THEME.dim }}>\u2193</div>
                                    {/* Hidden state cell */}
                                    <div style={{ width: 52, height: 52, borderRadius: "8px", border: `2px solid ${(isActive || isPast) ? color : THEME.border}`, background: (isActive || isPast) ? color + "22" : THEME.surface, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", boxShadow: isActive ? `0 0 18px ${color}55` : "none", transition: "all 0.4s" }}>
                                        <div style={{ fontSize: "9px", color: (isActive || isPast) ? color : THEME.dim, fontWeight: 700 }}>h{t}</div>
                                        {(isActive || isPast) && h.slice(0, 2).map((v, i) => (
                                            <div key={i} style={{ width: 36, height: 4, background: "#1e1e35", borderRadius: "2px", overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${Math.abs(v / maxH) * 100}%`, background: v > 0 ? color : THEME.forget, borderRadius: "2px" }} />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Output arrow */}
                                    {isActive && (
                                        <>
                                            <div style={{ fontSize: "10px", color: THEME.dim }}>\u2193</div>
                                            <div style={{ padding: "3px 8px", background: THEME.output + "22", border: `1px solid ${THEME.output}`, borderRadius: "4px", fontSize: "9px", color: THEME.output }}>\u0177{t}</div>
                                        </>
                                    )}
                                </div>
                                {t < SEQUENCE.length - 1 && (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", alignSelf: "center", marginTop: "-20px" }}>
                                        <div style={{ fontSize: "9px", color: THEME.dim }}>h \u2192</div>
                                        <div style={{ width: 24, height: 2, background: isPast ? m.color + "88" : "#ffffff11", transition: "background 0.3s" }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hidden state panel */}
            <div style={{ width: "100%", maxWidth: 600, margin: "0 auto 14px", background: THEME.surface, border: `1px solid ${m.color}44`, borderRadius: "8px", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ fontSize: "10px", color: m.color, letterSpacing: "2px" }}>HIDDEN STATE h[{step}] \u2014 after "{currentWord}"</div>
                    <div style={{ fontSize: "10px", color: THEME.dim }}>t = {step + 1}/{SEQUENCE.length}</div>
                </div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                    {currentH.map((v, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                            <div style={{ fontSize: "9px", color: THEME.dim }}>h{i}</div>
                            <div style={{ width: "100%", height: 50, background: "#1e1e35", borderRadius: "4px", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden", border: `1px solid ${m.color}33` }}>
                                <div style={{ width: "100%", height: `${Math.abs(v / maxH || 0) * 100}%`, background: v > 0 ? m.color : THEME.forget, transition: "height 0.4s", minHeight: 2 }} />
                            </div>
                            <div style={{ fontSize: "8px", color: m.color, fontWeight: 700 }}>{v.toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                {/* LSTM gates if selected */}
                {(mode === "lstm" || mode === "gru") && <LSTMGates step={step} />}
            </div>

            {/* Word step selector */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap", justifyContent: "center" }}>
                {SEQUENCE.map((word, t) => (
                    <button key={t} onClick={() => { setStep(t); if (timerRef.current) clearTimeout(timerRef.current); setAnimating(false); }}
                        style={{ padding: "5px 12px", border: `1.5px solid ${step === t ? m.color : t < step ? m.color + "44" : THEME.border}`, borderRadius: "4px", background: step === t ? m.color + "22" : "transparent", color: step === t ? m.color : t < step ? m.color + "88" : THEME.dim, fontSize: "11px", fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s" }}>
                        {word}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "14px", justifyContent: "center" }}>
                <button onClick={runAnim} disabled={animating}
                    style={{ padding: "8px 22px", border: "none", borderRadius: "4px", background: animating ? THEME.dim : m.color, color: "#000", fontSize: "12px", fontFamily: "inherit", fontWeight: 700, cursor: animating ? "not-allowed" : "pointer", letterSpacing: "1px" }}>
                    {animating ? "READING\u2026" : "\u25B6 READ SEQUENCE"}
                </button>
                <button onClick={reset} style={{ padding: "8px 14px", border: `1px solid ${THEME.border}`, borderRadius: "4px", background: "transparent", color: THEME.dim, fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>\u21BA</button>
            </div>

            <div style={{ padding: "10px 18px", borderLeft: `3px solid ${m.color}`, background: m.color + "0f", maxWidth: 640, margin: "0 auto", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                {mode === "rnn" && <><span style={{ color: m.color }}>// VANILLA RNN:</span> h_t = tanh(W_x\u22C5x_t + W_h\u22C5h_&#123;t-1&#125;). Simple but suffers vanishing gradients \u2014 earlier words are forgotten over long sequences.</>}
                {mode === "lstm" && <><span style={{ color: m.color }}>// LSTM:</span> Three gates control a cell state C_t. Forget gate erases, input gate writes, output gate reads. Solves vanishing gradient for long sequences.</>}
                {mode === "gru" && <><span style={{ color: m.color }}>// GRU:</span> Merges forget and input gates into a reset + update gate. Fewer parameters than LSTM, faster to train.</>}
            </div>
        </div>
    );
}
