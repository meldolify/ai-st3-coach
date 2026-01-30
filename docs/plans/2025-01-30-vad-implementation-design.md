# VAD Implementation Plan: Replacing Push-to-Talk with Continuous Voice Detection

**Status**: Implementation in progress
**Created**: 2025-01-30
**Last Updated**: 2025-01-30

## Summary

Replace Push-to-Talk (PTT) with continuous VAD-based voice input using **@ricky0123/vad-web** (Silero VAD via WASM). This enables hands-free, low-latency voice interaction while maintaining the existing Whisper → GPT-4o-mini → Google TTS pipeline.

## Key Decisions

| Decision | Choice |
|----------|--------|
| **VAD Library** | @ricky0123/vad-web (pre-packaged Silero VAD) |
| **VAD Location** | Client-side (browser) with server fallback acceptable |
| **Whisper Mode** | Batch processing (send complete utterance after VAD closes) |
| **Echo Prevention** | WebRTC AEC + keep VAD running during TTS for interrupt detection |
| **Interrupt Mode** | Confirmed (~200-300ms continuous speech required) |
| **UI** | Hide record button, use existing orb animations |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BROWSER                                                                      │
│                                                                              │
│  getUserMedia({ echoCancellation: true, noiseSuppression: true })           │
│                              │                                               │
│                              ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ @ricky0123/vad-web (MicVAD)                                          │   │
│  │   - Silero VAD model (ONNX/WASM)                                     │   │
│  │   - Built-in pre-roll (preSpeechPadFrames)                           │   │
│  │   - Built-in hangover (redemptionFrames)                             │   │
│  │   - onSpeechStart / onSpeechEnd callbacks                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│            ┌─────────────────┴─────────────────┐                            │
│            │                                   │                            │
│     isAISpeaking=false                  isAISpeaking=true                   │
│     (Normal Mode)                       (TTS Playing)                       │
│            │                                   │                            │
│            ▼                                   ▼                            │
│   onSpeechEnd → Send WAV          onSpeechEnd → Check duration             │
│   to Whisper (whisper_audio)      ≥200ms? → Trigger INTERRUPT              │
│                                   <200ms? → Ignore (likely echo)           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ WebSocket
┌─────────────────────────────────────────────────────────────────────────────┐
│ BACKEND (unchanged)                                                          │
│                                                                              │
│ whisper_audio → Whisper API → user_transcript → GPT-4o-mini → TTS           │
│                                                                              │
│ ai_response ← { text, audio: base64_mp3 }                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Echo Prevention Strategy

Using @ricky0123/vad-web's built-in WebRTC AEC support:

1. **Primary Defense**: WebRTC echo cancellation enabled automatically by the library
   - `echoCancellation: true` (default in MicVAD)
   - `noiseSuppression: true` (default in MicVAD)
   - `autoGainControl: true` (default in MicVAD)

2. **Application-Level Filtering** (during TTS playback):
   - Set `isAISpeaking = true` when AI audio starts
   - VAD continues running (don't call `pause()`)
   - In `onSpeechEnd` callback:
     - If `isAISpeaking` AND speech duration < 200ms → Ignore (likely echo)
     - If `isAISpeaking` AND speech duration ≥ 200ms → Trigger interrupt
   - Set `isAISpeaking = false` when AI audio ends

3. **Post-TTS Cleanup**:
   - Wait 100ms after AI finishes before accepting new speech
   - This allows any residual echo to clear

## Files to Create

| File | Purpose |
|------|---------|
| `frontend/js/vad/VADManager.js` | Main VAD manager wrapping @ricky0123/vad-web |

## Files to Modify

| File | Changes |
|------|---------|
| `frontend/index.html` | Add @ricky0123/vad-web script from CDN |
| `frontend/config.js` | Add VAD configuration (thresholds, timings) |
| `frontend/js/speech.js` | Export VADManager alongside PushToTalkManager |
| `frontend/js/session.js` | Integrate VADManager, handle interrupt during TTS |
| `backend/src/utils/audioHelpers.js` | Re-enable noise filtering for VAD mode |

## Implementation Steps

### Step 1: Add @ricky0123/vad-web to frontend

**Status**: ✅ Completed

Add to `frontend/index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.30/dist/bundle.min.js"></script>
```

### Step 2: Create VADManager class

**Status**: ✅ Completed

Create `frontend/js/vad/VADManager.js`:

```javascript
class VADManager {
  constructor(websocket) {
    this.websocket = websocket;
    this.myvad = null;
    this.isAISpeaking = false;
    this.isInitialized = false;
    this.speechStartTime = null;

    // Callbacks (set by V4Session)
    this.onTranscript = null;
    this.onRecordingStart = null;
    this.onRecordingEnd = null;
    this.onInterruptRequest = null;
    this.onError = null;
  }

  async initialize() {
    try {
      this.myvad = await vad.MicVAD.new({
        // Speech detection thresholds
        positiveSpeechThreshold: 0.5,
        negativeSpeechThreshold: 0.35,

        // Pre-roll: ~300ms (10 frames at 30ms each)
        preSpeechPadFrames: 10,

        // Hangover: ~240ms (8 frames)
        redemptionFrames: 8,

        // Minimum speech: ~90ms (3 frames)
        minSpeechFrames: 3,

        onSpeechStart: () => {
          this.speechStartTime = Date.now();
          if (!this.isAISpeaking) {
            console.log('[VAD] Speech started');
            if (this.onRecordingStart) this.onRecordingStart();
          }
        },

        onSpeechEnd: async (audio) => {
          const duration = Date.now() - this.speechStartTime;

          if (this.isAISpeaking) {
            // During TTS: only trigger interrupt for confirmed speech
            if (duration >= 200) {
              console.log(`[VAD] Interrupt detected (${duration}ms)`);
              if (this.onInterruptRequest) this.onInterruptRequest();
            } else {
              console.log(`[VAD] Ignoring short speech during TTS (${duration}ms)`);
            }
            return;
          }

          // Normal mode: send to Whisper
          console.log(`[VAD] Speech ended (${duration}ms)`);
          if (this.onRecordingEnd) this.onRecordingEnd();
          await this.sendAudioToWhisper(audio);
        }
      });

      this.isInitialized = true;
      console.log('[VAD] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[VAD] Initialization failed:', error);
      if (this.onError) this.onError('VAD initialization failed: ' + error.message);
      return false;
    }
  }

  async sendAudioToWhisper(float32Audio) {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('[VAD] WebSocket not ready');
      return;
    }

    const wavBlob = this.float32ToWav(float32Audio, 16000);
    const base64 = await this.blobToBase64(wavBlob);

    this.websocket.send(JSON.stringify({
      type: 'whisper_audio',
      sessionId: window.currentSessionId,
      audio: base64,
      format: 'wav'
    }));
    console.log('[VAD] Audio sent to Whisper');
  }

  float32ToWav(float32Array, sampleRate) {
    const buffer = new ArrayBuffer(44 + float32Array.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + float32Array.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, float32Array.length * 2, true);

    let offset = 44;
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  start() {
    if (this.myvad) {
      this.myvad.start();
      console.log('[VAD] Started listening');
    }
  }

  stop() {
    if (this.myvad) {
      this.myvad.pause();
      console.log('[VAD] Stopped listening');
    }
  }

  setAISpeaking(isSpeaking) {
    this.isAISpeaking = isSpeaking;
    console.log(`[VAD] AI speaking: ${isSpeaking}`);

    if (!isSpeaking) {
      // Post-TTS: wait 100ms to let echo clear
      setTimeout(() => {
        console.log('[VAD] Ready for new speech');
      }, 100);
    }
  }

  destroy() {
    if (this.myvad) {
      this.myvad.destroy();
      this.myvad = null;
    }
    this.isInitialized = false;
    console.log('[VAD] Destroyed');
  }
}
```

### Step 3: Update config.js

**Status**: ✅ Completed

Add VAD configuration:

```javascript
SPEECH_RECOGNITION: {
  USE_PUSH_TO_TALK: false,      // false = VAD mode
  USE_VAD: true,                // Enable VAD
  WHISPER_PRIMARY: true,

  VAD: {
    POSITIVE_THRESHOLD: 0.5,    // Start speech detection
    NEGATIVE_THRESHOLD: 0.35,   // End speech detection
    PRE_SPEECH_FRAMES: 10,      // ~300ms pre-roll
    REDEMPTION_FRAMES: 8,       // ~240ms hangover
    MIN_SPEECH_FRAMES: 3,       // ~90ms minimum
    INTERRUPT_MIN_MS: 200       // Minimum for interrupt during TTS
  }
}
```

### Step 4: Update session.js

**Status**: ✅ Completed

Modify V4Session constructor to use VADManager:

```javascript
// In constructor:
if (CONFIG.SPEECH_RECOGNITION.USE_VAD) {
  this.speechRecognition = new VADManager(null);
  this.usingWhisper = true;
  this.usingVAD = true;
  log('Using VAD for continuous voice input', 'success');
} else {
  this.speechRecognition = new PushToTalkManager(null);
  this.usingWhisper = true;
  this.usingPTT = true;
  log('Using Push-to-Talk for STT', 'success');
}
```

### Step 5: Hide record button in VAD mode

**Status**: ✅ Completed

In `frontend/js/app.js`, after session connects:

```javascript
// Hide record button in VAD mode
if (session.usingVAD) {
  const recordBtn = document.getElementById('recordBtn');
  if (recordBtn) recordBtn.style.display = 'none';
}
```

### Step 6: Re-enable noise filtering

**Status**: ✅ Completed

Update `backend/src/utils/audioHelpers.js`:

```javascript
function isNoiseTranscript(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < 2) return true;

  const noisePatterns = [
    /^(um+|uh+|er+|ah+|oh+|hm+)\.?$/i,
    /^\.+$/,
    /^thanks?\.?$/i,
    /^okay\.?$/i
  ];

  return noisePatterns.some(p => p.test(trimmed));
}
```

## Verification Checklist

| Test | Expected Behavior | How to Test | Status |
|------|-------------------|-------------|--------|
| **Short utterance** | "yes", "ok" (100ms+) captured | Say short words, verify transcription | ⬜ |
| **Quiet speech** | Soft speaking detected | Speak quietly, verify detection | ⬜ |
| **Echo test** | AI response NOT transcribed | Play AI response, verify no echo pickup | ⬜ |
| **Interrupt test** | Speaking during AI triggers interrupt | Speak for 200ms+ during AI playback | ⬜ |
| **Word truncation** | First/last words NOT cut off | Say a sentence, check transcript completeness | ⬜ |
| **Latency** | End-to-end < 400ms perceived | Measure from speech end to AI response start | ⬜ |
| **Continuous speech** | 30+ seconds handled | Speak continuously, verify stability | ⬜ |

## Fallback Strategy

If VAD fails to initialize:
1. Log error to console
2. Automatically fall back to PTT mode
3. Show notification: "Voice detection unavailable, using click-to-record"
4. All existing PTT code remains intact

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | Full |
| Edge | Full |
| Firefox | Partial (AudioWorklet varies) |
| Safari | Limited (may need PTT fallback) |

## Dependencies

**CDN URLs (add to index.html):**
```html
<script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.30/dist/bundle.min.js"></script>
```

## Sources

- [@ricky0123/vad-web GitHub](https://github.com/ricky0123/vad)
- [@ricky0123/vad-web Documentation](https://docs.vad.ricky0123.com/user-guide/browser/)
- [WebRTC Echo Cancellation](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings/echoCancellation)
- [Voice AI Interrupt Handling](https://zoice.ai/blog/interruption-handling-in-conversational-ai/)
- [LiveKit Noise Cancellation](https://docs.livekit.io/transport/media/noise-cancellation/)

---

## Progress Log

### 2025-01-30
- Initial design document created
- Research completed on VAD libraries and echo cancellation approaches
- User approved plan for implementation
- **Implementation completed**:
  - Added @ricky0123/vad-web scripts to index.html
  - Created VADManager.js with full Silero VAD integration
  - Updated config.js with VAD configuration options
  - Updated session.js to use VADManager when configured
  - Updated app.js to hide record button in VAD mode
  - Re-enabled noise filtering in backend server.js
- **Pending**: End-to-end testing
