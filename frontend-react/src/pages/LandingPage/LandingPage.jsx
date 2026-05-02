import { useAuthStore, selectIsLoggedIn, selectIsPremium } from '../../stores/authStore'
import { useLandingAnimations } from './useLandingAnimations'
import LandingNav from './LandingNav'
import HeroSection from './HeroSection'
import LoggedInBand from './LoggedInBand'
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

      {/* Three.js Canvas Container — global ambient backdrop */}
      <ThreeBackground />

      {/* Navigation */}
      <LandingNav isLoggedIn={isLoggedIn} />

      {/* Hero — single confident moment */}
      <HeroSection />

      {/* Logged-in shortcut band — renders nothing if logged out */}
      <LoggedInBand />

      {/* Sections being progressively replaced (Phases 2-5) */}
      <WhoSection />
      <WhySection />
      <div className="section-divider-line" id="dividerLine34" aria-hidden="true" />
      <TrustSection />
      <ServicesSection />
      <ProofSection />
      <ActionSection isLoggedIn={isLoggedIn} isPremium={isPremium} />

      {/* Footer */}
      <FooterSection />
    </div>
  )
}
