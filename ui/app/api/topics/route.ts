import { NextResponse } from 'next/server';
import { topics } from '@/data/topics';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moduleSlug = searchParams.get('module');

    if (moduleSlug) {
        const filtered = topics.filter(t => t.moduleSlug === moduleSlug);
        return NextResponse.json(filtered);
    }

    return NextResponse.json(topics);
}
