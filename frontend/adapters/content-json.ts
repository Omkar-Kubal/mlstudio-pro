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

// ============================================================================
// Conversion to ParsedContent (UI Compatibility)
// ============================================================================

/**
 * Convert a LearningModule to ParsedContent for backward compatibility.
 * This allows gradual migration of UI components.
 */
export function toParsedContent(module: LearningModule): ParsedContent {
    const sections: ContentSection[] = [];

    // Add overview as paragraphs
    module.overview.forEach((para) => {
        sections.push({ type: 'paragraph', content: para });
    });

    // Add topics
    module.topics.forEach((topic) => {
        // Topic title as heading
        sections.push({ type: 'heading', content: topic.title, level: 2 });

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

    // Flatten all code snippets
    const codeSnippets = module.topics.flatMap((t) => t.code);

    return {
        title: module.meta.module,
        sections,
        codeSnippets,
        quiz: module.quiz,
        references: module.references,
        visualSuggestions: module.topics[0]?.visualSuggestions || [],
    };
}
