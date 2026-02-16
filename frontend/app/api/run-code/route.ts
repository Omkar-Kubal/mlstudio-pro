import { NextResponse } from 'next/server';

const PISTON_API = 'https://emkc.org/api/v2/piston/execute';

interface RunCodeRequest {
    language: string;
    code: string;
    stdin?: string;
}

interface PistonResponse {
    run: {
        stdout: string;
        stderr: string;
        code: number;
        signal: string | null;
        output: string;
    };
    compile?: {
        stdout: string;
        stderr: string;
        code: number;
    };
}

export async function POST(request: Request) {
    try {
        const body: RunCodeRequest = await request.json();
        const { language = 'python', code, stdin = '' } = body;

        if (!code) {
            return NextResponse.json(
                { error: 'Code is required' },
                { status: 400 }
            );
        }

        // Map language to Piston language version
        const languageVersions: Record<string, string> = {
            python: '3.10.0',
            javascript: '18.15.0',
            typescript: '5.0.3',
        };

        // Map language to backend runner if Python, otherwise use Piston
        if (language === 'python') {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const backendResponse = await fetch(`${backendUrl}/runner/run`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, language }),
                });

                if (backendResponse.ok) {
                    const result = await backendResponse.json();
                    return NextResponse.json({
                        output: result.stdout,
                        error: result.stderr || undefined,
                        exitCode: result.exit_code,
                        image: result.image || undefined,
                        executionTime: Date.now(),
                    });
                }
                // If backend fails, fallback to Piston or return error
                console.warn('Backend runner failed, falling back to Piston');
            } catch (err) {
                console.error('Error connecting to backend runner:', err);
            }
        }

        const version = languageVersions[language] || languageVersions.python;

        const pistonResponse = await fetch(PISTON_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: language === 'python' ? 'python' : language,
                version,
                files: [
                    {
                        name: language === 'python' ? 'main.py' : 'main.js',
                        content: code,
                    },
                ],
                stdin,
                compile_timeout: 10000,
                run_timeout: 5000,
            }),
        });

        if (!pistonResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to execute code', details: await pistonResponse.text() },
                { status: 500 }
            );
        }

        const result: PistonResponse = await pistonResponse.json();

        return NextResponse.json({
            output: result.run.stdout || result.run.output,
            error: result.run.stderr || (result.compile?.stderr) || undefined,
            exitCode: result.run.code,
            executionTime: Date.now(), // Piston doesn't return execution time
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Server error', details: String(error) },
            { status: 500 }
        );
    }
}
