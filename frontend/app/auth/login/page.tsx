"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendSignInLinkToEmail,
    signInWithPopup,
    GoogleAuthProvider,
    GithubAuthProvider
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordLogin, setIsPasswordLogin] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (user && !authLoading) {
            router.push("/learn");
        }
    }, [user, authLoading, router]);

    const handleMagicLinkLogin = async () => {
        const actionCodeSettings = {
            url: `${window.location.origin}/auth/callback`,
            handleCodeInApp: true,
        };
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setMessage({ type: 'success', text: "Check your email for the magic link! It may take a minute to arrive." });
        } catch (error: any) {
            handleAuthError(error);
        }
    };

    const handlePasswordLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/learn");
        } catch (error: any) {
            handleAuthError(error);
        }
    };

    const handleSignUp = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setMessage({ type: 'success', text: "Account created! You are now signed in." });
            router.push("/learn");
        } catch (error: any) {
            handleAuthError(error);
        }
    };

    const handleAuthError = (error: { code?: string; message: string }) => {
        const code = error.code;
        if (code === "auth/too-many-requests") {
            setMessage({ type: 'error', text: "Too many login attempts. Please wait a few minutes." });
        } else if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
            setMessage({ type: 'error', text: "Invalid email or password. Please try again or use Magic Link." });
        } else if (code === "auth/email-already-in-use") {
            setMessage({ type: 'error', text: "This email is already registered. Please sign in instead." });
        } else if (code === "auth/account-exists-with-different-credential") {
            setMessage({
                type: 'error',
                text: "An account already exists with this email address but using a different sign-in method (e.g., Google or Email). Please use your original method to sign in."
            });
        } else if (code === "auth/operation-not-allowed") {
            setMessage({ type: 'error', text: "This login method is currently disabled in Firebase Console." });
        } else if (code === "auth/network-request-failed") {
            setMessage({
                type: 'error',
                text: "Unable to reach authentication server. Check your connection or Firebase project status."
            });
        } else {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage({ type: 'error', text: "Please enter a valid email address." });
            return;
        }

        if ((isPasswordLogin || isSignUp) && !password) {
            setMessage({ type: 'error', text: "Please enter a password." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                await handleSignUp();
            } else if (isPasswordLogin) {
                await handlePasswordLogin();
            } else {
                await handleMagicLinkLogin();
            }
        } catch {
            setMessage({ type: 'error', text: "An unexpected error occurred. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubLogin = async () => {
        try {
            const provider = new GithubAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            handleAuthError(error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            handleAuthError(error);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-black px-6">
            <div className="w-full max-w-[400px] space-y-8 animate-fade-in-up">
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-2xl font-black tracking-tighter text-white">MLSTUDIO<span className="text-[#525252]">.PRO</span></span>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                    <p className="text-[#a0a0a0]">Sign in to your learning dashboard</p>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleGitHubLogin}
                            className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-[#262626] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#262626] transition-colors"
                        >
                            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </button>

                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-[#e0e0e0] transition-colors"
                        >
                            <svg className="size-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </div>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#262626]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-[#525252]">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0d0d0d] border border-[#262626] rounded-xl px-4 py-3 text-white placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            />
                            {(isPasswordLogin || isSignUp) && (
                                <input
                                    type="password"
                                    placeholder={isSignUp ? "choose a password" : "your password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0d0d0d] border border-[#262626] rounded-xl px-4 py-3 text-white placeholder:text-[#525252] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all animate-in fade-in slide-in-from-top-2"
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-3 px-1">
                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPasswordLogin(!isPasswordLogin);
                                        setIsSignUp(false);
                                        setMessage(null);
                                    }}
                                    className="text-xs text-[#a0a0a0] hover:text-white transition-colors"
                                >
                                    {isPasswordLogin ? "Use Magic Link instead" : "Sign in with password"}
                                </button>
                                {isPasswordLogin && !isSignUp && (
                                    <Link href="/auth/forgot-password" className="text-xs text-[#a0a0a0] hover:text-white transition-colors">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setIsPasswordLogin(false);
                                    setMessage(null);
                                }}
                                className="text-xs text-[#a0a0a0] hover:text-white transition-colors text-left"
                            >
                                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
                        >
                            {loading ? "Processing..." : (isSignUp ? "Create Account" : (isPasswordLogin ? "Sign In" : "Send Magic Link"))}
                        </button>
                    </form>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {message.text}
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-[#525252]">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </main>
    );
}
