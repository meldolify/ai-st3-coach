import { SignatureOrb } from '../SignatureOrb'

/**
 * §D — Signature Moment. What does it feel like?
 *
 * Centred composition on light bg. The sim-room voice panel transplanted:
 * CpuArchitecture circuit-line backdrop + VoiceOrbSimple + AudioVisualiser.
 * Click-to-play reveals the recorded examiner greeting.
 *
 * This is the section's single payoff — no other interactive moment elsewhere
 * on the page. Per plan §6, the global Three.js icosahedron fades to 0 around
 * this section's entry (wired in Phase 5) so the orb has the centre stage.
 */
export default function SectionD_Signature() {
  return (
    <section
      id="section-d"
      className="section-d relative bg-organic-cream text-organic-bark"
      data-testid="section-d"
    >
      <div className="section-d__inner max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-36 text-center">
        <p className="font-display italic text-organic-forest text-[1.1rem] md:text-[1.25rem] mb-3">
          ( press to begin )
        </p>
        <h2 className="font-organic-display uppercase leading-[0.92] text-[clamp(2.75rem,9vw,7.5rem)] tracking-[-0.025em] mb-6 font-bold">
          Hear the <em className="font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]">examiner.</em>
        </h2>
        <p className="max-w-xl mx-auto text-[1.05rem] leading-relaxed text-organic-bark/75 mb-16 md:mb-20">
          A real interview is a conversation. Press play to start one.
        </p>

        <SignatureOrb />

        <p className="font-display italic text-organic-bark/55 text-[0.95rem] mt-10">
          ( recorded · British examiner voice )
        </p>
      </div>
    </section>
  )
}
