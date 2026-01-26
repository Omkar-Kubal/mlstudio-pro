/**
 * JSON Content Loader
 * 
 * Direct loading and validation of JSON learning modules.
 * Replaces the text-based content-parser.ts with structured JSON loading.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type {
    LearningModule,
    ValidationResult,
    ParsedContent,
    ContentSection,
} from './content-types';

// ============================================================================
// Constants
// ============================================================================

const CONTENT_JSON_DIR = path.join(process.cwd(), '..', 'core', 'content', 'curriculum', 'foundations', 'json');
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate a learning module against the schema.
 * Returns hard errors and soft warnings separately.
 */
export function validateModule(data: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: ['Content is not a valid object'], warnings: [] };
    }

    const module = data as Record<string, unknown>;

    // ---- Hard Failures ----

    // meta validation
    if (!module.meta || typeof module.meta !== 'object') {
        errors.push('Missing required field: meta');
    } else {
        const meta = module.meta as Record<string, unknown>;
        if (typeof meta.subject !== 'string' || !meta.subject) {
            errors.push('Missing or invalid: meta.subject');
        }
        if (typeof meta.module !== 'string' || !meta.module) {
            errors.push('Missing or invalid: meta.module');
        }
        if (typeof meta.level !== 'string' || !VALID_LEVELS.includes(meta.level)) {
            errors.push(`Invalid meta.level: must be one of ${VALID_LEVELS.join(', ')}`);
        }
        if (typeof meta.estimatedHours !== 'number') {
            errors.push('meta.estimatedHours must be a number');
        }
    }

    // overview validation
    if (!Array.isArray(module.overview) || module.overview.length === 0) {
        errors.push('overview must be a non-empty array');
    }

    // topics validation
    if (!Array.isArray(module.topics)) {
        errors.push('topics must be an array');
    } else {
        (module.topics as unknown[]).forEach((topic, idx) => {
            if (!topic || typeof topic !== 'object') {
                errors.push(`topics[${idx}] is not a valid object`);
                return;
            }
            const t = topic as Record<string, unknown>;
            if (typeof t.title !== 'string' || !t.title) {
                errors.push(`topics[${idx}].title is missing or empty`);
            }
            if (!Array.isArray(t.theory) || t.theory.length === 0) {
                errors.push(`topics[${idx}].theory must be a non-empty array`);
            }
        });
    }

    // ---- Soft Warnings ----

    if (Array.isArray(module.topics) && module.topics.length === 0) {
        warnings.push('Module has no topics (placeholder)');
    }

    if (!Array.isArray(module.quiz) || module.quiz.length === 0) {
        warnings.push('Module has no quiz questions');
    }

    if (!Array.isArray(module.references) || module.references.length === 0) {
        warnings.push('Module has no references');
    }

    if (Array.isArray(module._contentWarnings) && module._contentWarnings.length > 0) {
        warnings.push(`Module has ${(module._contentWarnings as string[]).length} content warnings`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

// ============================================================================
// File Loading
// ============================================================================

/**
 * Get the path to a JSON content file.
 */
export function getJsonContentPath(subjectIndex: number, moduleIndex: number): string {
    const filename = `s${subjectIndex}m${moduleIndex}.json`;
    return path.join(CONTENT_JSON_DIR, filename);
}

/**
 * Load a learning module from JSON.
 * Throws if file not found or validation fails.
 */
export async function loadModule(
    subjectIndex: number,
    moduleIndex: number
): Promise<LearningModule> {
    const filePath = getJsonContentPath(subjectIndex, moduleIndex);

    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const validation = validateModule(data);
    if (!validation.valid) {
        throw new Error(`Validation failed for s${subjectIndex}m${moduleIndex}: ${validation.errors.join('; ')}`);
    }

    // Log warnings in development
    if (process.env.NODE_ENV === 'development' && validation.warnings.length > 0) {
        console.warn(`[Content] s${subjectIndex}m${moduleIndex} warnings:`, validation.warnings);
    }

    return data as LearningModule;
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

    return loadModule(mapping.subjectIndex, mapping.moduleIndex);
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
        if (topic.visualIntuition.length > 0) {
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
    };
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Load all modules (for build-time validation or static generation).
 */
export async function loadAllModules(): Promise<Map<string, LearningModule>> {
    const modules = new Map<string, LearningModule>();

    // 7 subjects, up to 4 modules each
    const structure = [
        [1, 4], // s1: 4 modules
        [2, 4], // s2: 4 modules
        [3, 2], // s3: 2 modules
        [4, 4], // s4: 4 modules
        [5, 3], // s5: 3 modules
        [6, 3], // s6: 3 modules
        [7, 2], // s7: 2 modules
    ];

    for (const [subjectIdx, moduleCount] of structure) {
        for (let moduleIdx = 1; moduleIdx <= moduleCount; moduleIdx++) {
            try {
                const module = await loadModule(subjectIdx, moduleIdx);
                const key = `s${subjectIdx}m${moduleIdx}`;
                modules.set(key, module);
            } catch (error) {
                console.error(`Failed to load s${subjectIdx}m${moduleIdx}:`, error);
            }
        }
    }

    return modules;
}

/**
 * Validate all modules and return summary.
 */
export async function validateAllModules(): Promise<{
    total: number;
    valid: number;
    invalid: number;
    allErrors: Record<string, string[]>;
    allWarnings: Record<string, string[]>;
}> {
    const allErrors: Record<string, string[]> = {};
    const allWarnings: Record<string, string[]> = {};
    let valid = 0;
    let invalid = 0;

    const structure = [
        [1, 4], [2, 4], [3, 2], [4, 4], [5, 3], [6, 3], [7, 2],
    ];

    for (const [subjectIdx, moduleCount] of structure) {
        for (let moduleIdx = 1; moduleIdx <= moduleCount; moduleIdx++) {
            const key = `s${subjectIdx}m${moduleIdx}`;
            try {
                const filePath = getJsonContentPath(subjectIdx, moduleIdx);
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);
                const result = validateModule(data);

                if (result.valid) {
                    valid++;
                } else {
                    invalid++;
                    allErrors[key] = result.errors;
                }

                if (result.warnings.length > 0) {
                    allWarnings[key] = result.warnings;
                }
            } catch (error) {
                invalid++;
                allErrors[key] = [(error as Error).message];
            }
        }
    }

    return {
        total: valid + invalid,
        valid,
        invalid,
        allErrors,
        allWarnings,
    };
}
