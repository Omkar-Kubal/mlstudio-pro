/**
 * JSON Content Loader (Consumer)
 * 
 * Talks to the backend API to fetch learning modules.
 * No direct file access or Markdown parsing.
 */

import { apiFetch } from './api';
import type {
    LearningModule,
    ParsedContent,
    ContentSection,
} from './content-types';

// ============================================================================
// API Calls
// ============================================================================

/**
 * Load a learning module from the backend.
 * Throws if backend is down or module not found.
 */
export async function loadModule(
    subjectIndex: number,
    moduleIndex: number
): Promise<LearningModule> {
    const lessonId = `s${subjectIndex}m${moduleIndex}`;
    return apiFetch<LearningModule>(`/curriculum/${lessonId}`);
}

/**
 * Load a learning module by subject and module slugs.
 * Uses the existing content mapping to resolve indices.
 */
export async function loadModuleBySlug(
    subjectSlug: string,
    moduleSlug: string
): Promise<LearningModule | null> {
    // Import mapping dynamically to avoid circular deps
    const { getContentMapping } = await import('./content-mapping');
    const mapping = getContentMapping(subjectSlug, moduleSlug);

    if (!mapping) {
        return null;
    }

    try {
        return await loadModule(mapping.subjectIndex, mapping.moduleIndex);
    } catch (error) {
        console.error('Failed to load module by slug:', error);
        return null;
    }
}

import { topics } from './topics';

// ============================================================================
// Conversion to ParsedContent (UI Compatibility)
// ============================================================================

/**
 * Convert a LearningModule to ParsedContent for backward compatibility.
 * This allows gradual migration of UI components.
 * If topicSlug is provided, it filters the content to only include that topic.
 */
export function toParsedContent(module: LearningModule, topicSlug: string | null = null): ParsedContent {
    const sections: ContentSection[] = [];
    let topicsToInclude = module.topics;
    const quiz = module.quiz;

    // Filter by topic if slug is provided
    if (topicSlug) {
        // We need to find which topic in the JSON corresponds to this slug
        // Using the topics adapter to get the order
        const topicInfo = topics.find((t: { slug: string; moduleSlug: string; order: number }) => t.slug === topicSlug && t.moduleSlug === module.meta.module);

        if (topicInfo) {
            // Arrays are 0-indexed, order is 1-indexed
            const topicIndex = topicInfo.order - 1;
            if (module.topics[topicIndex]) {
                topicsToInclude = [module.topics[topicIndex]];
                // Also filter quiz if possible (for now we keep all quiz questions)
            }
        }
    } else {
        // Only include overview if no specific topic is requested
        module.overview.forEach((para) => {
            sections.push({ type: 'paragraph', content: para });
        });
    }

    // Add topics
    topicsToInclude.forEach((topic) => {
        // Topic title as heading (if multiple topics)
        if (topicsToInclude.length > 1) {
            sections.push({ type: 'heading', content: topic.title, level: 2 });
        }

        // Theory paragraphs
        topic.theory.forEach((para) => {
            sections.push({ type: 'paragraph', content: para });
        });

        // Visual intuition as styled paragraphs
        if (topic.visualIntuition && topic.visualIntuition.length > 0) {
            sections.push({ type: 'heading', content: 'Visual Intuition', level: 3 });
            topic.visualIntuition.forEach((para) => {
                sections.push({ type: 'paragraph', content: para });
            });
        }

        // Code snippets
        topic.code.forEach((snippet) => {
            sections.push({
                type: 'code',
                content: snippet.content,
                language: snippet.language,
            });
        });
    });

    // Extract code snippets for the included topics
    const codeSnippets = topicsToInclude.flatMap((t) => t.code);

    return {
        title: topicsToInclude.length > 0 ? topicsToInclude[0].title : module.meta.module,
        sections,
        codeSnippets,
        quiz: quiz,
        references: module.references,
        visualSuggestions: topicsToInclude[0]?.visualSuggestions || [],
        _raw: module,
    };
}
