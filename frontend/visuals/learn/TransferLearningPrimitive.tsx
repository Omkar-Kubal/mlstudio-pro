"use client";

import { useState } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    frozen: "#60a5fa", trained: "#f472b8", input: "#34d399",
};

interface ModelLayer {
    id: number;
    label: string;
    features: string[];
    frozen: boolean;
}

const BASE_MODEL: ModelLayer[] = [
    { id: 0, label: "L1: Edges/Blobs", features: ["Gabor filters", "Color blobs", "Local contrast"], frozen: true },
    { id: 1, label: "L2: Textures", features: ["Mesh pattern", "Stripes", "Honeycomb"], frozen: true },
    { id: 2, label: "L3: Object Parts", features: ["Car wheels", "Dog ears", "Bird beaks"], frozen: true },
    { id: 3, label: "L4: Semantic", features: ["Full Face", "Whole Car", "Landscape"], frozen: false },
    { id: 4, label: "FC: Task Head", features: ["Class scores"], frozen: false },
];

export default function TransferLearningPrimitive() {
    const [layers, setLayers] = useState(BASE_MODEL);
    const [sourceData, _setSourceData] = useState("ImageNet (1000 classes)");
    const [targetTask, _setTargetTask] = useState("Skin Cancer Detection (2 classes)");

    const toggleFrozen = (id: number) => {
        setLayers(ls => ls.map(l => l.id === id ? { ...l, frozen: !l.frozen } : l));
    };

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · DEEP LEARNING · §78</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Transfer Learning & Fine-tuning</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Don't start from scratch; stand on the shoulders of giants (pre-trained weights)."
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", marginBottom: "14px" }}>

                {/* Left: Model Architecture */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", textAlign: "center", marginBottom: "4px" }}>MODEL PIPELINE</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "center" }}>
                        <div style={{ width: 140, padding: "6px", border: `1px solid ${THEME.input}`, borderRadius: "4px", textAlign: "center", fontSize: "10px", color: THEME.input, background: THEME.input + "10", marginBottom: "8px" }}>
                            Target Input: {targetTask.split("(")[0]}
                        </div>
                        <div style={{ fontSize: "12px", color: THEME.dim }}>\u2193</div>

                        {layers.map((l, i) => (
                            <div key={l.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                                <div style={{
                                    width: "100%", padding: "10px 14px", border: `2px solid ${l.frozen ? THEME.frozen : THEME.trained}`, borderRadius: "6px",
                                    background: l.frozen ? THEME.frozen + "10" : THEME.trained + "18", transition: "all 0.3s", position: "relative",
                                    boxShadow: l.frozen ? "none" : `0 0 12px ${THEME.trained}33`
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontSize: "11px", color: l.frozen ? THEME.frozen : THEME.trained, fontWeight: 700 }}>{l.label}</div>
                                            <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                                                {l.features.map(f => (
                                                    <span key={f} style={{ fontSize: "8px", padding: "1px 4px", background: l.frozen ? THEME.frozen + "22" : THEME.trained + "22", borderRadius: "2px", color: THEME.dim }}>{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button onClick={() => toggleFrozen(l.id)}
                                            style={{ padding: "4px 8px", borderRadius: "4px", background: l.frozen ? THEME.frozen : THEME.trained, border: "none", color: "#000", fontSize: "9px", fontWeight: 700, cursor: "pointer", minWidth: 60 }}>
                                            {l.frozen ? "\uD83D\uDD12 FROZEN" : "\uD83D\uDDF2 TRAINABLE"}
                                        </button>
                                    </div>
                                    {l.frozen && <div style={{ position: "absolute", right: -50, top: "50%", transform: "translateY(-50%)", fontSize: "9px", color: THEME.frozen, width: 40, lineHeight: 1.2 }}>Weights copied from {sourceData.split(" ")[0]}</div>}
                                </div>
                                {i < layers.length - 1 && <div style={{ width: 2, height: 10, background: THEME.border }} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Controls & Explanation */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>CONCEPTS</div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[
                                { title: "Feature Extraction", color: THEME.frozen, desc: "Keep backbone frozen. Only train the Task Head. Good when target data is small." },
                                { title: "Fine-tuning", color: THEME.trained, desc: "Unfreeze top layers. Allow backbone weights to shift slightly for target data. Better performance." },
                                { title: "General to Specific", color: THEME.dim, desc: "Early layers learn general features (edges). Later layers learn task-specific features (faces)." },
                            ].map(c => (
                                <div key={c.title}>
                                    <div style={{ fontSize: "10px", fontWeight: 700, color: c.color, marginBottom: "3px" }}>{c.title}</div>
                                    <div style={{ fontSize: "9px", color: THEME.dim, lineHeight: 1.5 }}>{c.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "14px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "10px" }}>SCENARIO</div>
                        <div style={{ fontSize: "10px", marginBottom: "8px" }}>Source: <span style={{ color: THEME.frozen }}>{sourceData}</span></div>
                        <div style={{ fontSize: "10px", marginBottom: "8px" }}>Target: <span style={{ color: THEME.trained }}>{targetTask}</span></div>
                        <div style={{ fontSize: "9px", color: THEME.dim, padding: "8px", border: `1px dashed ${THEME.border}`, borderRadius: "4px" }}>
                            "Because {targetTask.split(" ")[0]} is very different from natural images, you might need to unfreeze Layer 3 and 4."
                        </div>
                    </div>

                    <div style={{ border: `1px solid ${THEME.frozen}44`, borderRadius: "8px", padding: "12px", background: THEME.frozen + "08" }}>
                        <div style={{ fontSize: "10px", color: THEME.frozen, fontWeight: 700, marginBottom: "5px" }}>PRO-TIP: REPLACING THE HEAD</div>
                        <div style={{ fontSize: "9px", color: THEME.dim, lineHeight: 1.6 }}>
                            ImageNet models typically have 1000 output classes. For your task, you MUST replace the last layer (`FC: Task Head`) to match your number of classes (e.g., 2).
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: "center", color: THEME.dim, fontSize: "9px", letterSpacing: "1px" }}>
                {layers.every(l => l.frozen) ? "CURRENT STATUS: NO PARAMETERS TRAINING (STATIC)" : layers.every(l => !l.frozen) ? "CURRENT STATUS: TRAINING FROM SCRATCH (EXPENSIVE)" : "CURRENT STATUS: FINE-TUNING ACTIVE \u2705"}
            </div>
        </div>
    );
}

