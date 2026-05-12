#!/usr/bin/env node
/* eslint-env node */
/**
 * generate-landing-audio.cjs
 *
 * One-off generator for §D Signature Moment's recorded greeting.
 * Run from the frontend-react/ directory:
 *
 *   node scripts/generate-landing-audio.cjs
 *
 * Reads GEMINI_API_KEY from backend/.env or the process env. Uses the
 * existing backend GeminiTTSService for tonal consistency with the
 * sim-room voice, then writes WAV to public/audio/.
 *
 * To produce a smaller MP3 for the browser (recommended), follow up with:
 *   ffmpeg -i public/audio/landing-examiner-greeting.wav \
 *          -codec:a libmp3lame -qscale:a 4 \
 *          public/audio/landing-examiner-greeting.mp3
 *
 * The MP3 is what SignatureOrb fetches at runtime.
 *
 * Voice/style choices below match the "strict examiner" persona used in
 * difficulty=strict on the sim room (Charon + British accent).
 */

const path = require('node:path')
const fs = require('node:fs')

const BACKEND_DIR = path.resolve(__dirname, '..', '..', 'backend')
const ENV_PATH = path.join(BACKEND_DIR, '.env')

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx < 0) continue
    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

async function main() {
  loadEnvFile(ENV_PATH)
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not set. Add it to backend/.env or export it before running.')
    process.exit(1)
  }

  // Resolve the backend service. The module exports a singleton instance,
  // not the class — call methods on it directly.
  const servicePath = path.join(BACKEND_DIR, 'src', 'services', 'GeminiTTSService.js')
  if (!fs.existsSync(servicePath)) {
    console.error('Could not find GeminiTTSService at', servicePath)
    process.exit(1)
  }
  const ttsService = require(servicePath)

  const text = 'Hello. Welcome to your ST3 interview. Are you ready to begin?'
  const voiceName = 'Charon'
  const stylePrompt = '[British accent, professional, neutral examiner tone]'

  console.log(`[gen-audio] voice=${voiceName} text="${text}"`)

  const wavBuffer = await ttsService.synthesize(text, voiceName, { stylePrompt })

  const outDir = path.resolve(__dirname, '..', 'public', 'audio')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'landing-examiner-greeting.wav')
  fs.writeFileSync(outPath, wavBuffer)

  console.log(`[gen-audio] wrote ${outPath} (${wavBuffer.length} bytes)`)
  console.log('[gen-audio] To convert to MP3:')
  console.log(`    ffmpeg -i "${outPath}" -codec:a libmp3lame -qscale:a 4 "${outPath.replace(/\.wav$/, '.mp3')}"`)
}

main().catch((err) => {
  console.error('[gen-audio] failed:', err)
  process.exit(1)
})
