"use client";

import { ContentSection } from "@/types/learning";

interface TheoryPanelProps {
    title: string;
    sections: ContentSection[];
}

export default function TheoryPanel({ title, sections }: TheoryPanelProps) {
    return (
        <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-medium text-foreground mb-6">{title}</h2>

            {sections.map((section, index) => {
                switch (section.type) {
                    case 'heading':
                        return renderHeading(section, index);
                    case 'paragraph':
                        return (
                            <p key={index} className="text-muted leading-relaxed mb-4">
                                {section.content}
                            </p>
                        );
                    case 'list':
                        return (
                            <ul key={index} className="list-disc list-inside text-muted mb-4 space-y-1">
                                {section.content.split('\n').map((item, i) => (
                                    <li key={i}>{item.replace(/^[-•]\s*/, '')}</li>
                                ))}
                            </ul>
                        );
                    case 'reference':
                        return (
                            <a
                                key={index}
                                href={section.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline text-sm block mb-2"
                            >
                                {section.content}
                            </a>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}

function renderHeading(section: ContentSection, index: number) {
    const level = section.level || 3;
    const baseClass = "font-medium text-foreground";

    switch (level) {
        case 1:
            return <h1 key={index} className={`text-3xl ${baseClass} mt-8 mb-4`}>{section.content}</h1>;
        case 2:
            return <h2 key={index} className={`text-2xl ${baseClass} mt-6 mb-3`}>{section.content}</h2>;
        case 3:
            return <h3 key={index} className={`text-xl ${baseClass} mt-5 mb-2`}>{section.content}</h3>;
        case 4:
            return <h4 key={index} className={`text-lg ${baseClass} mt-4 mb-2`}>{section.content}</h4>;
        case 5:
            return <h5 key={index} className={`text-base text-muted mt-3 mb-1`}>{section.content}</h5>;
        case 6:
            return <h6 key={index} className={`text-sm text-muted mt-2 mb-1`}>{section.content}</h6>;
        default:
            return <h3 key={index} className={`text-xl ${baseClass} mt-5 mb-2`}>{section.content}</h3>;
    }
}

