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

  // State-based glow color
  const glowColor = {
    idle: 'rgba(74, 93, 76, 0.15)',
    listening: 'rgba(5, 150, 105, 0.2)',
    speaking: 'rgba(217, 119, 6, 0.2)',
    thinking: 'rgba(79, 70, 229, 0.2)',
  }

  // State-based ring color for the CSS backdrop
  const ringColor = {
    idle: '#4A5D4C',
    listening: '#059669',
    speaking: '#D97706',
    thinking: '#4F46E5',
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
