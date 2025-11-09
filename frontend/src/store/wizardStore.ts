import { create } from 'zustand';

interface WizardState {
  currentStep: number;
  completedSteps: number[];
  migrationId: string | null;
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  setMigrationId: (id: string) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 1,
  completedSteps: [],
  migrationId: null,
  setCurrentStep: (step: number) => set({ currentStep: step }),
  markStepComplete: (step: number) => set((state: WizardState) => ({
    ...state,
    completedSteps: state.completedSteps.includes(step)
      ? state.completedSteps
      : [...state.completedSteps, step]
  })),
  setMigrationId: (id: string) => set({ migrationId: id }),
  resetWizard: () => set({ currentStep: 1, completedSteps: [], migrationId: null })
}));