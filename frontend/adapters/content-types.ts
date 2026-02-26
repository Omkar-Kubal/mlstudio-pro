/**
 * Learning Module Content Types
 * 
 * TypeScript interfaces for the JSON content schema.
 * This is the canonical type definition for all learning modules.
 */

// ============================================================================
// Core Types
// ============================================================================

export type ContentLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ModuleMeta {
    /** Subject slug (e.g., "foundations", "machine-learning") */
    subject: string;
    /** Module slug (e.g., "statistics", "regression") */
    module: string;
    /** Difficulty level */
    level: ContentLevel;
    /** Estimated completion time in hours */
    estimatedHours: number;
}

export interface CodeSnippet {
    /** Programming language (e.g., "python") */
    language: string;
    /** Brief description of what the code does */
    description: string;
    /** The actual code content */
    content: string;
}

export interface Reference {
    /** Display label for the reference */
    label: string;
    /** URL (may be empty string if unavailable) */
    url: string;
}

export interface Topic {
    /** Topic title */
    title: string;
    /** Theory paragraphs explaining the concept */
    theory: string[];
    /** Descriptions of intuitive visual explanations */
    visualIntuition: string[];
    /** Suggested interactive visualizations */
    visualSuggestions: string[];
    /** Code examples (may be empty) */
    code: CodeSnippet[];
}

export interface LearningModule {
    /** Module metadata */
    meta: ModuleMeta;
    /** Overview paragraphs introducing the module */
    overview: string[];
    /** Learning topics (empty array indicates placeholder) */
    topics: Topic[];
    /** Review questions (supports both legacy string array and structured QuizQuestion objects) */
    quiz: Array<string | QuizQuestion>;
    /** External references and resources */
    references: Reference[];
    /** Internal warnings about content issues (not shown to users) */
    _contentWarnings?: string[];
}

// ============================================================================
// Validation Types
// ============================================================================

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// ============================================================================
// Content Mapping
// ============================================================================

export interface ContentMapping {
    filename: string;
    subjectSlug: string;
    moduleSlug: string;
    subjectIndex: number;
    moduleIndex: number;
}

// ============================================================================
// Parsed Content (for UI compatibility)
// ============================================================================

export interface ContentSection {
    type: 'heading' | 'paragraph' | 'list' | 'code' | 'link';
    content: string;
    level?: number;
    items?: string[];
    language?: string;
}

export interface ParsedContent {
    title: string;
    sections: ContentSection[];
    codeSnippets: CodeSnippet[];
    quiz: Array<string | QuizQuestion>;
    references: Reference[];
    visualSuggestions?: string[];
    _raw?: LearningModule;
}
