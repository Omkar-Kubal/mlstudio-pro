export interface Section {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    frameRange: [number, number];
}

export const sections: Section[] = [
    {
        id: "observe",
        title: "Visualize ML Behavior",
        subtitle: "See how models learn.",
        description: "Watch neural networks process data, gradients flow, and patterns emerge — before writing a single line of code.",
        frameRange: [1, 50]
    },
    {
        id: "interact",
        title: "Interact with Parameters",
        subtitle: "Change inputs, see effects.",
        description: "Adjust learning rates, modify architectures, and observe how small changes create different outcomes.",
        frameRange: [51, 100]
    },
    {
        id: "understand",
        title: "Understand Relationships",
        subtitle: "Build lasting intuition.",
        description: "Grasp why techniques work — bias-variance tradeoff, regularization, feature importance — through visual reasoning.",
        frameRange: [101, 150]
    },
    {
        id: "apply",
        title: "Write Code with Confidence",
        subtitle: "Implementation becomes natural.",
        description: "When you understand the system, the code writes itself. Move from concept to working implementation.",
        frameRange: [151, 200]
    }
];

export const TOTAL_FRAMES = 200;
