/**
 * §C — ReViva is different.
 *
 * Replaces the previous dark-canopy "Not just another AI tool" 2-col
 * comparison + 166 watermark with the v1 design kit's prose-and-polaroid
 * treatment, which the user preferred (`reviva-design-system/project/
 * ui_kits/landing/v1.html` lines 382-395).
 *
 * Layout:
 *   - Cream background, two columns (~1.2fr / 1fr) on desktop:
 *     · Left: italic eyebrow `( and )`, headline "ReViva is different.",
 *             a single paragraph ending with an italic-amber tail.
 *     · Right: a tilted polaroid photo card (real `c-handcraft.png` inside,
 *             white border, deep shadow, 2deg rotation, italic caption).
 *   - Mobile: stacks vertically.
 *
 * Polaroid parallaxes via `.section-c__polaroid` selector wired in
 * useLandingAnimations.js.
 */
export default function SectionC_Difference() {
  return (
    <section
      id="section-c"
      className="section-c relative bg-organic-cream text-organic-bark"
      data-testid="section-c"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 md:gap-16 lg:gap-20 items-center">
          {/* Left column — eyebrow + headline + prose */}
          <div>
            <p className="font-display italic text-organic-forest text-[clamp(1rem,1.1vw,1.2rem)] mb-3">
              ( and )
            </p>
            <h2 className="font-organic-display uppercase font-bold text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.025em] mb-6">
              ReViva is{' '}
              <em className="font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]">
                different.
              </em>
            </h2>
            <p className="text-[1.125rem] leading-relaxed text-organic-bark/85 max-w-[52ch]">
              Other AI tools generate random responses. ReViva doesn&rsquo;t.
              Every station is hand-crafted by trainees who sat the exam,
              verified for clinical accuracy, and built to simulate the real
              interview &mdash; right down to the 5-minute clock. Practise as
              many times as you want, anytime.{' '}
              <em className="font-display italic text-organic-amber">
                That&rsquo;s what makes it different.
              </em>
            </p>
          </div>

          {/* Right column — tilted polaroid */}
          <div className="section-c__polaroid-wrap flex justify-center md:justify-end">
            <figure className="section-c__polaroid">
              <div className="section-c__polaroid-photo">
                <img
                  src="/images/landing/c-handcraft.png"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              <figcaption className="section-c__polaroid-caption">
                a quiet morning, 06:42
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
