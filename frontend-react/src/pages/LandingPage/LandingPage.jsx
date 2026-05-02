import { useAuthStore, selectIsLoggedIn, selectIsPremium } from '../../stores/authStore'
import { useLandingAnimations } from './useLandingAnimations'
import LandingNav from './LandingNav'
import HeroSection from './HeroSection'
import LoggedInBand from './LoggedInBand'
import SectionA_Frustration from './sections/SectionA_Frustration'
import SectionB_AIInterviewer from './sections/SectionB_AIInterviewer'
import SectionC_Difference from './sections/SectionC_Difference'
import SectionD_Signature from './sections/SectionD_Signature'
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

      {/* §A — The Frustration */}
      <SectionA_Frustration />

      {/* §B — The AI Interviewer */}
      <SectionB_AIInterviewer />

      {/* §C — What Makes It Different */}
      <SectionC_Difference />

      {/* §D — Signature Moment */}
      <SectionD_Signature />

      {/* Still-existing section being replaced in Phase 5 */}
      <ActionSection isLoggedIn={isLoggedIn} isPremium={isPremium} />

      {/* Footer */}
      <FooterSection />
    </div>
  )
}
