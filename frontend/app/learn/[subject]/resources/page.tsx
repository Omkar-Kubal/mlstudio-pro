import { subjects } from "@/adapters/subjects";
import ResourcesPageClient from "./ResourcesPageClient";

// Required for next build with output: 'export'
export async function generateStaticParams() {
    return subjects.map((s) => ({
        subject: s.slug,
    }));
}

export default async function ResourcesPage(props: { params: Promise<{ subject: string }> }) {
    const { subject } = await props.params;

    return <ResourcesPageClient subjectSlug={subject} />;
}
