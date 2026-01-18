import { NextResponse } from 'next/server';
import { loadModuleBySlug, toParsedContent } from '@/lib/content-json';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const module = searchParams.get('module');

    if (!subject || !module) {
        return NextResponse.json(
            { error: 'Both subject and module parameters are required' },
            { status: 400 }
        );
    }

    try {
        const learningModule = await loadModuleBySlug(subject, module);

        if (!learningModule) {
            return NextResponse.json(
                { error: 'Content not found for this subject/module' },
                { status: 404 }
            );
        }

        // Convert to ParsedContent for UI compatibility
        const parsedContent = toParsedContent(learningModule);

        // Include raw module for new components that want full schema
        return NextResponse.json({
            ...parsedContent,
            _raw: learningModule,
        });
    } catch (error) {
        console.error('[Content API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to load content', details: String(error) },
            { status: 500 }
        );
    }
}
