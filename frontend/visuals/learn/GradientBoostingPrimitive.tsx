"use client";

import { useState, useEffect, useRef } from "react";

const W = 540, H = 300;
const PAD = { top: 28, right: 24, bottom: 44, left: 54 };
const pW = W - PAD.left - PAD.right;
const pH = H - PAD.top - PAD.bottom;

function randNorm(m = 0, s = 1) {
    let u = 0; while (!u) u = Math.random();
    return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

const trueF = (x: number) => Math.sin(x * 1.1) * 2.5 + x * 0.5 + 3;
const DATA = Array.from({ length: 30 }, (_, i) => {
    const x = 0.4 + i * 0.29;
    return { x: +x.toFixed(3), y: +(trueF(x) + randNorm(0, 0.7)).toFixed(3) };
});

const LR = 0.6;

// Pre-compute 8 boosting rounds
function buildRounds(data: typeof DATA, nRounds = 8) {
    const rounds = [];
    let preds = data.map(() => data.reduce((s, d) => s + d.y, 0) / data.length); // mean baseline
    for (let r = 0; r < nRounds; r++) {
        const residuals = data.map((d, i) => ({ ...d, r: d.y - preds[i] }));
        const sorted = [...residuals].sort((a, b) => a.x - b.x);
        const mid = Math.floor(sorted.length / 2);
        const splitX = (sorted[mid - 1].x + sorted[mid].x) / 2;
        const leftMean = sorted.slice(0, mid).reduce((s, p) => s + p.r, 0) / mid;
        const rightMean = sorted.slice(mid).reduce((s, p) => s + p.r, 0) / (sorted.length - mid);
        const treePred = (x: number) => (x < splitX ? leftMean : rightMean);
        preds = data.map((d, i) => preds[i] + LR * treePred(d.x));
        const rmse = Math.sqrt(data.reduce((s, d, i) => s + (d.y - preds[i]) ** 2, 0) / data.length);
        rounds.push({ preds: [...preds], residuals: residuals.map(d => d.r), splitX, leftMean, rightMean, rmse: +rmse.toFixed(3) });
    }
    return rounds;
}

const ROUNDS = buildRounds(DATA);
const BASELINE = DATA.reduce((s, d) => s + d.y, 0) / DATA.length;

const X_MIN = 0, X_MAX = 10, Y_MIN = 0, Y_MAX = 11;
function toX(x: number) { return PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * pW; }
function toY(y: number) { return PAD.top + pH - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * pH; }

const ROUND_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#fb923c", "#f87171", "#38bdf8"];
const THEME = { bg: "#08090d", surface: "#0d0e18", border: "#1a1b2c", text: "#e2e8f0", dim: "#374151", grid: "#111827" };

export default function GradientBoostingPrimitive() {
    const mainRef = useRef<HTMLCanvasElement>(null);
    const residRef = useRef<HTMLCanvasElement>(null);
    const [round, setRound] = useState(0);
    const [animating, setAnimating] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const currentPreds = round === 0 ? DATA.map(() => BASELINE) : ROUNDS[round - 1].preds;
    const currentRMSE = round === 0 ? +(Math.sqrt(DATA.reduce((s, d) => s + (d.y - BASELINE) ** 2, 0) / DATA.length)).toFixed(3) : ROUNDS[round - 1].rmse;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { drawMain(); drawResid(); }, [round]);

    function drawMain() {
        const canvas = mainRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = THEME.grid; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = PAD.top + (i / 4) * pH;
            ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + pW, y); ctx.stroke();
        }

        // True function ghost
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
            const x = X_MIN + (i / 100) * X_MAX;
            const cx = toX(x), cy = toY(trueF(x));
            if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = "#ffffff1a"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);

        // Previous round predictions (faint)
        for (let r = 0; r < round - 1; r++) {
            ctx.beginPath();
            DATA.forEach((d, i) => {
                const cx = toX(d.x), cy = toY(ROUNDS[r].preds[i]);
                if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
            });
            ctx.strokeStyle = ROUND_COLORS[r] + "22"; ctx.lineWidth = 1; ctx.stroke();
        }

        // Current ensemble prediction
        const color = round === 0 ? "#94a3b8" : ROUND_COLORS[round - 1];
        ctx.beginPath();
        DATA.forEach((d, i) => {
            const cx = toX(d.x), cy = toY(currentPreds[i]);
            if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        });
        ctx.strokeStyle = color; ctx.lineWidth = 2.5;
        ctx.shadowColor = color; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;

        // Data dots
        DATA.forEach(d => {
            ctx.beginPath(); ctx.arc(toX(d.x), toY(d.y), 3.5, 0, Math.PI * 2);
            ctx.fillStyle = "#e2e8f0"; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1;
        });

        // Axes
        ctx.strokeStyle = "#252535"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(PAD.left, PAD.top); ctx.lineTo(PAD.left, PAD.top + pH);
        ctx.lineTo(PAD.left + pW, PAD.top + pH); ctx.stroke();
        ctx.fillStyle = THEME.dim; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("X →", PAD.left + pW / 2, H - 6);

        ctx.fillStyle = color; ctx.font = "bold 10px monospace"; ctx.textAlign = "right";
        ctx.fillText(`Round ${round}  RMSE = ${currentRMSE}`, PAD.left + pW - 4, PAD.top + 14);
    }

    function drawResid() {
        const canvas = residRef.current; if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const RW = canvas.width, RH = canvas.height;
        ctx.clearRect(0, 0, RW, RH);
        ctx.fillStyle = THEME.surface; ctx.fillRect(0, 0, RW, RH);

        const residuals = DATA.map((d, i) => d.y - currentPreds[i]);
        const maxR = Math.max(...residuals.map(Math.abs)) + 0.5;
        const rPAD = { t: 16, b: 28, l: 44, r: 12 };
        const rW = RW - rPAD.l - rPAD.r, rH = RH - rPAD.t - rPAD.b;

        function rToX(x: number) { return rPAD.l + ((x - X_MIN) / (X_MAX - X_MIN)) * rW; }
        function rToY(r: number) { return rPAD.t + rH / 2 - (r / maxR) * (rH / 2 - 4); }

        // Zero line
        ctx.beginPath(); ctx.moveTo(rPAD.l, rPAD.t + rH / 2); ctx.lineTo(rPAD.l + rW, rPAD.t + rH / 2);
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5; ctx.stroke();

        // Residual bars
        const color = round === 0 ? "#94a3b8" : ROUND_COLORS[round - 1];
        DATA.forEach((d, i) => {
            const r = residuals[i];
            const cx = rToX(d.x), cy0 = rPAD.t + rH / 2, cy1 = rToY(r);
            ctx.beginPath(); ctx.moveTo(cx, cy0); ctx.lineTo(cx, cy1);
            ctx.strokeStyle = r > 0 ? "#34d39988" : "#f8717188"; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.arc(cx, cy1, 3, 0, Math.PI * 2);
            ctx.fillStyle = r > 0 ? "#34d399" : "#f87171"; ctx.fill();
        });

        // Axes labels
        ctx.fillStyle = THEME.dim; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("residuals", rPAD.l + rW / 2, RH - 4);
        ctx.textAlign = "right";
        [+maxR.toFixed(1), 0, -maxR.toFixed(1)].forEach((v, i) => {
            ctx.fillText(v.toString(), rPAD.l - 4, rPAD.t + (i / 2) * rH + 4);
        });
        ctx.fillStyle = color; ctx.font = "bold 9px monospace"; ctx.textAlign = "right";
        ctx.fillText(`RMSE ${currentRMSE}`, rPAD.l + rW - 2, rPAD.t + 12);
    }

    const autoPlay = () => {
        setAnimating(true); setRound(0);
        let r = 0;
        function step() {
            r++; setRound(r);
            if (r < ROUNDS.length) { timerRef.current = setTimeout(step, 700); }
            else setAnimating(false);
        }
        timerRef.current = setTimeout(step, 500);
    };

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT IV · REGRESSION · §52</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Gradient Boosting</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Each new tree ignores what we got right — it obsessively fixes the remaining errors."
                </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <div>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "6px", textAlign: "center" }}>ENSEMBLE PREDICTION</div>
                    <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden" }}>
                        <canvas ref={mainRef} width={W} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "6px", textAlign: "center" }}>RESIDUALS (WHAT'S LEFT TO FIX)</div>
                    <div style={{ border: `1px solid ${THEME.border}`, borderRadius: "8px", overflow: "hidden" }}>
                        <canvas ref={residRef} width={220} height={H} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                    </div>
                </div>
            </div>

            {/* Round stepper */}
            <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap", justifyContent: "center" }}>
                <button onClick={() => { setRound(0); setAnimating(false); if (timerRef.current) clearTimeout(timerRef.current); }}
                    style={{ padding: "6px 12px", border: `1px solid ${THEME.border}`, borderRadius: "4px", background: round === 0 ? "#ffffff22" : "transparent", color: "#94a3b8", fontSize: "10px", fontFamily: "inherit", cursor: "pointer" }}>
                    Baseline
                </button>
                {ROUNDS.map((_, i) => (
                    <button key={i} onClick={() => { setRound(i + 1); setAnimating(false); if (timerRef.current) clearTimeout(timerRef.current); }}
                        style={{ padding: "6px 12px", border: `1.5px solid ${round === i + 1 ? ROUND_COLORS[i] : THEME.border}`, borderRadius: "4px", background: round === i + 1 ? ROUND_COLORS[i] + "22" : "transparent", color: round === i + 1 ? ROUND_COLORS[i] : THEME.dim, fontSize: "10px", fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s" }}>
                        +{i + 1}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px", justifyContent: "center" }}>
                <button onClick={autoPlay} disabled={animating}
                    style={{ padding: "8px 22px", border: "none", borderRadius: "4px", background: animating ? THEME.dim : "#fbbf24", color: "#000", fontSize: "12px", fontFamily: "inherit", fontWeight: 700, cursor: animating ? "not-allowed" : "pointer", letterSpacing: "1px" }}>
                    {animating ? "BOOSTING…" : "▶ AUTO BOOST"}
                </button>
                <button onClick={() => { setRound(0); setAnimating(false); if (timerRef.current) clearTimeout(timerRef.current); }}
                    style={{ padding: "8px 14px", border: `1px solid ${THEME.border}`, borderRadius: "4px", background: "transparent", color: THEME.dim, fontSize: "12px", fontFamily: "inherit", cursor: "pointer" }}>↺</button>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: "3px solid #fbbf24", background: "#fbbf240f", maxWidth: 500, fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0", margin: "14px auto 0" }}>
                <span style={{ color: "#fbbf24" }}>// MECHANISM:</span> Each round fits a shallow tree to the <em>residuals</em> (errors) from all previous rounds, then adds it multiplied by the learning rate ({LR}). The residual plot should shrink toward zero as rounds increase.
            </div>
        </div>
    );
}

