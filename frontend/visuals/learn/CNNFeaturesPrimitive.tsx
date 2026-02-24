"use client";

import { useState } from "react";

const THEME = {
    bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c",
    text: "#e2e8f0", dim: "#4a5568",
    accent: "#f472b6", // Pink for vision
    field: "#10b981",  // Green for activation
};

const LAYERS = [
    {
        id: "layer1",
        name: "Early Layers (Edges)",
        desc: "Learns basic Gabor filters: vertical, horizontal, and diagonal edges.",
        resolution: "224x224",
        filters: 64,
        complexity: "Low"
    },
    {
        id: "layer2",
        name: "Mid Layers (Textures)",
        desc: "Combines edges into repeating patterns, textures, and simple geometric shapes.",
        resolution: "56x56",
        filters: 256,
        complexity: "Medium"
    },
    {
        id: "layer3",
        name: "Deep Layers (Objects)",
        desc: "High-level semantic features: dog ears, car wheels, or text blocks.",
        resolution: "7x7",
        filters: 2048,
        complexity: "High"
    },
];

export default function CNNFeaturesPrimitive() {
    const [activeLayer, setActiveLayer] = useState(0);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT III · DATA PREPARATION · §45</div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>CNN Feature Extraction</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, fontStyle: "italic" }}>
                    "Pretrained CNNs learn a hierarchy of visual features that transfer to any computer vision task."
                </p>
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "center", flexDirection: "column" }}>

                {/* Architecture Visual */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: THEME.surface, padding: "24px", borderRadius: "12px", border: `1px solid ${THEME.border}`, width: "100%", overflowX: "auto" }}>

                    {/* Input Image */}
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <div style={{ width: 60, height: 60, background: "#1e1e35", borderRadius: "4px", border: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🖼️</div>
                        <div style={{ fontSize: "9px", color: THEME.dim, marginTop: "6px" }}>INPUT</div>
                    </div>

                    <div style={{ color: THEME.dim }}>→</div>

                    {LAYERS.map((l, i) => (
                        <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div
                                onClick={() => setActiveLayer(i)}
                                style={{
                                    width: 100 - (i * 15),
                                    height: 100 - (i * 15),
                                    background: activeLayer === i ? THEME.accent + "33" : "#0d0e18",
                                    border: `2px solid ${activeLayer === i ? THEME.accent : THEME.border}`,
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    padding: "4px",
                                    gap: "2px",
                                    overflow: "hidden",
                                    transition: "all 0.3s"
                                }}
                            >
                                {Array.from({ length: 16 }).map((_, j) => (
                                    <div key={j} style={{
                                        flex: "1 1 20%",
                                        height: "20%",
                                        background: activeLayer === i ? (Math.random() > 0.6 ? THEME.accent : "#1e1e35") : "#1a1b2c",
                                        borderRadius: "1px"
                                    }} />
                                ))}
                            </div>
                            {i < LAYERS.length - 1 && <div style={{ color: THEME.dim }}>→</div>}
                        </div>
                    ))}

                    <div style={{ color: THEME.dim }}>→</div>

                    {/* Feature Vector */}
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <div style={{ width: 12, height: 100, background: THEME.field + "33", border: `1px solid ${THEME.field}`, borderRadius: "2px", display: "flex", flexDirection: "column", gap: "2px", padding: "2px" }}>
                            {Array.from({ length: 8 }).map((_, j) => (
                                <div key={j} style={{ flex: 1, background: THEME.field, opacity: Math.random() }} />
                            ))}
                        </div>
                        <div style={{ fontSize: "9px", color: THEME.dim, marginTop: "6px" }}>VECTOR</div>
                    </div>
                </div>

                {/* Info Panel */}
                <div style={{ width: "100%", background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "8px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                            <div style={{ fontSize: "10px", color: THEME.accent, fontWeight: 700, letterSpacing: "1px" }}>LAYER INFO</div>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "4px 0" }}>{LAYERS[activeLayer].name}</h2>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "10px", color: THEME.dim }}>COMPLEXITY</div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: THEME.accent }}>{LAYERS[activeLayer].complexity}</div>
                        </div>
                    </div>

                    <p style={{ fontSize: "13px", color: THEME.text, lineHeight: "1.6", marginBottom: "20px" }}>
                        {LAYERS[activeLayer].desc}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                        <div style={{ background: "#0a0b14", padding: "10px", borderRadius: "6px", border: `1px solid ${THEME.border}` }}>
                            <div style={{ fontSize: "9px", color: THEME.dim }}>RESOLUTION</div>
                            <div style={{ fontSize: "14px", fontWeight: 700 }}>{LAYERS[activeLayer].resolution}</div>
                        </div>
                        <div style={{ background: "#0a0b14", padding: "10px", borderRadius: "6px", border: `1px solid ${THEME.border}` }}>
                            <div style={{ fontSize: "9px", color: THEME.dim }}>FILTER COUNT</div>
                            <div style={{ fontSize: "14px", fontWeight: 700 }}>{LAYERS[activeLayer].filters}</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

