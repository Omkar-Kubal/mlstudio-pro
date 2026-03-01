import { subjects } from "@/adapters/subjects";
import { modules as allModules } from "@/adapters/modules";
import ModulePageClient from "./ModulePageClient";

// Required for next build with output: 'export'
export function generateStaticParams() {
    const params: { subject: string; module: string }[] = [];
    for (const s of subjects) {
        for (const m of allModules.filter(m => m.subjectSlug === s.slug)) {
            params.push({ subject: s.slug, module: m.slug });
        }
    }
    return params;
}

export default async function ModulePage({ params }: { params: Promise<{ subject: string; module: string }> }) {
    const { subject, module } = await params;

    return <ModulePageClient subjectSlug={subject} moduleSlug={module} />;
}
