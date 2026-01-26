import { NextResponse } from 'next/server';
import { subjects } from '@/data/subjects';

export async function GET() {
    return NextResponse.json(subjects);
}
