import { Subject } from '@/types/learning';

export interface SubjectMeta {
    difficulty: 'Beginner' | 'Core' | 'Advanced';
    modules: number;
    hours: string;
    format: ('theory' | 'code' | 'visual' | 'interactive')[];
    prerequisites?: string[];
}

export const subjectMeta: Record<string, SubjectMeta> = {
    'foundations': {
        difficulty: 'Beginner',
        modules: 4,
        hours: '6-8',
        format: ['theory', 'visual'],
        prerequisites: [],
    },
    'programming': {
        difficulty: 'Beginner',
        modules: 5,
        hours: '10-12',
        format: ['code', 'interactive'],
        prerequisites: [],
    },
    'data-handling': {
        difficulty: 'Core',
        modules: 4,
        hours: '8-10',
        format: ['code', 'interactive'],
        prerequisites: ['programming'],
    },
    'machine-learning': {
        difficulty: 'Core',
        modules: 6,
        hours: '12-15',
        format: ['theory', 'code', 'visual'],
        prerequisites: ['foundations', 'programming'],
    },
    'model-evaluation': {
        difficulty: 'Core',
        modules: 3,
        hours: '4-6',
        format: ['theory', 'code'],
        prerequisites: ['machine-learning'],
    },
    'deep-learning': {
        difficulty: 'Advanced',
        modules: 5,
        hours: '10-12',
        format: ['theory', 'code', 'visual'],
        prerequisites: ['machine-learning'],
    },
    'applied-domains': {
        difficulty: 'Advanced',
        modules: 4,
        hours: '8-10',
        format: ['code', 'interactive'],
        prerequisites: ['deep-learning'],
    },
};

export const subjects: Subject[] = [
    {
        id: 'foundations',
        slug: 'foundations',
        title: 'Foundations',
        description: 'Math, statistics, and intuition behind data',
        order: 1,
        icon: '📘',
    },
    {
        id: 'programming',
        slug: 'programming',
        title: 'Programming for Data Science',
        description: 'Python, NumPy, Pandas, and visualization',
        order: 2,
        icon: '💻',
    },
    {
        id: 'data-handling',
        slug: 'data-handling',
        title: 'Data Handling',
        description: 'Cleaning, engineering, and preparation',
        order: 3,
        icon: '🧹',
    },
    {
        id: 'machine-learning',
        slug: 'machine-learning',
        title: 'Machine Learning',
        description: 'Regression, classification, clustering, and ensembles',
        order: 4,
        icon: '🤖',
    },
    {
        id: 'model-evaluation',
        slug: 'model-evaluation',
        title: 'Model Evaluation',
        description: 'Metrics, validation, and bias-variance tradeoff',
        order: 5,
        icon: '📊',
    },
    {
        id: 'deep-learning',
        slug: 'deep-learning',
        title: 'Deep Learning',
        description: 'Neural networks, CNNs, and transformers',
        order: 6,
        icon: '🧠',
    },
    {
        id: 'applied-domains',
        slug: 'applied-domains',
        title: 'Applied Domains',
        description: 'Computer vision, NLP, and end-to-end systems',
        order: 7,
        icon: '🌍',
    },
];
