/**
 * Content Mapping Utility
 * Maps sXmY.txt filenames to subject/module slugs based on data order
 */

import { subjects } from '@/data/subjects';
import { modules } from '@/data/modules';

export interface ContentMapping {
    filename: string;
    subjectSlug: string;
    moduleSlug: string;
    subjectIndex: number;
    moduleIndex: number;
}

/**
 * Get the content file path for a given subject and module
 */
export function getContentFilePath(subjectSlug: string, moduleSlug: string): string | null {
    const mapping = getAllMappings().find(
        m => m.subjectSlug === subjectSlug && m.moduleSlug === moduleSlug
    );

    if (!mapping) return null;

    return `core/content/curriculum/foundations/json/${mapping.filename.replace('.txt', '.json')}`;
}

/**
 * Get the content mapping for a given subject and module
 */
export function getContentMapping(subjectSlug: string, moduleSlug: string): ContentMapping | null {
    return getAllMappings().find(
        m => m.subjectSlug === subjectSlug && m.moduleSlug === moduleSlug
    ) || null;
}

/**
 * Get subject and module slugs from a filename
 */
export function getSlugsFromFilename(filename: string): { subjectSlug: string; moduleSlug: string } | null {
    const match = filename.match(/s(\d+)m(\d+)\.txt/);
    if (!match) return null;

    const subjectIndex = parseInt(match[1], 10);
    const moduleIndex = parseInt(match[2], 10);

    const mapping = getAllMappings().find(
        m => m.subjectIndex === subjectIndex && m.moduleIndex === moduleIndex
    );

    if (!mapping) return null;

    return {
        subjectSlug: mapping.subjectSlug,
        moduleSlug: mapping.moduleSlug
    };
}

/**
 * Generate all content mappings based on subject and module order
 */
export function getAllMappings(): ContentMapping[] {
    const mappings: ContentMapping[] = [];

    // Sort subjects by order
    const sortedSubjects = [...subjects].sort((a, b) => a.order - b.order);

    sortedSubjects.forEach((subject, subjectIdx) => {
        // Get modules for this subject, sorted by order
        const subjectModules = modules
            .filter(m => m.subjectSlug === subject.slug)
            .sort((a, b) => a.order - b.order);

        subjectModules.forEach((module, moduleIdx) => {
            mappings.push({
                filename: `s${subjectIdx + 1}m${moduleIdx + 1}.txt`,
                subjectSlug: subject.slug,
                moduleSlug: module.slug,
                subjectIndex: subjectIdx + 1,
                moduleIndex: moduleIdx + 1
            });
        });
    });

    return mappings;
}

/**
 * Check if content file exists for a subject/module combination
 */
export function hasContentFile(subjectSlug: string, moduleSlug: string): boolean {
    return getContentFilePath(subjectSlug, moduleSlug) !== null;
}

/**
 * Get all available content files
 */
export function getAvailableContentFiles(): string[] {
    return [
        's1m1.txt', 's1m2.txt', 's1m3.txt', 's1m4.txt',
        's2m1.txt', 's2m2.txt', 's2m3.txt', 's2m4.txt',
        's3m1.txt', 's3m2.txt',
        's4m1.txt', 's4m2.txt', 's4m3.txt', 's4m4.txt',
        's5m1.txt', 's5m2.txt', 's5m3.txt',
        's6m1.txt', 's6m2.txt', 's6m3.txt',
        's7m1.txt', 's7m2.txt'
    ];
}
