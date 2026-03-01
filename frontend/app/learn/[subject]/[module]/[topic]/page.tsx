import { subjects } from "@/adapters/subjects";
import { modules as allModules } from "@/adapters/modules";
import { getTopicsByModule } from "@/adapters/topics";
import TopicPageClient from "./TopicPageClient";

// Required for next build with output: 'export'
export function generateStaticParams() {
    const params: { subject: string; module: string; topic: string }[] = [];
    for (const s of subjects) {
        for (const mod of allModules.filter(mod => mod.subjectSlug === s.slug)) {
            for (const t of getTopicsByModule(mod.slug)) {
                params.push({ subject: s.slug, module: mod.slug, topic: t.slug });
            }
        }
    }
    return params;
}

export default async function TopicPage({
    params,
}: {
    params: Promise<{ subject: string; module: string; topic: string }>;
}) {
    const { subject, module, topic } = await params;

    return <TopicPageClient subjectSlug={subject} moduleSlug={module} topicSlug={topic} />;
}
