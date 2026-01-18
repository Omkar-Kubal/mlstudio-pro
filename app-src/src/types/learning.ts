// Learning system type definitions

export interface Subject {
    id: string;
    slug: string;
    title: string;
    description: string;
    order: number;
    icon?: string;
}

export interface Module {
    id: string;
    slug: string;
    subjectSlug: string;
    title: string;
    description: string;
    order: number;
}

export interface Topic {
    id: string;
    slug: string;
    subjectSlug: string;
    moduleSlug: string;
    title: string;
    description: string;
    order: number;
    prerequisites?: string[];
    outcomes?: string[];
}

export interface TheoryBlock {
    id: string;
    type: 'paragraph' | 'heading' | 'list' | 'equation';
    content: string;
    level?: number; // for headings
}

export interface VisualConfig {
    type: string; // 'regression-line' | 'decision-boundary' | 'loss-surface' etc.
    parameters: Record<string, number | string | boolean>;
    controls?: VisualControl[];
}

export interface VisualControl {
    id: string;
    label: string;
    type: 'slider' | 'toggle' | 'select';
    min?: number;
    max?: number;
    step?: number;
    defaultValue: number | string | boolean;
    options?: { label: string; value: string | number }[];
}

export interface CodeConfig {
    language: 'python';
    template: string;
    editable: boolean;
    highlightLines?: number[];
}

export interface PlaygroundConfig {
    dataset: string; // sklearn dataset name
    controls: PlaygroundControl[];
}

export interface PlaygroundControl {
    id: string;
    label: string;
    type: 'slider' | 'select';
    min?: number;
    max?: number;
    step?: number;
    defaultValue: number | string;
    options?: { label: string; value: string | number }[];
}

export interface TopicContent {
    topicSlug: string;
    theory: TheoryBlock[];
    visual: VisualConfig;
    code: CodeConfig;
    playground: PlaygroundConfig;
}

// Parsed content types (from .txt files)
export interface ParsedContent {
    title: string;
    sections: ContentSection[];
    codeSnippets: CodeSnippet[];
    quiz: string[];
    references: string[];
}

export interface ContentSection {
    type: 'heading' | 'paragraph' | 'list' | 'reference';
    content: string;
    level?: number;
}

export interface CodeSnippet {
    language: string;
    content: string;
    description?: string;
}

export interface CodeExecutionResult {
    output: string;
    error?: string;
    executionTime?: number;
}

