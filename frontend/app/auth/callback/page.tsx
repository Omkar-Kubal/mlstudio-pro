"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session) => {
            if (event === "SIGNED_IN" && session) {
                router.push("/learn");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="size-12 border-4 border-t-white border-white/10 rounded-full animate-spin"></div>
        </div>
    );
}
