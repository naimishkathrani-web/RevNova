// frontend/src/store/wizardStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WizardState {
  currentStep: number;
  completedSteps: number[];
  migrationId: string | null;

  // Set current step
  setCurrentStep: (step: number) => void;

  // Mark a step as completed
  markStepComplete: (step: number) => void;

  // Set migration ID
  setMigrationId: (id: string) => void;

  // Reset the wizard
  resetWizard: () => void;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: [],
      migrationId: null,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      setMigrationId: (id) => set({ migrationId: id }),

      resetWizard: () =>
        set({
          currentStep: 1,
          completedSteps: [],
          migrationId: null,
        }),
    }),
    {
      name: "wizard-storage", // localStorage key
    }
  )
);
