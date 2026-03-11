"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

// Define a common User interface to avoid breaking components during migration
export interface User {
    id: string;
    email: string | null;
    displayName?: string | null;
    isAdmin: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
});

/** Inner component that starts session tracking once the user is authenticated */
function SessionTracker() {
    useSession();
    return null;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Firebase onAuthStateChanged returns an unsubscribe function
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // Get ID Token Result to check for custom 'admin' claim
                const idTokenResult = await firebaseUser.getIdTokenResult();
                // FIX V-2.3: Re-verify admin status EXCLUSIVELY via custom claims.
                // Fallback to email matching is insecure and should be avoided in production.
                const isAdmin = !!idTokenResult.claims.admin;

                // Map Firebase User to our App User interface
                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    isAdmin: !!isAdmin
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("[AuthContext] Firebase Auth error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            router.push("/");
        } catch (error) {
            console.error("[AuthContext] Sign out error:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            <SessionTracker />
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
