"use client";

import { useState } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    tf: "#fbbf24",  // Amber for frequency
    idf: "#818cf8", // Indigo for importance
    combined: "#34d399", // Green for final score
};

const CORPUS = [
    "Machine learning is amazing for data science",
    "Deep learning learns complex representations",
    "Machine learning and deep learning overlap",
    "Data science requires statistics and programming",
];

const WORDS = [
    { term: "machine", tf: 0.25, idf: 1.4, score: 0.35, desc: "Common ML term" },
    { term: "learning", tf: 0.50, idf: 1.1, score: 0.55, desc: "Very frequent" },
    { term: "amazing", tf: 0.25, idf: 2.8, score: 0.70, desc: "Unique to Doc 1" },
    { term: "data", tf: 0.25, idf: 1.8, score: 0.45, desc: "Somewhat common" },
    { term: "science", tf: 0.25, idf: 1.8, score: 0.45, desc: "Somewhat common" },
    { term: "the", tf: 0.10, idf: 1.0, score: 0.10, desc: "Stop word" },
];

export default function TFIDFPrimitive() {
    const [selectedWord, setSelectedWord] = useState(WORDS[2]);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT III · FEATURE ENGINEERING · §44</div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>TF-IDF Text Features</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, fontStyle: "italic" }}>
                    "TF-IDF: Term Frequency (how often it appears) × Inverse Document Frequency (how rare it is overall)."
                </p>
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

                {/* Term List */}
                <div style={{ flex: "1 1 300px", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "16px" }}>VOCABULARY & SCORES</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {WORDS.map(w => (
                            <div
                                key={w.term}
                                onClick={() => setSelectedWord(w)}
                                style={{
                                    padding: "10px 14px",
                                    borderRadius: "6px",
                                    background: selectedWord.term === w.term ? "#1e1e35" : "transparent",
                                    border: `1px solid ${selectedWord.term === w.term ? THEME.combined : "transparent"}`,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "13px", fontWeight: 700, color: selectedWord.term === w.term ? THEME.combined : THEME.text }}>{w.term}</span>
                                    <div style={{ height: 4, width: 60, background: "#1a1b2c", borderRadius: "2px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${w.score * 100}%`, background: THEME.combined }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Breakdown Panel */}
                <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>MATHEMATICAL BREAKDOWN</div>
                        <div style={{ fontSize: "12px", color: THEME.text, marginBottom: "14px" }}>
                            Term: <span style={{ color: THEME.combined, fontWeight: 700 }}>"{selectedWord.term}"</span>
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "9px", color: THEME.tf, marginBottom: "4px" }}>TF (Frequency)</div>
                                <div style={{ fontSize: "18px", fontWeight: 700 }}>{selectedWord.tf.toFixed(2)}</div>
                                <div style={{ height: 3, background: THEME.tf, width: `${selectedWord.tf * 100}%`, marginTop: "4px" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "9px", color: THEME.idf, marginBottom: "4px" }}>IDF (Rarity)</div>
                                <div style={{ fontSize: "18px", fontWeight: 700 }}>{selectedWord.idf.toFixed(2)}</div>
                                <div style={{ height: 3, background: THEME.idf, width: `${(selectedWord.idf / 3) * 100}%`, marginTop: "4px" }} />
                            </div>
                        </div>

                        <div style={{ padding: "12px", background: "#0a0b14", borderRadius: "6px", borderLeft: `3px solid ${THEME.combined}` }}>
                            <div style={{ fontSize: "10px", color: THEME.dim, marginBottom: "4px" }}>FINAL TF-IDF SCORE</div>
                            <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.combined }}>{selectedWord.score.toFixed(3)}</div>
                            <div style={{ fontSize: "10px", color: THEME.dim, marginTop: "6px" }}>{selectedWord.desc}</div>
                        </div>
                    </div>

                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "10px" }}>CORPUS CONTEXT</div>
                        <div style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.5" }}>
                            {CORPUS.map((s, i) => (
                                <div key={i} style={{ marginBottom: "4px", padding: "4px", background: s.toLowerCase().includes(selectedWord.term) ? THEME.combined + "11" : "transparent", borderRadius: "4px" }}>
                                    DOC {i + 1}: {s.split(new RegExp(`(${selectedWord.term})`, 'gi')).map((part, j) => (
                                        part.toLowerCase() === selectedWord.term ? <span key={j} style={{ color: THEME.combined, fontWeight: 700 }}>{part}</span> : part
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
