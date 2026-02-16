"use client";

const PROGRESS_KEY = "mlstudio_curriculum_progress";

/**
 * Progress tracking utility using localStorage
 */
export const progressTracker = {
    /**
     * Get progress for a specific module
     */
    getModuleProgress(moduleSlug: string): number {
        if (typeof window === "undefined") return 0;
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
        return progress[moduleSlug] || 0;
    },

    /**
     * Set progress for a module
     */
    setModuleProgress(moduleSlug: string, percent: number) {
        if (typeof window === "undefined") return;
        const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
        progress[moduleSlug] = Math.min(100, Math.max(0, percent));
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
        // Dispatch event for reactive components
        window.dispatchEvent(new Event("progressUpdate"));
    },

    /**
     * Mark a module as complete
     */
    completeModule(moduleSlug: string) {
        this.setModuleProgress(moduleSlug, 100);
    },

    /**
     * Get all progress
     */
    getAllProgress(): Record<string, number> {
        if (typeof window === "undefined") return {};
        return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    }
};
