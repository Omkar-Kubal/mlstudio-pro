import { subjects } from "@/adapters/subjects";
import SubjectPageClient from "./SubjectPageClient";

// Required for next build with output: 'export'
export function generateStaticParams() {
    return subjects.map((s) => ({ subject: s.slug }));
}

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
    const { subject } = await params;

    return <SubjectPageClient subjectSlug={subject} />;
}
