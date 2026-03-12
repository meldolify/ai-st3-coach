import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSelectionStore = create(
  persist(
    (set, get) => ({
      // Selection state
      selectedSpecialty: null,
      selectedDifficulty: null,
      selectedMode: null, // 'practice' | 'mock-exam'
      mockExamType: null, // 'by-station' | 'full-mock'
      selectedStationType: null, // 'clinical' | 'call-the-boss' | 'consent' | 'structured'

      // Scenario navigation state
      currentScenarioCategory: null,
      currentScenarioSubcategory: null,
      currentScenarioSubcategoryName: null,

      // Current scenario (set when user picks a topic)
      currentScenario: { category: '', title: '', promptFile: '', imageFile: null },

      // Mock exam session state
      isMockExamActive: false,
      mockExamStations: [],
      currentStationIndex: 0,
      mockExamResults: [],

      // Actions
      setSpecialty: (specialty) => set({ selectedSpecialty: specialty }),
      setDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),
      setMode: (mode) => set({ selectedMode: mode }),
      setMockExamType: (type) => set({ mockExamType: type }),
      setStationType: (type) => set({ selectedStationType: type }),

      setScenarioCategory: (category) => set({
        currentScenarioCategory: category,
        currentScenarioSubcategory: null,
        currentScenarioSubcategoryName: null,
      }),
      setScenarioSubcategory: (id, name) => set({
        currentScenarioSubcategory: id,
        currentScenarioSubcategoryName: name,
      }),
      resetScenarioNav: () => set({
        currentScenarioCategory: null,
        currentScenarioSubcategory: null,
        currentScenarioSubcategoryName: null,
      }),

      setCurrentScenario: (scenario) => set({ currentScenario: scenario }),

      // Mock exam actions
      startMockExam: (stations) => set({
        isMockExamActive: true,
        mockExamStations: stations,
        currentStationIndex: 0,
        mockExamResults: [],
      }),
      advanceMockStation: () => set((state) => ({
        currentStationIndex: state.currentStationIndex + 1,
      })),
      addMockResult: (result) => set((state) => ({
        mockExamResults: [...state.mockExamResults, result],
      })),
      endMockExam: () => set({
        isMockExamActive: false,
        mockExamStations: [],
        currentStationIndex: 0,
      }),

      // Reset all selection state
      resetSelection: () => set({
        selectedSpecialty: null,
        selectedDifficulty: null,
        selectedMode: null,
        mockExamType: null,
        selectedStationType: null,
        currentScenarioCategory: null,
        currentScenarioSubcategory: null,
        currentScenarioSubcategoryName: null,
        currentScenario: { category: '', title: '', promptFile: '', imageFile: null },
      }),

      // Build simulation params for sessionStorage bridge (backward compat)
      getSimulationParams: () => {
        const state = get()
        return {
          scenario: state.currentScenario,
          difficulty: state.selectedDifficulty || 'easy',
          mode: state.selectedMode || 'practice',
          mockExamType: state.mockExamType,
          stationType: state.selectedStationType,
          mockExam: {
            isActive: state.isMockExamActive,
            stations: state.mockExamStations,
            currentIndex: state.currentStationIndex,
            results: state.mockExamResults,
          },
          returnPage: '/scenarios',
        }
      },
    }),
    {
      name: 'selection-storage',
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
      // Persist selection state to sessionStorage for page refresh survival
      partialize: (state) => ({
        selectedSpecialty: state.selectedSpecialty,
        selectedDifficulty: state.selectedDifficulty,
        selectedMode: state.selectedMode,
        mockExamType: state.mockExamType,
        selectedStationType: state.selectedStationType,
        currentScenario: state.currentScenario,
      }),
    }
  )
)
