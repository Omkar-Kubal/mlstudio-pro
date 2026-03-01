"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage({
                type: "success",
                text: "Password reset email sent! Check your inbox.",
            });
        } catch (err: unknown) {
            const code = (err as { code?: string }).code;
            if (code === "auth/user-not-found") {
                setMessage({ type: "error", text: "No account found with this email address." });
            } else {
                setMessage({ type: "error", text: "Failed to send reset email. Please try again." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-black px-6">
            <div className="w-full max-w-[400px] space-y-8">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-2xl font-black tracking-tighter text-white">MLSTUDIO<span className="text-[#525252]">.PRO</span></span>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
                    <p className="text-[#a0a0a0] text-sm">Enter your email and we&apos;ll send a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#0d0d0d] border border-[#262626] rounded-xl px-4 py-3 text-white placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                {message && (
                    <div className={`p-4 rounded-xl text-sm ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                        {message.text}
                    </div>
                )}

                <p className="text-center text-sm text-[#525252]">
                    <Link href="/auth/login" className="text-white hover:underline">Back to Login</Link>
                </p>
            </div>
        </main>
    );
}
