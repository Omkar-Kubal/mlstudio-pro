import { Topic } from '@/adapters/learning';

// Sample topics for Regression module (will expand to all 379 topics)
export const topics: Topic[] = [
    // REGRESSION MODULE
    {
        id: 'what-is-regression',
        slug: 'what-is-regression',
        subjectSlug: 'machine-learning',
        moduleSlug: 'regression',
        title: 'What is Regression?',
        description: 'Understanding regression as a supervised learning task',
        order: 1,
        prerequisites: [],
        outcomes: ['Understand regression problems', 'Differentiate from classification'],
    },
    {
        id: 'simple-linear-regression',
        slug: 'simple-linear-regression',
        subjectSlug: 'machine-learning',
        moduleSlug: 'regression',
        title: 'Simple Linear Regression',
        description: 'Fitting a line to data with one feature',
        order: 2,
        prerequisites: ['what-is-regression'],
        outcomes: ['Understand slope and intercept', 'Visualize regression line'],
    },
    {
        id: 'loss-functions-mse-mae',
        slug: 'loss-functions-mse-mae',
        subjectSlug: 'machine-learning',
        moduleSlug: 'regression',
        title: 'Loss Functions: MSE & MAE',
        description: 'Measuring prediction error',
        order: 3,
        prerequisites: ['simple-linear-regression'],
        outcomes: ['Understand MSE and MAE', 'Compare loss functions'],
    },
    {
        id: 'gradient-descent-intuition',
        slug: 'gradient-descent-intuition',
        subjectSlug: 'machine-learning',
        moduleSlug: 'regression',
        title: 'Gradient Descent Intuition',
        description: 'How models learn by minimizing loss',
        order: 4,
        prerequisites: ['loss-functions-mse-mae'],
        outcomes: ['Understand gradient descent', 'Visualize optimization'],
    },
    {
        id: 'multiple-linear-regression',
        slug: 'multiple-linear-regression',
        subjectSlug: 'machine-learning',
        moduleSlug: 'regression',
        title: 'Multiple Linear Regression',
        description: 'Regression with multiple features',
        order: 5,
        prerequisites: ['simple-linear-regression'],
        outcomes: ['Extend to multiple features', 'Understand coefficients'],
    },

    // Add more topics as needed...
    // For now, this demonstrates the structure
];

// Helper functions
export function getTopicsByModule(moduleSlug: string): Topic[] {
    return topics.filter(t => t.moduleSlug === moduleSlug).sort((a, b) => a.order - b.order);
}

export function getTopicBySlug(slug: string): Topic | undefined {
    return topics.find(t => t.slug === slug);
}
