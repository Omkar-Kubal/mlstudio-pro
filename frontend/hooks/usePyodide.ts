"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CodeOutput {
    text: string;
    error?: boolean;
    image?: string;
}

export const usePyodide = () => {
    const [isReady, setIsReady] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<CodeOutput | null>(null);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize the worker
        const worker = new Worker(new URL("../lib/pyodide.worker.ts", import.meta.url));
        workerRef.current = worker;

        worker.onmessage = (event) => {
            const { type, content, image } = event.data;

            if (type === "ready") {
                setIsReady(true);
            } else if (type === "stdout") {
                setOutput((prev) => ({
                    text: (prev?.text || "") + content,
                    error: prev?.error,
                    image: prev?.image || image
                }));
            } else if (type === "stderr") {
                setOutput((prev) => ({
                    text: (prev?.text || "") + content,
                    error: true,
                    image: prev?.image || image
                }));
            } else if (type === "success") {
                setIsRunning(false);
                setOutput((prev) => ({
                    text: (prev?.text || "") + (content ? `\n\nResult: ${content}` : ""),
                    error: prev?.error,
                    image: image || prev?.image
                }));
            } else if (type === "error") {
                setIsRunning(false);
                setOutput({
                    text: content,
                    error: true
                });
            }
        };

        worker.postMessage({ type: "init" });

        return () => {
            worker.terminate();
        };
    }, []);

    const runCode = useCallback((code: string) => {
        if (!isReady || !workerRef.current) return;

        setIsRunning(true);
        setOutput({ text: "" });
        workerRef.current.postMessage({ type: "run", code });
    }, [isReady]);

    return { runCode, isReady, isRunning, output };
};
