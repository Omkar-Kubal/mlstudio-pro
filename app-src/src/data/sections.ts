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
        title: "Observe Systems",
        subtitle: "See how models behave.",
        description: "Understand structure, flow, and relationships before formulas.",
        frameRange: [1, 50]
    },
    {
        id: "interact",
        title: "Interact with Parameters",
        subtitle: "Cause and effect, visually.",
        description: "Change inputs and watch systems respond in real time.",
        frameRange: [51, 100]
    },
    {
        id: "understand",
        title: "Build Intuition",
        subtitle: "Not memorization.",
        description: "Internalize how AI works before implementation.",
        frameRange: [101, 150]
    },
    {
        id: "apply",
        title: "Then Write Code",
        subtitle: "With confidence.",
        description: "Implementation becomes obvious once the system is understood.",
        frameRange: [151, 200]
    }
];

export const TOTAL_FRAMES = 200;
