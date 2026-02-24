"use client";

import { useState, useEffect } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    dev: "#60a5fa", prod: "#34d399", health: "#fbbf24", drift: "#f87171"
};

const PHASES = [
    { id: "data", label: "Data Versioning", color: THEME.dev, icon: "🗄️", desc: "Track changes in datasets (DVC/Pachyderm)." },
    { id: "experiment", label: "Experiment Tracking", color: THEME.dev, icon: "🧪", desc: "Log parameters, metrics, and artifacts (MLflow/W&B)." },
    { id: "registry", label: "Model Registry", color: THEME.dev, icon: "🏷️", desc: "Versioned model store with staging/production tags." },
    { id: "ci", label: "CI / CD / CT", color: THEME.health, icon: "⚙️", desc: "Continuous Integration, Deployment, and Training." },
    { id: "serving", label: "Model Serving", color: THEME.prod, icon: "🚀", desc: "Deploying models via APIs or Batch Inference." },
    { id: "monitoring", label: "Monitoring", color: THEME.prod, icon: "📊", desc: "Tracking drift, latency, and system health." },
];

export default function MLOpsPrimitive() {
    const [activeTab, setActiveTab] = useState(0);
    const [driftLevel, setDriftLevel] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            //   setDriftLevel(d => (d + 0.05) % 1);
        }, 100);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VII · MLOPS · §131</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>MLOps Lifecycle</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "From notebook experiment to robust production service."
                </p>
            </div>

            {/* Pipeline Visualization */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px", position: "relative", padding: "0 20px" }}>
                <div style={{ position: "absolute", top: "50%", left: "40px", right: "40px", height: 2, background: THEME.border, zIndex: 0 }} />

                {PHASES.map((p, i) => (
                    <div key={p.id} onClick={() => setActiveTab(i)}
                        style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: activeTab === i ? p.color : THEME.surface, border: `2px solid ${activeTab === i ? "#fff" : THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", transition: "all 0.3s", boxShadow: activeTab === i ? `0 0 15px ${p.color}88` : "none" }}>
                            {p.icon}
                        </div>
                        <div style={{ fontSize: "8px", color: activeTab === i ? p.color : THEME.dim, fontWeight: activeTab === i ? 700 : 400, textAlign: "center", maxWidth: 60 }}>
                            {p.label.toUpperCase()}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
                {/* Phase Details */}
                <div style={{ flex: 1.2, minWidth: 300 }}>
                    <div style={{ background: THEME.surface, border: `1px solid ${PHASES[activeTab].color}44`, borderRadius: "10px", padding: "20px", height: "100%" }}>
                        <div style={{ fontSize: "10px", color: PHASES[activeTab].color, letterSpacing: "2px", marginBottom: "12px" }}>CURRENT STAGE</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <span style={{ fontSize: "32px" }}>{PHASES[activeTab].icon}</span>
                            <h3 style={{ fontSize: "20px", margin: 0, fontWeight: 800 }}>{PHASES[activeTab].label}</h3>
                        </div>
                        <p style={{ fontSize: "13px", color: THEME.text, lineHeight: 1.6, marginBottom: "20px" }}>
                            {PHASES[activeTab].desc}
                        </p>

                        <div style={{ background: "#0a0b14", borderRadius: "8px", padding: "12px", borderLeft: `4px solid ${PHASES[activeTab].color}` }}>
                            <div style={{ fontSize: "10px", color: THEME.dim, marginBottom: "8px" }}>TYPICAL STACK</div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {activeTab === 0 && ["DVC", "GitLFS", "Pachyderm", "S3"].map(t => <Tag key={t}>{t}</Tag>)}
                                {activeTab === 1 && ["MLflow", "W&B", "Neptune", "DVC"].map(t => <Tag key={t}>{t}</Tag>)}
                                {activeTab === 2 && ["HuggingFace", "Seldon", "SageMaker"].map(t => <Tag key={t}>{t}</Tag>)}
                                {activeTab === 3 && ["GitHub Actions", "Jenkins", "Airflow"].map(t => <Tag key={t}>{t}</Tag>)}
                                {activeTab === 4 && ["Kubernetes", "Docker", "Triton", "FastAPI"].map(t => <Tag key={t}>{t}</Tag>)}
                                {activeTab === 5 && ["Prometheus", "EvidentlyAI", "Grafana"].map(t => <Tag key={t}>{t}</Tag>)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monitoring Simulation */}
                <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: "10px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "15px" }}>SYSTEM HEALTH (LIVE)</div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <Metric label="Latency" value="24ms" status={THEME.prod} width="30%" />
                            <Metric label="Accuracy" value="92.4%" status={THEME.prod} width="85%" />
                            <Metric label="Data Drift" value="Low" status={THEME.health} width="15%" />
                            <Metric label="GPU Load" value="68%" status={THEME.health} width="68%" />
                        </div>

                        <div style={{ marginTop: "20px", padding: "10px", background: "#1a1b2c33", borderRadius: "6px", border: `1px solid ${THEME.drift}22` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <span style={{ fontSize: "10px", color: THEME.drift, fontWeight: 700 }}>CONCEPT DRIFT</span>
                                <span style={{ fontSize: "9px", color: THEME.dim }}>ALERT AT 0.70</span>
                            </div>
                            <div style={{ height: 4, background: THEME.border, borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: "35%", background: THEME.drift }} />
                            </div>
                            <p style={{ fontSize: "9px", color: THEME.dim, marginTop: "8px", margin: 0 }}>
                                Model performance is stable. No retraining triggered.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${PHASES[activeTab].color}`, background: PHASES[activeTab].color + "0f", maxWidth: 700, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: PHASES[activeTab].color }}>// {PHASES[activeTab].label}:</span> {PHASES[activeTab].desc} MLOps ensures that models are not just built, but reliably maintained, monitored, and scaled across the entire production lifecycle.
            </div>
        </div>
    );
}

function Tag({ children }: { children: React.ReactNode }) {
    return <span style={{ fontSize: "9px", background: "#1a1b2c", padding: "3px 8px", borderRadius: "4px", border: `1px solid ${THEME.border}`, color: THEME.dim }}>{children}</span>;
}

function Metric({ label, value, status, width }: { label: string, value: string, status: string, width: string }) {
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                <span>{label}</span>
                <span style={{ fontWeight: 700, color: status }}>{value}</span>
            </div>
            <div style={{ height: 4, background: THEME.border, borderRadius: 2 }}>
                <div style={{ height: "100%", width: width, background: status, borderRadius: 2 }} />
            </div>
        </div>
    );
}

const PAD = 40;

