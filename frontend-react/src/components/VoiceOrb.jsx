import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { OrbVisualizer } from '../lib/OrbVisualizer'

/**
 * VoiceOrb — "Breathing Light" voice visualization.
 * Canvas-based audio-reactive rings with Framer Motion container transitions.
 * Exposes OrbVisualizer instance via ref for useSession hook integration.
 */
const VoiceOrb = forwardRef(function VoiceOrb({ state = 'idle', size = 160 }, ref) {
  const canvasRef = useRef(null)
  const visualizerRef = useRef(null)

  // Initialize visualizer on mount
  useEffect(() => {
    const viz = new OrbVisualizer()
    visualizerRef.current = viz

    if (canvasRef.current) {
      viz.init(canvasRef.current)
    }

    return () => {
      viz.destroy()
      visualizerRef.current = null
    }
  }, [])

  // Expose visualizer via ref
  useImperativeHandle(ref, () => visualizerRef.current, [])

  // Update visualizer state when state prop changes
  useEffect(() => {
    if (visualizerRef.current) {
      visualizerRef.current.setState(state)
    }
  }, [state])

  // State-based glow color (vanilla: copper/teal/amber/indigo)
  const glowColor = {
    idle: 'rgba(184, 140, 90, 0.2)',
    listening: 'rgba(16, 185, 129, 0.25)',
    speaking: 'rgba(245, 158, 11, 0.25)',
    thinking: 'rgba(99, 102, 241, 0.25)',
  }

  // State-based ring color for the CSS backdrop
  const ringColor = {
    idle: '#B88C5A',
    listening: '#10B981',
    speaking: '#F59E0B',
    thinking: '#6366F1',
  }

  const canvasSize = 280

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center',
        'cursor-default select-none'
      )}
      style={{ width: size, height: size }}
      animate={{
        scale: state === 'speaking' ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: `0 0 ${state === 'idle' ? 20 : 40}px ${glowColor[state]}`,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Main orb circle */}
      <motion.div
        className={cn(
          'absolute rounded-full',
          'border-2'
        )}
        style={{
          width: size * 0.6,
          height: size * 0.6,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          borderColor: ringColor[state],
          backgroundColor: `${ringColor[state]}10`,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Canvas for audio-reactive visualization */}
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="absolute pointer-events-none"
        style={{
          width: canvasSize,
          height: canvasSize,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* State label */}
      <motion.span
        className="absolute bottom-0 text-[11px] font-medium capitalize"
        animate={{ color: ringColor[state] }}
        transition={{ duration: 0.3 }}
      >
        {state === 'idle' ? '' : state}
      </motion.span>
    </motion.div>
  )
})

export default VoiceOrb
