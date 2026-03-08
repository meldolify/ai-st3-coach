import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelectionStore } from '../../stores/selectionStore'
import { SUBCATEGORIES, TOPICS } from '../../data/scenarios'
import SpecialtySelection from './SpecialtySelection'
import DifficultySelection from './DifficultySelection'
import ModeSelection from './ModeSelection'
import MockTypeSelection from './MockTypeSelection'
import StationTypeSelection from './StationTypeSelection'
import ScenarioSelection from './ScenarioSelection'
import UpgradeModal from '../../components/UpgradeModal'
import './scenario-flow.css'

/**
 * ScenarioFlow — Orchestrator for the multi-step scenario selection flow.
 *
 * Steps: specialty → difficulty → mode → [mock-type → station-type] → scenarios
 *
 * State machine driven by `step` string. Zustand store persists selections
 * to sessionStorage so difficulty/mode survive page refreshes (Fix 3).
 */

const STEPS = [
  'specialty',
  'difficulty',
  'mode',
  'mock-type',
  'station-type',
  'scenarios',
]

export default function ScenarioFlow() {
  const navigate = useNavigate()
  const store = useSelectionStore()

  // Determine initial step from persisted state
  const getInitialStep = () => {
    // If returning from simulation with difficulty set, skip to mode
    if (store.selectedDifficulty && store.selectedSpecialty) {
      return 'mode'
    }
    // Check for default specialty in localStorage
    const defaultSpecialty = localStorage.getItem('defaultSpecialty')
    if (defaultSpecialty) {
      store.setSpecialty(defaultSpecialty)
      return 'difficulty'
    }
    return 'specialty'
  }

  const [step, setStep] = useState(getInitialStep)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // --- Navigation handlers ---

  const handleSelectSpecialty = useCallback((specialty) => {
    store.setSpecialty(specialty)
    setStep('difficulty')
  }, [store])

  const handleSelectDifficulty = useCallback((difficulty) => {
    store.setDifficulty(difficulty)
    setStep('mode')
  }, [store])

  const handleSelectMode = useCallback((mode) => {
    store.setMode(mode)
    if (mode === 'practice') {
      setStep('scenarios')
    } else {
      setStep('mock-type')
    }
  }, [store])

  const handleSelectMockType = useCallback((type) => {
    store.setMockExamType(type)
    if (type === 'by-station') {
      setStep('station-type')
    } else {
      // Full mock — launch directly (TODO: implement full mock flow)
      launchFullMock()
    }
  }, [store])

  const handleSelectStationType = useCallback((stationType) => {
    store.setStationType(stationType)
    // Launch mock by station — pick random scenario
    launchMockByStation(stationType)
  }, [store])

  const handleSelectScenario = useCallback((scenario) => {
    store.setCurrentScenario(scenario)
    // Save to sessionStorage for backward compat with simulation room
    const params = store.getSimulationParams()
    params.scenario = scenario
    sessionStorage.setItem('simulationParams', JSON.stringify(params))
    navigate('/simulation')
  }, [store, navigate])

  const handleShowUpgrade = useCallback(() => {
    setShowUpgrade(true)
  }, [])

  // --- Back handlers ---

  const handleBackFromDifficulty = useCallback(() => {
    store.setSpecialty(null)
    setStep('specialty')
  }, [store])

  const handleBackFromMode = useCallback(() => {
    setStep('difficulty')
  }, [])

  const handleBackFromMockType = useCallback(() => {
    setStep('mode')
  }, [])

  const handleBackFromStationType = useCallback(() => {
    setStep('mock-type')
  }, [])

  const handleBackFromScenarios = useCallback(() => {
    setStep('mode')
  }, [])

  // --- Mock exam helpers ---

  function launchMockByStation(stationType) {
    // Pick a random scenario from the selected station type
    const categoryMap = {
      'clinical': 'clinical',
      'call-the-boss': 'call-the-boss',
      'consent': 'consent',
      'structured': 'structured',
    }
    const categoryId = categoryMap[stationType]
    const subcats = SUBCATEGORIES[categoryId] || []
    const allTopics = subcats.flatMap((sub) => (TOPICS[sub.id]?.topics || []))

    if (allTopics.length === 0) return

    const [promptFile, title] = allTopics[Math.floor(Math.random() * allTopics.length)]
    const scenario = { category: categoryId, title, promptFile, imageFile: null }

    store.setCurrentScenario(scenario)
    store.setMode('mock-exam')

    const params = store.getSimulationParams()
    params.scenario = scenario
    sessionStorage.setItem('simulationParams', JSON.stringify(params))
    navigate('/simulation')
  }

  function launchFullMock() {
    // TODO: implement full mock exam flow
    // For now, go to station type selection as fallback
    setStep('station-type')
  }

  // --- Render current step ---

  let stepContent
  switch (step) {
    case 'specialty':
      stepContent = <SpecialtySelection onSelect={handleSelectSpecialty} />
      break
    case 'difficulty':
      stepContent = (
        <DifficultySelection
          onSelect={handleSelectDifficulty}
          onBack={handleBackFromDifficulty}
        />
      )
      break
    case 'mode':
      stepContent = (
        <ModeSelection
          onSelect={handleSelectMode}
          onBack={handleBackFromMode}
        />
      )
      break
    case 'mock-type':
      stepContent = (
        <MockTypeSelection
          onSelect={handleSelectMockType}
          onBack={handleBackFromMockType}
        />
      )
      break
    case 'station-type':
      stepContent = (
        <StationTypeSelection
          onSelect={handleSelectStationType}
          onBack={handleBackFromStationType}
        />
      )
      break
    case 'scenarios':
      stepContent = (
        <ScenarioSelection
          onSelectScenario={handleSelectScenario}
          onBack={handleBackFromScenarios}
          onShowUpgrade={handleShowUpgrade}
        />
      )
      break
    default:
      stepContent = <SpecialtySelection onSelect={handleSelectSpecialty} />
  }

  return (
    <>
      {stepContent}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
