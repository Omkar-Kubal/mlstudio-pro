import { NextResponse } from 'next/server';
import { subjects } from '@/adapters/subjects';

export async function GET() {
    return NextResponse.json(subjects);
}
