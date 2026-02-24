import { NextResponse, NextRequest } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ module: string; topic: string }> }
) {
    const { module, topic } = await params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const authHeader = request.headers.get('authorization');

    try {
        const response = await fetch(
            `${backendUrl}/curriculum/progress/${module}/${topic}`,
            {
                method: 'POST',
                headers: authHeader ? { 'Authorization': authHeader } : {}
            }
        );

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to update progress' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
