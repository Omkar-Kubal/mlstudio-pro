import { supabase } from '@/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // Get current session token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
    };

    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(`API Error [${response.status}]: ${error.detail || response.statusText}`);
    }

    return response.json();
}
