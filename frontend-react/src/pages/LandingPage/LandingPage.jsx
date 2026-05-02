import { useAuthStore, selectIsLoggedIn } from '../../stores/authStore'
import { useLandingAnimations } from './useLandingAnimations'
import LandingNav from './LandingNav'
import HeroSection from './HeroSection'
import SectionA_Frustration from './sections/SectionA_Frustration'
import SectionB_AIInterviewer from './sections/SectionB_AIInterviewer'
import SectionC_Difference from './sections/SectionC_Difference'
import SectionD_Signature from './sections/SectionD_Signature'
import SectionE_Modes from './sections/SectionE_Modes'
import SectionF_Pricing from './sections/SectionF_Pricing'
import FooterSection from './FooterSection'
import ThreeBackground from './ThreeBackground'
import GrainOverlay from './GrainOverlay'
import CursorFollower from './CursorFollower'
import './landing.css'

export default function LandingPage() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

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

      {/* Hero — single confident moment.
          The hero CTA toggles between "Try a free station" and "Go to Dashboard"
          based on auth state — so the LoggedInBand was removed. */}
      <HeroSection />

      {/* §A — The Frustration */}
      <SectionA_Frustration />

      {/* §B — The AI Interviewer */}
      <SectionB_AIInterviewer />

      {/* §C — What Makes It Different */}
      <SectionC_Difference />

      {/* §D — Signature Moment */}
      <SectionD_Signature />

      {/* §E — The Modes */}
      <SectionE_Modes />

      {/* §F — Sign Up + Pricing */}
      <SectionF_Pricing />

      {/* Footer */}
      <FooterSection />
    </div>
  )
}
