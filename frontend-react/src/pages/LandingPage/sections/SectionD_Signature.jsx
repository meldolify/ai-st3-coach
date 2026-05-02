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
        <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-organic-forest mb-5">
          What does it feel like?
        </p>
        <h2 className="font-organic-display uppercase leading-[0.95] text-[clamp(2.5rem,8vw,6.5rem)] mb-6">
          Hear the examiner.
        </h2>
        <p className="max-w-xl mx-auto text-[1.05rem] leading-relaxed text-organic-bark/75 mb-16 md:mb-20">
          A real interview is a conversation. Press play to start one.
        </p>

        <SignatureOrb />
      </div>
    </section>
  )
}
