"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ParsedContent } from "@/types/learning";

export default function TopicPage() {
    const params = useParams();
    const subjectSlug = params.subject as string;
    const moduleSlug = params.module as string;
    const topicSlug = params.topic as string;

    const [content, setContent] = useState<ParsedContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<{ text: string; error?: boolean } | null>(null);
    const [activeFile, setActiveFile] = useState("script.py");

    useEffect(() => {
        fetch(`/api/content?subject=${subjectSlug}&module=${moduleSlug}`)
            .then((res) => {
                if (!res.ok) throw new Error("Content not found");
                return res.json();
            })
            .then((data) => {
                setContent(data);
                if (data.codeSnippets?.[0]) {
                    setCode(data.codeSnippets[0].content);
                }
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [subjectSlug, moduleSlug]);

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput(null);
        try {
            const res = await fetch("/api/run-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language: "python", code }),
            });
            const data = await res.json();
            setOutput({
                text: data.output || data.error || "No output",
                error: !!data.error,
            });
        } catch (e) {
            setOutput({ text: String(e), error: true });
        }
        setIsRunning(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted">Loading content...</p>
                </div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error || "Content not available"}</p>
                    <Link href={`/learn/${subjectSlug}/${moduleSlug}`} className="text-primary hover:underline">
                        ← Back to module
                    </Link>
                </div>
            </div>
        );
    }

    // Get theory paragraphs (filter out headings for main content)
    const theoryParagraphs = content.sections.filter(s => s.type === "paragraph").slice(0, 3);
    const headings = content.sections.filter(s => s.type === "heading");

    return (
        <main className="w-full flex flex-col">
            {/* Hero Section */}
            <section className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6 relative border-b border-border bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface via-background to-background overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                <div className="z-10 animate-fade-in-up space-y-6 max-w-4xl">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-white/5 text-muted border border-border rounded-full text-xs font-mono tracking-widest uppercase">
                            {moduleSlug.replace(/-/g, " ")}
                        </span>
                        <span className="text-muted text-xs font-mono tracking-widest uppercase">• {subjectSlug.replace(/-/g, " ")}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground">
                        {content.title || topicSlug.replace(/-/g, " ")}
                    </h1>
                    <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
                        {theoryParagraphs[0]?.content.slice(0, 200) || "Explore this topic with interactive examples and hands-on code."}...
                    </p>
                    <div className="pt-8 flex justify-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <span className="material-symbols-outlined text-lg">timer</span> 15 min
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <span className="material-symbols-outlined text-lg">code</span> Python
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <span className="material-symbols-outlined text-lg">signal_cellular_alt</span> Beginner
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-8 animate-bounce text-muted/50">
                    <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </div>
            </section>

            {/* Theory Section */}
            <section className="max-w-7xl mx-auto w-full px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative">
                <div className="flex flex-col justify-center space-y-12">
                    <div>
                        <span className="text-silver-light text-sm font-bold tracking-widest uppercase mb-2 block">
                            {headings[0]?.content || "Core Concepts"}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">{headings[1]?.content || "Understanding the Fundamentals"}</h2>
                        <div className="prose prose-invert prose-lg text-muted">
                            {theoryParagraphs.map((p, i) => (
                                <p key={i} className="mb-6">{p.content}</p>
                            ))}
                        </div>
                    </div>
                    <div className="bg-surface/60 p-6 rounded-lg border border-border border-l-4 border-l-primary shadow-[0_0_20px_rgba(212,212,212,0.05)] hover:shadow-[0_0_30px_rgba(212,212,212,0.1)] transition-shadow duration-500 backdrop-blur-sm">
                        <h4 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-primary drop-shadow-[0_0_8px_rgba(212,212,212,0.5)]">lightbulb</span>
                            Key Takeaway
                        </h4>
                        <p className="text-muted text-sm leading-relaxed">
                            {theoryParagraphs[1]?.content.slice(0, 200) || "This concept forms the foundation for more advanced techniques."}
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <div className="sticky top-12 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted">Interactive Visualizer</span>
                            <span className="size-2 bg-primary rounded-full animate-pulse" />
                        </div>
                        <div className="bg-background rounded-xl border border-border shadow-2xl shadow-black relative overflow-hidden group aspect-square lg:aspect-[4/3] flex items-center justify-center">
                            <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
                            {/* Visual representation of data concept */}
                            <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-4">
                                {/* Animated bars representing data */}
                                <div className="flex items-end gap-2 h-24">
                                    <div className="w-6 bg-primary/30 rounded-t animate-pulse" style={{ height: '40%' }} />
                                    <div className="w-6 bg-primary/50 rounded-t animate-pulse" style={{ height: '70%', animationDelay: '0.1s' }} />
                                    <div className="w-6 bg-primary/70 rounded-t animate-pulse" style={{ height: '55%', animationDelay: '0.2s' }} />
                                    <div className="w-6 bg-primary rounded-t animate-pulse" style={{ height: '85%', animationDelay: '0.3s' }} />
                                    <div className="w-6 bg-primary/60 rounded-t animate-pulse" style={{ height: '45%', animationDelay: '0.4s' }} />
                                    <div className="w-6 bg-primary/40 rounded-t animate-pulse" style={{ height: '65%', animationDelay: '0.5s' }} />
                                </div>
                                <span className="text-xs text-muted font-mono uppercase tracking-widest">Concept Visualization</span>
                                <span className="text-[10px] text-muted/50 max-w-[200px] text-center">
                                    Interactive visualizations help build intuition for {moduleSlug.replace(/-/g, " ")}
                                </span>
                            </div>
                        </div>
                        <p className="text-center text-xs text-muted font-mono pt-2">Fig 1.1: {content.title || "Data Distribution"} Visualization</p>
                    </div>
                </div>
            </section>

            {/* Code Lab Intro */}
            <section className="py-24 bg-surface border-y border-border relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-10" />
                <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center justify-center p-3 rounded-xl bg-background border border-border mb-6 shadow-lg">
                        <span className="material-symbols-outlined text-3xl text-primary">terminal</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Hands-on Implementation</h2>
                    <p className="text-lg text-muted leading-relaxed">
                        Now that you understand the theoretical foundation, let&apos;s implement the solution using code.
                        <br className="hidden md:block" />
                        Use the lab environment below to write your code and visualize the results in real-time.
                    </p>
                    <div className="mt-12 flex flex-col items-center gap-2 opacity-50">
                        <span className="text-[10px] uppercase tracking-widest text-muted">Scroll to start coding</span>
                        <span className="material-symbols-outlined text-muted animate-bounce">arrow_downward</span>
                    </div>
                </div>
            </section>

            {/* Studio Workspace */}
            <section className="w-full max-w-[1920px] mx-auto px-4 md:px-8 py-20 min-h-screen flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="size-2 bg-primary rounded-full shadow-[0_0_10px_rgba(212,212,212,0.5)]" />
                            Studio Workspace
                        </h2>
                        <p className="text-muted text-sm mt-1">Environment: Python 3.10 • NumPy • Pandas</p>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <button
                            className="px-4 py-2 rounded-lg bg-surface border border-border text-xs font-bold uppercase tracking-wider text-muted hover:text-foreground transition-colors"
                            onClick={() => setCode(content.codeSnippets?.[0]?.content || "")}
                        >
                            Reset Lab
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg bg-foreground text-background border border-foreground text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
                            onClick={handleRunCode}
                            disabled={isRunning}
                        >
                            <span className="material-symbols-outlined text-sm">play_arrow</span>
                            {isRunning ? "Running..." : "Run Solution"}
                        </button>
                    </div>
                </div>

                {/* IDE Layout */}
                <div className="flex-1 border border-border rounded-xl bg-code flex flex-col lg:flex-row overflow-hidden shadow-2xl min-h-[700px]">
                    {/* File Tree */}
                    <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col">
                        <div className="h-10 border-b border-border flex items-center px-4 bg-background/50">
                            <span className="text-xs font-bold text-muted uppercase tracking-wider">Project Files</span>
                        </div>
                        <div className="p-2 space-y-1 flex-1 overflow-y-auto">
                            <div
                                className={`group flex items-center gap-3 px-3 py-2 rounded border text-sm cursor-pointer ${activeFile === "script.py"
                                    ? "bg-white/5 border-white/10 text-foreground"
                                    : "border-transparent hover:bg-background hover:border-border text-muted hover:text-foreground"
                                    }`}
                                onClick={() => setActiveFile("script.py")}
                            >
                                <span className="material-symbols-outlined text-lg text-primary">code</span>
                                <span className="font-mono text-xs">script.py</span>
                            </div>
                            <div
                                className="group flex items-center gap-3 px-3 py-2 hover:bg-background rounded border border-transparent hover:border-border text-muted hover:text-foreground text-sm cursor-pointer transition-all"
                            >
                                <span className="material-symbols-outlined text-lg text-blue-300">table_chart</span>
                                <span className="font-mono text-xs">dataset.csv</span>
                            </div>
                            <div
                                className="group flex items-center gap-3 px-3 py-2 hover:bg-background rounded border border-transparent hover:border-border text-muted hover:text-foreground text-sm cursor-pointer transition-all"
                            >
                                <span className="material-symbols-outlined text-lg text-gray-400">description</span>
                                <span className="font-mono text-xs">README.md</span>
                            </div>
                            <div className="mt-6 pt-6 border-t border-border px-2">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-3">Lab Instructions</span>
                                <p className="text-xs text-muted leading-relaxed mb-3">1. Import necessary libraries.</p>
                                <p className="text-xs text-muted leading-relaxed mb-3">2. Initialize the model instance.</p>
                                <p className="text-xs text-muted leading-relaxed">3. Fit the model to training data.</p>
                            </div>
                        </div>
                    </div>

                    {/* Code Editor */}
                    <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border min-w-0 bg-code relative">
                        {/* Tabs */}
                        <div className="h-10 bg-surface flex items-center px-0 border-b border-border overflow-x-auto">
                            <div className="flex items-center gap-2 px-4 h-full bg-code border-t-2 border-primary text-xs text-foreground font-medium cursor-pointer min-w-fit">
                                <span className="material-symbols-outlined text-sm text-primary">code</span>
                                script.py
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 relative overflow-auto">
                            <div className="absolute left-0 top-0 bottom-0 w-10 text-right pr-3 text-muted/30 select-none text-xs leading-6 font-mono border-r border-border/50 bg-code z-10 py-4">
                                {code.split("\n").map((_, i) => (
                                    <div key={i}>{i + 1}</div>
                                ))}
                            </div>
                            <textarea
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full h-full bg-transparent text-gray-300 font-mono text-sm p-4 pl-14 resize-none outline-none leading-6"
                                spellCheck={false}
                                placeholder="# Write your Python code here..."
                            />
                        </div>

                        {/* Status bar */}
                        <div className="h-8 bg-surface border-t border-border flex items-center justify-between px-3">
                            <span className="text-[10px] text-muted">Ln {code.split("\n").length}, Col 1 • UTF-8</span>
                            <span className="text-[10px] text-green-500 flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-green-500" />
                                Ready
                            </span>
                        </div>
                    </div>

                    {/* Output Panel */}
                    <div className="w-full lg:w-96 bg-[#050505] flex flex-col min-w-[300px]">
                        <div className="h-10 bg-surface border-b border-border flex items-center px-0">
                            <div className="h-full flex px-4 items-center gap-2 border-r border-border/50 bg-background text-primary border-b-2 border-b-primary cursor-pointer">
                                <span className="text-[10px] uppercase tracking-widest font-bold">Output</span>
                            </div>
                            <div className="h-full flex px-4 items-center gap-2 text-muted hover:text-foreground hover:bg-background/50 cursor-pointer border-b-2 border-b-transparent">
                                <span className="text-[10px] uppercase tracking-widest font-bold">Variables</span>
                            </div>
                            <div className="flex-1" />
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-4">
                            {output ? (
                                <>
                                    <div className="text-gray-400">$ python3 script.py</div>
                                    <pre className={`whitespace-pre-wrap ${output.error ? "text-red-400" : "text-foreground"}`}>
                                        {output.text}
                                    </pre>
                                    <div className={`p-2 rounded text-[10px] ${output.error ? "bg-red-500/5 border border-red-500/20 text-red-400" : "bg-green-500/5 border border-green-500/20 text-green-400"}`}>
                                        Process finished with exit code {output.error ? "1" : "0"}
                                    </div>
                                </>
                            ) : (
                                <div className="text-muted text-center py-12">
                                    <span className="material-symbols-outlined text-3xl mb-2 block opacity-30">terminal</span>
                                    Click &quot;Run Solution&quot; to execute your code
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Knowledge Check */}
            {content.quiz.length > 0 && (
                <section className="max-w-4xl mx-auto w-full px-6 py-12 mb-12">
                    <div className="border border-border rounded-xl bg-surface/50 backdrop-blur overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-silver-light via-white to-silver-light opacity-30" />
                        <div className="p-8 md:p-12">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-silver-light border border-white/20">
                                    <span className="material-symbols-outlined text-lg">quiz</span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">Knowledge Check</h3>
                                <span className="ml-auto text-xs text-muted font-mono bg-background px-2 py-1 rounded border border-border">
                                    Q 1/{content.quiz.length}
                                </span>
                            </div>
                            <h4 className="text-xl md:text-2xl font-bold mb-8">{content.quiz[0]}</h4>
                            <div className="space-y-3">
                                {["Option A", "Option B", "Option C"].map((opt, i) => (
                                    <label key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-background hover:bg-surface hover:border-muted transition-all cursor-pointer group">
                                        <input type="radio" name="quiz" className="text-primary bg-background border-border focus:ring-primary/50" />
                                        <span className="text-muted group-hover:text-foreground transition-colors">{opt}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                                <span className="text-xs text-muted">Select the best answer to proceed.</span>
                                <button className="px-6 py-2.5 bg-foreground text-background font-bold text-sm rounded-lg hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                    Check Answer
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="py-12 border-t border-border text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="bg-primary size-6 rounded flex items-center justify-center text-black font-bold text-xs">M</div>
                    <span className="font-bold text-sm tracking-tight text-foreground">MLStudio<span className="text-primary">Pro</span></span>
                </div>
                <p className="text-muted text-xs">© 2024 MLStudio Pro. All rights reserved.</p>
            </footer>
        </main>
    );
}
