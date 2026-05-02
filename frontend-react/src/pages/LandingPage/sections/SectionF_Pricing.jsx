import { useNavigate } from 'react-router-dom'
import { cn } from '../../../lib/utils'

/**
 * §F — Sign Up + Pricing. How do I get it?
 *
 * Light restage of the original ActionSection — same offer, same routing
 * logic, lighter chrome. Removes the shimmer ::before that read as
 * AI-template. Conditional swap on `isPremium` preserved: premium users
 * see "Your journey continues" with a dashboard CTA, everyone else sees
 * the Free vs Premium comparison.
 */
export default function SectionF_Pricing({ isPremium }) {
  const navigate = useNavigate()

  if (isPremium) {
    return (
      <section
        id="section-f"
        className="section-f section-f--premium relative bg-organic-canopy text-organic-cream"
        data-testid="section-f"
      >
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-24 md:py-32 text-center">
          <h2 className="font-organic-display uppercase leading-[0.95] text-[clamp(2.5rem,8vw,6rem)] mb-8">
            Your journey<br />continues.
          </h2>
          <button
            type="button"
            onClick={() => navigate('/scenarios', { state: { fresh: true } })}
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-organic-amber text-organic-bark text-[15px] font-semibold tracking-wide uppercase hover:-translate-y-[1px] transition-transform"
          >
            Go to Dashboard <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      id="section-f"
      className="section-f relative bg-organic-cream text-organic-bark"
      data-testid="section-f"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 md:py-32">
        <div className="text-center mb-12 md:mb-16">
          <p className="font-display italic text-organic-forest text-[1.1rem] md:text-[1.25rem] mb-3">
            ( how to get it )
          </p>
          <h2 className="font-organic-display uppercase leading-[0.92] text-[clamp(2.75rem,9vw,7.5rem)] tracking-[-0.025em] font-bold">
            Ready to <em className="font-display italic font-normal text-organic-amber lowercase tracking-[-0.01em]">start?</em>
          </h2>
        </div>

        <div
          id="pricingSection"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto"
          data-testid="pricing-section"
        >
          {/* Free tier */}
          <PriceCard
            tone="sand"
            overline="Free"
            title="4 Sample Scenarios"
            features={['Basic feedback', 'Free sign-up, no card']}
            price="£0"
            ctaLabel="Explore Free"
            onClick={() => navigate('/scenarios', { state: { fresh: true } })}
          />

          {/* Premium tier */}
          <PriceCard
            tone="canopy"
            overline="Premium ★"
            title="All 166 Scenarios"
            features={['Full feedback + scoring', 'Mock exams', 'Progress tracking']}
            price="From £8.33/mo"
            priceCaption="£99.99/year (save £80)"
            ctaLabel="Subscribe"
            ctaPrimary
            onClick={() => navigate('/login')}
          />
        </div>
      </div>
    </section>
  )
}

function PriceCard({
  tone,
  overline,
  title,
  features,
  price,
  priceCaption,
  ctaLabel,
  ctaPrimary,
  onClick,
}) {
  const isCanopy = tone === 'canopy'
  return (
    <div
      className={cn(
        'rounded-2xl p-8 md:p-10 flex flex-col',
        isCanopy
          ? 'bg-organic-canopy text-organic-cream border border-organic-amber/40'
          : 'bg-organic-sand/60 text-organic-bark border border-organic-stone'
      )}
    >
      <span
        className={cn(
          'text-[11px] font-medium uppercase tracking-[0.3em] mb-4',
          isCanopy ? 'text-organic-amber' : 'text-organic-forest'
        )}
      >
        {overline}
      </span>
      <h3 className="font-organic-display text-[clamp(1.5rem,2.4vw,1.85rem)] leading-tight mb-6">
        {title}
      </h3>
      <ul className={cn('space-y-2 mb-8 text-[0.95rem]', isCanopy ? 'text-organic-cream/85' : 'text-organic-bark/80')}>
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className={cn('mt-[0.55em] inline-block h-[2px] w-3 flex-shrink-0', isCanopy ? 'bg-organic-amber' : 'bg-organic-forest')}
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <p className="font-organic-display text-[1.85rem] leading-none mb-1">{price}</p>
        {priceCaption && (
          <p className={cn('text-[0.85rem] mb-5', isCanopy ? 'text-organic-cream/65' : 'text-organic-bark/55')}>
            {priceCaption}
          </p>
        )}
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-3 rounded-full text-[13px] font-semibold tracking-wide uppercase transition-transform hover:-translate-y-[1px]',
            ctaPrimary
              ? 'bg-organic-amber text-organic-bark'
              : 'bg-transparent border border-organic-forest text-organic-forest hover:bg-organic-forest hover:text-organic-cream'
          )}
        >
          {ctaLabel} <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  )
}
