import { create } from 'zustand'

export const useWizardStore = create((set) => ({
  currentStep: 1,
  completedSteps: [],
  migrationId: null,
  setCurrentStep: (step) => set({ currentStep: step }),
  markStepComplete: (step) => set((state) => ({
    completedSteps: state.completedSteps.includes(step) 
      ? state.completedSteps 
      : [...state.completedSteps, step]
  })),
  setMigrationId: (id) => set({ migrationId: id }),
  resetWizard: () => set({ currentStep: 1, completedSteps: [], migrationId: null })
}))