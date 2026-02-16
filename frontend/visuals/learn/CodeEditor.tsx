"use client";

import { useState/*, useEffect*/ } from "react";
import { Highlight, themes } from "prism-react-renderer";

interface CodeEditorProps {
    code: string;
    language?: string;
    editable?: boolean;
    onCodeChange?: (code: string) => void;
    onRun?: (code: string) => void;
}

interface ExecutionResult {
    output: string;
    error?: string;
    image?: string;
}

export default function CodeEditor({
    code: initialCode,
    language = "python",
    editable = true,
    onCodeChange,
    onRun,
}: CodeEditorProps) {
    const [code, setCode] = useState(initialCode);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<ExecutionResult | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newCode = e.target.value;
        setCode(newCode);
        onCodeChange?.(newCode);
    };

    const handleRun = async () => {
        setIsRunning(true);
        setResult(null);

        try {
            const response = await fetch("/api/run-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language, code }),
            });

            const data = await response.json();
            setResult({
                output: data.output || "",
                error: data.error || undefined,
                image: data.image || undefined,
            });
            onRun?.(code);
        } catch (error) {
            setResult({
                output: "",
                error: String(error),
            });
        } finally {
            setIsRunning(false);
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-lg border border-border overflow-hidden bg-neutral-950">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-neutral-900">
                <span className="text-sm text-muted font-mono">{language}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="text-xs text-muted hover:text-foreground transition-colors px-2 py-1 rounded"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="text-xs bg-accent hover:bg-accent/80 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                    >
                        {isRunning ? "Running..." : "Run ▶"}
                    </button>
                </div>
            </div>

            {/* Code Display/Editor */}
            <div className="relative">
                {editable ? (
                    <div className="relative">
                        {/* Highlighted background */}
                        <Highlight
                            theme={themes.nightOwl}
                            code={code}
                            language={language as "python" | "javascript"}
                        >
                            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                <pre
                                    className={`${className} p-4 text-sm overflow-x-auto`}
                                    style={{ ...style, margin: 0 }}
                                >
                                    {tokens.map((line, i) => (
                                        <div key={i} {...getLineProps({ line })}>
                                            <span className="text-muted/50 mr-4 select-none w-8 inline-block text-right">
                                                {i + 1}
                                            </span>
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token })} />
                                            ))}
                                        </div>
                                    ))}
                                </pre>
                            )}
                        </Highlight>
                        {/* Editable textarea overlay */}
                        <textarea
                            value={code}
                            onChange={handleCodeChange}
                            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white font-mono text-sm p-4 pl-16 resize-none outline-none"
                            spellCheck={false}
                        />
                    </div>
                ) : (
                    <Highlight
                        theme={themes.nightOwl}
                        code={code}
                        language={language as "python" | "javascript"}
                    >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                            <pre
                                className={`${className} p-4 text-sm overflow-x-auto`}
                                style={{ ...style, margin: 0 }}
                            >
                                {tokens.map((line, i) => (
                                    <div key={i} {...getLineProps({ line })}>
                                        <span className="text-muted/50 mr-4 select-none w-8 inline-block text-right">
                                            {i + 1}
                                        </span>
                                        {line.map((token, key) => (
                                            <span key={key} {...getTokenProps({ token })} />
                                        ))}
                                    </div>
                                ))}
                            </pre>
                        )}
                    </Highlight>
                )}
            </div>

            {/* Output */}
            {result && (
                <div className="border-t border-border">
                    <div className="px-4 py-2 bg-neutral-900 text-xs text-muted flex justify-between items-center">
                        <span>Output</span>
                        {result.image && <span className="text-[10px] bg-primary/10 text-primary px-1 rounded">Graph Generated</span>}
                    </div>

                    {/* Console Output */}
                    {(result.output || result.error) && (
                        <pre className={`p-4 text-sm font-mono whitespace-pre-wrap ${result.error ? 'text-red-400' : 'text-green-400'}`}>
                            {result.error || result.output}
                        </pre>
                    )}

                    {/* Image Output */}
                    {result.image && (
                        <div className="p-4 bg-white rounded-b-lg flex justify-center">
                            <img
                                src={`data:image/png;base64,${result.image}`}
                                alt="Generated Plot"
                                className="max-w-full h-auto rounded shadow-sm"
                            />
                        </div>
                    )}

                    {!result.output && !result.error && !result.image && (
                        <div className="p-4 text-sm text-muted font-mono">(No output)</div>
                    )}
                </div>
            )}
        </div>
    );
}
