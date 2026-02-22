"use client";

import { useState } from "react";

const THEME = {
    bg: "#07080c", surface: "#0c0d16", border: "#181826",
    text: "#e2e8f0", dim: "#4a5568",
    user: "#60a5fa", item: "#f472b8", match: "#34d399", miss: "#4a5568"
};

const ITEMS = [
    { id: 1, name: "Sci-Fi Book", tags: [1, 0, 1, 0], icon: "🚀" },
    { id: 2, name: "Romance Movie", tags: [0, 1, 0, 1], icon: "💖" },
    { id: 3, name: "Tech Gadget", tags: [1, 1, 0, 0], icon: "💻" },
    { id: 4, name: "Cooking Set", tags: [0, 0, 1, 1], icon: "🍳" },
    { id: 5, name: "Fantasy Game", tags: [1, 0, 1, 1], icon: "🐉" },
];

const USER_PREFS = [
    { id: "A", name: "The Techie", profile: [1, 0.2, 0.1, 0.1] },
    { id: "B", name: "The Chef", profile: [0.1, 0.1, 0.8, 0.9] },
    { id: "C", name: "The Dreamer", profile: [0.8, 0.3, 0.9, 0.2] },
];

export default function RecommenderPrimitive() {
    const [selectedUser, setSelectedUser] = useState(USER_PREFS[0]);

    const scores = ITEMS.map(item => {
        // Dot product for similarity
        const score = item.tags.reduce((acc, tag, i) => acc + (tag * selectedUser.profile[i]), 0);
        return { ...item, score };
    }).sort((a, b) => b.score - a.score);

    return (
        <div style={{ fontFamily: "'SF Mono','Fira Code',monospace", background: THEME.bg, padding: "24px 20px", color: THEME.text, borderRadius: "8px", border: `1px solid ${THEME.border}`, maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "4px", color: THEME.dim, marginBottom: "6px" }}>SUBJECT VII · RECOMMENDER · §142</div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px" }}>Recommender Systems</h1>
                <p style={{ fontSize: "12px", color: THEME.dim, margin: 0, fontStyle: "italic" }}>
                    "Collaborative Filtering vs Content-Based Filtering: Predicting what sparks joy."
                </p>
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
                {/* User Selection */}
                <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>SELECT USER PROFILE</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {USER_PREFS.map(u => (
                            <button key={u.id} onClick={() => setSelectedUser(u)}
                                style={{ padding: "12px", background: selectedUser.id === u.id ? THEME.user + "11" : THEME.surface, border: `1px solid ${selectedUser.id === u.id ? THEME.user : THEME.border}`, borderRadius: "8px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                                <div style={{ fontSize: "14px", fontWeight: 700, color: selectedUser.id === u.id ? THEME.user : THEME.text }}>{u.name}</div>
                                <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                                    {u.profile.map((p, i) => (
                                        <div key={i} style={{ height: 4, flex: 1, background: THEME.border, borderRadius: 2 }}>
                                            <div style={{ height: "100%", width: `${p * 100}%`, background: THEME.user }} />
                                        </div>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div style={{ flex: 1.5, minWidth: 340 }}>
                    <div style={{ fontSize: "10px", color: THEME.dim, letterSpacing: "2px", marginBottom: "12px" }}>PERSONALIZED TOP PICKS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {scores.map((item, idx) => (
                            <div key={item.id} style={{ position: "relative", background: THEME.surface, border: `1px solid ${idx === 0 ? THEME.match : THEME.border}`, borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", gap: "15px", transition: "all 0.5s" }}>
                                {idx === 0 && <div style={{ position: "absolute", top: -8, right: 12, background: THEME.match, color: "#000", fontSize: "9px", fontWeight: 900, padding: "2px 8px", borderRadius: "10px" }}>BEST MATCH</div>}

                                <div style={{ fontSize: "24px" }}>{item.icon}</div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <span style={{ fontSize: "14px", fontWeight: 700 }}>{item.name}</span>
                                        <span style={{ fontSize: "11px", color: idx === 0 ? THEME.match : THEME.dim }}>{(item.score * 10).toFixed(1)} Affinity</span>
                                    </div>

                                    {/* Feature Match Display */}
                                    <div style={{ display: "flex", gap: "2px" }}>
                                        {item.tags.map((tag, i) => (
                                            <div key={i} style={{ height: 6, flex: 1, background: tag ? selectedUser.profile[i] > 0.5 ? THEME.match : THEME.user : "#121320", borderRadius: 1, border: `1px solid ${tag ? "transparent" : THEME.border + "44"}` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: "20px", display: "flex", gap: "15px", background: THEME.surface, padding: "16px", borderRadius: "8px", border: `1px solid ${THEME.border}` }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "12px", color: THEME.user, margin: "0 0 8px" }}>Cold Start Problem</h4>
                    <p style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.5", margin: 0 }}>
                        New users have no history. We often use "Popularity-based" or "Metadata-based" recommendations until they interact.
                    </p>
                </div>
                <div style={{ width: 1, background: THEME.border }} />
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "12px", color: THEME.match, margin: "0 0 8px" }}>Matrix Factorization</h4>
                    <p style={{ fontSize: "10px", color: THEME.dim, lineHeight: "1.5", margin: 0 }}>
                        Advanced systems decompose giant User-Item matrices into small "latent feature" vectors to predict missing values.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 18px", borderLeft: `3px solid ${THEME.user}`, background: THEME.user + "0f", maxWidth: "100%", fontSize: "11px", color: THEME.dim, lineHeight: 1.8, borderRadius: "0 4px 4px 0" }}>
                <span style={{ color: THEME.user }}>// Logic:</span> Content-based filtering looks at the overlap between item features (tags) and user preferences. Collaborative filtering (not shown) instead finds similar users and assumes you'll like what your "neighbors" like.
            </div>
        </div>
    );
}
