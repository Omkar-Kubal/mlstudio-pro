import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Mock client for local development when Supabase is unreachable
const createMockClient = () => {
    const MOCK_STORAGE_KEY = 'sb-mock-auth-token';
    const listeners = new Set<(event: string, session: any) => void>();

    const getStoredSession = () => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(MOCK_STORAGE_KEY);
        if (!stored) return null;
        return JSON.parse(stored);
    };

    const notify = (event: string, session: any) => {
        listeners.forEach(l => l(event, session));
    };

    return {
        auth: {
            getSession: async () => ({ data: { session: getStoredSession() }, error: null }),
            onAuthStateChange: (callback: any) => {
                listeners.add(callback);
                // Trigger initial call
                const session = getStoredSession();
                setTimeout(() => callback('SIGNED_IN', session), 0);
                return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
            },
            signInWithPassword: async ({ email, password }: any) => {
                if (email === 'admin@admin.com' && password === 'adminadmin') {
                    const session = {
                        user: { id: '00000000-0000-0000-0000-000000000000', email: 'admin@admin.com' },
                        access_token: 'mock-token'
                    };
                    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session));
                    notify('SIGNED_IN', session);
                    return { data: session, error: null };
                }
                return { data: { user: null }, error: { message: "Invalid credentials. Use admin@admin.com / adminadmin" } };
            },
            signInWithOtp: async () => ({ data: { user: null }, error: { message: "Mock Auth enabled." } }),
            signInWithOAuth: async () => ({ data: { user: null }, error: { message: "Mock Auth enabled." } }),
            signOut: async () => {
                localStorage.removeItem(MOCK_STORAGE_KEY);
                notify('SIGNED_OUT', null);
                return { error: null };
            },
            getUser: async () => ({ data: { user: getStoredSession()?.user ?? null }, error: null }),
        },
        table: () => ({
            select: () => ({
                eq: () => ({
                    single: () => ({ execute: async () => ({ data: null, error: null }) }),
                    execute: async () => ({ data: [], error: null }),
                }),
                execute: async () => ({ data: [], error: null }),
            }),
            upsert: () => ({ execute: async () => ({ data: null, error: null }) }),
            update: () => ({ eq: () => ({ execute: async () => ({ data: null, error: null }) }) }),
        }),
    } as any;
};

export const supabase = (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' || !supabaseUrl || supabaseUrl.includes('[YOUR'))
    ? createMockClient()
    : createClient(supabaseUrl, supabaseAnonKey);
