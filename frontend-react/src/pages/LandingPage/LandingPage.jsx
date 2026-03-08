import { useAuthStore, selectIsLoggedIn, selectIsPremium } from '../../stores/authStore'
import { useLandingAnimations } from './useLandingAnimations'
import LandingNav from './LandingNav'
import HeroSection from './HeroSection'
import WhoSection from './WhoSection'
import WhySection from './WhySection'
import TrustSection from './TrustSection'
import ServicesSection from './ServicesSection'
import ProofSection from './ProofSection'
import ActionSection from './ActionSection'
import FooterSection from './FooterSection'
import ThreeBackground from './ThreeBackground'
import GrainOverlay from './GrainOverlay'
import CursorFollower from './CursorFollower'
import './landing.css'

export default function LandingPage() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn)
  const isPremium = useAuthStore(selectIsPremium)

  // Initialize all GSAP + Lenis scroll animations
  useLandingAnimations()

  return (
    <div className="landing-page">
      {/* Custom cursor follower (desktop only) */}
      <CursorFollower />

      {/* SVG Grain Overlay */}
      <GrainOverlay />

      {/* Three.js Canvas Container */}
      <ThreeBackground />

      {/* Navigation */}
      <LandingNav isLoggedIn={isLoggedIn} />

      {/* Section 1: Hero */}
      <HeroSection isLoggedIn={isLoggedIn} />

      {/* Section 2: Who */}
      <WhoSection />

      {/* Section 3: Why (pinned scroll) */}
      <WhySection />

      {/* Animated divider line between sections 3 and 4 */}
      <div className="section-divider-line" id="dividerLine34" aria-hidden="true" />

      {/* Section 4: Trust */}
      <TrustSection />

      {/* Section 5: Services */}
      <ServicesSection />

      {/* Section 6: Proof */}
      <ProofSection />

      {/* Section 7: Action / Pricing */}
      <ActionSection isLoggedIn={isLoggedIn} isPremium={isPremium} />

      {/* Section 8: Footer */}
      <FooterSection />
    </div>
  )
}
