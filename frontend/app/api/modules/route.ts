import { NextResponse } from 'next/server';
import { modules } from '@/adapters/modules';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subjectSlug = searchParams.get('subject');

    if (subjectSlug) {
        const filtered = modules.filter(m => m.subjectSlug === subjectSlug);
        return NextResponse.json(filtered);
    }

    return NextResponse.json(modules);
}
