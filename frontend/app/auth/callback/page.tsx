"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your magic link...");

    useEffect(() => {
        const handleCallback = async () => {
            const url = window.location.href;

            if (!isSignInWithEmailLink(auth, url)) {
                setStatus("error");
                setMessage("This link is invalid or has expired. Please request a new one.");
                return;
            }

            let email = window.localStorage.getItem("emailForSignIn");
            if (!email) {
                email = window.prompt("Please confirm your email address to complete sign in:") || "";
            }

            if (!email) {
                setStatus("error");
                setMessage("Email address required to complete sign-in.");
                return;
            }

            try {
                await signInWithEmailLink(auth, email, url);
                window.localStorage.removeItem("emailForSignIn");
                setStatus("success");
                setMessage("Signed in successfully! Redirecting...");
                setTimeout(() => router.push("/learn"), 1200);
            } catch (e: unknown) {
                setStatus("error");
                setMessage(e instanceof Error ? e.message : "Sign-in failed. Please try again.");
            }
        };

        handleCallback();
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
            <div className="text-center max-w-sm space-y-4">
                {status === "loading" && (
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto" />
                )}
                {status === "success" && (
                    <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
                )}
                {status === "error" && (
                    <span className="material-symbols-outlined text-5xl text-rose-400">error</span>
                )}
                <p className="text-[#a0a0a0] text-sm">{message}</p>
                {status === "error" && (
                    <a href="/auth/login" className="inline-block mt-4 text-sm text-white underline">
                        Back to Login
                    </a>
                )}
            </div>
        </main>
    );
}
