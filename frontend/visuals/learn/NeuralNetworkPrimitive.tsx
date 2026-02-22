"use client";

import { useState, useEffect, useRef } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    input: "#60a5fa", hidden: "#a78bfa", output: "#34d399",
    weight: "#fbbf2444", active: "#fbbf24",
};

const ARCH = [
    { label: "Input", n: 4, color: "#60a5fa", desc: "Raw features fed in" },
    { label: "Hidden 1", n: 5, color: "#a78bfa", desc: "First transformation layer" },
    { label: "Hidden 2", n: 4, color: "#818cf8", desc: "Second transformation layer" },
    { label: "Output", n: 2, color: "#34d399", desc: "Class scores (logits)" },
];

const W = 560, H = 340;

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

// Random weights
function makeWeights(nIn: number, nOut: number) {
    return Array.from({ length: nIn }, () =>
        Array.from({ length: nOut }, () => (Math.random() - 0.5) * 2));
}

const WEIGHTS = ARCH.slice(0, -1).map((l, i) => makeWeights(l.n, ARCH[i + 1].n));

// Node positions
function nodePos(layerIdx: number, nodeIdx: number, nNodes: number) {
    const xStep = W / (ARCH.length + 1);
    const x = xStep * (layerIdx + 1);
    const totalH = H - 60;
    const gap = Math.min(54, totalH / (nNodes));
    const startY = H / 2 - (nNodes - 1) * gap / 2;
    return { x, y: startY + nodeIdx * gap };
}

export default function NeuralNetworkPrimitive() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [inputs, setInputs] = useState([0.8, 0.3, 0.6, 0.1]);
    const [animStep, setAnimStep] = useState(-1);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Forward pass
    function forwardPass(inp: number[]) {
        const activations = [inp];
        let cur = inp;
        WEIGHTS.forEach((W_layer, li) => {
            const next = ARCH[li + 1];
            const out = Array.from({ length: next.n }, (_, j) => {
                const z = cur.reduce((s, v, i) => s + v * W_layer[i][j], 0);
                return sigmoid(z);
            });
            activations.push(out);
            cur = out;
        });
        return activations;
    }

    const activations = forwardPass(inputs);

    useEffect(() => { draw(); }, [inputs, animStep]);

    function draw() {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H); ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        // Weights (connections)
        ARCH.slice(0, -1).forEach((layer, li) => {
            const nextLayer = ARCH[li + 1];
            for (let i = 0; i < layer.n; i++) {
                for (let j = 0; j < nextLayer.n; j++) {
                    const p1 = nodePos(li, i, layer.n);
                    const p2 = nodePos(li + 1, j, nextLayer.n);
                    const w = WEIGHTS[li][i][j];
                    const isActive = animStep > li;
                    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = isActive
                        ? (w > 0 ? "#60a5fa33" : "#f8717133")
                        : "#ffffff0a";
                    ctx.lineWidth = isActive ? Math.abs(w) * 1.8 : 0.5;
                    ctx.stroke();
                }
            }
        });

        // Nodes
        ARCH.forEach((layer, li) => {
            const isActive = animStep >= li || animStep === -1;
            for (let i = 0; i < layer.n; i++) {
                const { x, y } = nodePos(li, i, layer.n);
                const act = activations[li][i] ?? 0;
                const radius = 14 + act * 4;

                // Activation fill
                const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
                grad.addColorStop(0, layer.color + (isActive ? "ff" : "44"));
                grad.addColorStop(1, layer.color + "22");
                ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                if (isActive) {
                    ctx.shadowColor = layer.color;
                    ctx.shadowBlur = 12;
                }
                ctx.fill(); ctx.shadowBlur = 0;
                ctx.strokeStyle = isActive ? layer.color : layer.color + "44";
                ctx.lineWidth = 1.5; ctx.stroke();

                // Activation value
                ctx.fillStyle = isActive ? "#fff" : THEME.dim;
                ctx.font = `bold ${isActive ? 10 : 8}px 'SF Mono',monospace`;
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillText(act.toFixed(2), x, y);
                ctx.textBaseline = "alphabetic";
            }
            // Layer label
            const { x } = nodePos(li, 0, layer.n);
            ctx.fillStyle = isActive ? layer.color : THEME.dim;
            ctx.font = `bold 10px monospace`; ctx.textAlign = "center";
            ctx.fillText(layer.label, x, 18);
            ctx.fillStyle = THEME.dim; ctx.font = "9px monospace";
            ctx.fillText(`n=${layer.n}`, x, 30);
        });

        // Output labels
        const outLayer = ARCH[ARCH.length - 1];
        ["Class A", "Class B"].forEach((lbl, i) => {
            const { x, y } = nodePos(ARCH.length - 1, i, outLayer.n);
            ctx.fillStyle = THEME.output; ctx.font = "9px monospace"; ctx.textAlign = "left";
            ctx.fillText(lbl, x + 20, y + 4);
        });
    }

    const runForward = () => {
        setAnimating(true); setAnimStep(-1);
        let s = -1;
        function step() {
            s++; setAnimStep(s);
            if (s < ARCH.length - 1) { timerRef.current = setTimeout(step, 500); }
            else { setTimeout(() => setAnimating(false), 400); }
        }
        timerRef.current = setTimeout(step, 200);
    };
    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VI · DEEP LEARNING · §69</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Neural Network Anatomy</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "A neural network is a cascade of Learned Linear Projections with non-linear squeezers between them."
                </p>
            </div>

            <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "14px", background: THEME.surface }}>
                <canvas ref={canvasRef} width={W} height={H} style={{ display: "block", margin: "0 auto" }} />
            </div>

            {/* Input sliders */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "14px" }}>
                {inputs.map((v, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#60a5fa", marginBottom: "4px" }}>x{i + 1} = {v.toFixed(2)}</div>
                        <input type="range" min={0} max={1} step={0.01} value={v}
                            onChange={e => setInputs(inp => inp.map((x, j) => j === i ? +e.target.value : x))}
                            style={{ width: 80, accentColor: "#60a5fa", cursor: "pointer" }} />
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={runForward} disabled={animating}
                    style={{ padding: "8px 22px", border: "none", borderRadius: "4px", background: animating ? THEME.dim : "#a78bfa", color: "#000", fontSize: "12px", fontFamily: "inherit", fontWeight: 700, cursor: animating ? "not-allowed" : "pointer", letterSpacing: "1px" }}>
                    {animating ? "PROPAGATING…" : "▶ FORWARD PASS"}
                </button>
                <button onClick={() => { setAnimStep(-1); if (timerRef.current) clearTimeout(timerRef.current); setAnimating(false); }}
                    style={{ padding: "8px 14px", border: `1px solid ${THEME.border}`, borderRadius: "4px", background: "transparent", color: THEME.dim, fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>↺</button>
            </div>

            <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", width: "100%" }}>
                {ARCH.map((l, li) => {
                    const maxAct = Math.max(...activations[li]);
                    return (
                        <div key={l.label} style={{ border: `1px solid ${l.color}33`, borderRadius: "6px", padding: 8, background: l.color + "08" }}>
                            <div style={{ fontSize: "10px", color: l.color, fontWeight: 700, marginBottom: "4px" }}>{l.label}</div>
                            <div style={{ fontSize: "9px", color: THEME.dim, marginBottom: "4px", minHeight: "24px" }}>{l.desc}</div>
                            <div style={{ height: 4, background: "#1e1e35", borderRadius: "2px" }}>
                                <div style={{ height: "100%", width: `${maxAct * 100}%`, background: l.color, borderRadius: "2px", transition: "width 0.3s" }} />
                            </div>
                            <div style={{ fontSize: "9px", color: l.color, marginTop: "3px" }}>max act: {maxAct.toFixed(2)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
