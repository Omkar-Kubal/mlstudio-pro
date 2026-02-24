"use client";

import { useState } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    spam: "#f87171", ham: "#34d399", joint: "#a78bfa",
};

// Vocabulary and word stats from a "training set"
const VOCAB = [
    { word: "free", p_spam: 0.72, p_ham: 0.09 },
    { word: "offer", p_spam: 0.65, p_ham: 0.06 },
    { word: "click", p_spam: 0.61, p_ham: 0.08 },
    { word: "winner", p_spam: 0.58, p_ham: 0.03 },
    { word: "meeting", p_spam: 0.07, p_ham: 0.55 },
    { word: "report", p_spam: 0.05, p_ham: 0.62 },
    { word: "invoice", p_spam: 0.18, p_ham: 0.48 },
    { word: "limited", p_spam: 0.54, p_ham: 0.11 },
    { word: "help", p_spam: 0.22, p_ham: 0.44 },
    { word: "project", p_spam: 0.04, p_ham: 0.59 },
];

const PRIOR_SPAM = 0.30; // 30% of emails are spam

export default function NaiveBayesPrimitive() {
    const [selected, setSelected] = useState(new Set(["free", "winner"]));

    const toggleWord = (word: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(word)) next.delete(word); else next.add(word);
            return next;
        });
    };

    // Compute posteriors (log space then exponentiate)
    const words = VOCAB.filter(v => selected.has(v.word));
    let logSpam = Math.log(PRIOR_SPAM);
    let logHam = Math.log(1 - PRIOR_SPAM);
    words.forEach(w => {
        logSpam += Math.log(w.p_spam + 1e-9);
        logHam += Math.log(w.p_ham + 1e-9);
    });
    const maxLog = Math.max(logSpam, logHam);
    const eSpam = Math.exp(logSpam - maxLog);
    const eHam = Math.exp(logHam - maxLog);
    const pSpam = eSpam / (eSpam + eHam);
    const pHam = eHam / (eSpam + eHam);

    const verdict = pSpam > 0.5 ? "SPAM" : "HAM";
    const verdictColor = pSpam > 0.5 ? THEME.spam : THEME.ham;
    const confidence = Math.max(pSpam, pHam);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 820, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · CLASSIFICATION · §60</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Naive Bayes</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Naive Bayes is a Multiplying Detective — it multiplies each clue's probability to find the most likely culprit."
                </p>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>

                {/* Word selector */}
                <div style={{ flex: "1 1 260px", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "10px" }}>CLICK WORDS IN THE EMAIL</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {VOCAB.map(v => {
                            const sel = selected.has(v.word);
                            const lean = v.p_spam > v.p_ham ? "spam" : "ham";
                            const leanColor = lean === "spam" ? THEME.spam : THEME.ham;
                            return (
                                <button key={v.word} onClick={() => toggleWord(v.word)}
                                    style={{ padding: "6px 12px", border: `2px solid ${sel ? leanColor : THEME.border}`, borderRadius: "4px", background: sel ? leanColor + "22" : "transparent", color: sel ? leanColor : THEME.dim, fontSize: "11px", fontFamily: "inherit", fontWeight: sel ? 700 : 400, cursor: "pointer", transition: "all 0.2s" }}>
                                    {v.word}
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: "12px", fontSize: "10px", color: THEME.dim, lineHeight: 1.7 }}>
                        <span style={{ color: THEME.spam }}>■</span> spam-leaning word &nbsp;
                        <span style={{ color: THEME.ham }}>■</span> ham-leaning word
                    </div>
                </div>

                {/* Computation panel */}
                <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "10px" }}>

                    {/* Formula steps */}
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "10px" }}>BAYES COMPUTATION</div>
                        <div style={{ fontSize: "10px", color: THEME.dim, marginBottom: "6px" }}>
                            P(Spam) = <span style={{ color: THEME.spam }}>{PRIOR_SPAM.toFixed(2)}</span> &nbsp;
                            P(Ham) = <span style={{ color: THEME.ham }}>{(1 - PRIOR_SPAM).toFixed(2)}</span>
                        </div>
                        {words.length === 0 && (
                            <div style={{ fontSize: "10px", color: THEME.dim, fontStyle: "italic" }}>Select words above to see computation…</div>
                        )}
                        {words.map(w => (
                            <div key={w.word} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "4px", padding: "4px 8px", border: `1px solid ${THEME.border}`, borderRadius: "4px" }}>
                                <span style={{ color: THEME.text }}>P("{w.word}" | ·)</span>
                                <span style={{ color: THEME.spam }}>spam:{w.p_spam.toFixed(2)}</span>
                                <span style={{ color: THEME.ham }}>ham:{w.p_ham.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Posterior bars */}
                    <div style={{ background: THEME.surface, border: `1px solid ${verdictColor}55`, borderRadius: "8px", padding: "14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>POSTERIOR PROBABILITIES</div>
                        {[
                            { label: "P(Spam | words)", prob: pSpam, color: THEME.spam },
                            { label: "P(Ham | words)", prob: pHam, color: THEME.ham },
                        ].map(({ label, prob, color }) => (
                            <div key={label} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                                    <span style={{ color }}>{label}</span>
                                    <span style={{ color, fontWeight: 700 }}>{(prob * 100).toFixed(1)}%</span>
                                </div>
                                <div style={{ height: 14, background: "#1e1e35", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${prob * 100}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: "4px", transition: "width 0.4s" }} />
                                </div>
                            </div>
                        ))}

                        {/* Verdict */}
                        <div style={{ marginTop: "12px", textAlign: "center", padding: "10px", border: `2px solid ${verdictColor}`, borderRadius: "6px", background: verdictColor + "18" }}>
                            <div style={{ fontSize: "22px", fontWeight: 700, color: verdictColor }}>{verdict}</div>
                            <div style={{ fontSize: "10px", color: THEME.dim, marginTop: "2px" }}>confidence: {(confidence * 100).toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${THEME.joint}`, background: THEME.joint + "0f", maxWidth: 580, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: THEME.joint }}>// NAIVE ASSUMPTION:</span> Each word's probability is treated as independent — "free" and "winner" don't influence each other. Despite this being false, Naive Bayes is remarkably accurate on text classification and runs in O(n) time.
            </div>
        </div>
    );
}

