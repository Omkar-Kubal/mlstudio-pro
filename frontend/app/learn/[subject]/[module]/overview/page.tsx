import { subjects } from "@/adapters/subjects";
import { modules } from "@/adapters/modules";
import OverviewPageClient from "./OverviewPageClient";

// Required for next build with output: 'export'
export async function generateStaticParams() {
    return modules.map((m) => ({
        subject: m.subjectSlug,
        module: m.slug,
    }));
}

export default async function ModuleOverviewPage(props: { params: Promise<{ subject: string; module: string }> }) {
    const { subject, module } = await props.params;

    return <OverviewPageClient subjectSlug={subject} moduleSlug={module} />;
}
