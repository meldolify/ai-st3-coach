# Development Log - AI ST3 Coach V4

This log tracks all significant changes, bugs, decisions, and learnings throughout the development process. It serves as a searchable reference for Claude Code's episodic memory and for team members.

---

## 2026-01-19: Migration Environment Setup

### Summary
Set up the environment on the Antigravity instance. Installed dependencies and verified tests.

### Changes Made
- Performed `npm install` in `backend/`.
- Validated test suite (52 tests passed).
- Verified `server.js` starts successfully.

### Test Results
- `npm test`: 52 passed, 0 failed.
- Note: Coverage warnings expected and observed.

### Notes
- Critical: OpenAI API Key and Google Cloud Credentials must be confirmed by the user.

---

## 2026-01-19: Complete Development Environment Setup

### Summary
Implemented comprehensive VS Code development environment with debugging, testing framework, linting, and E2E testing capabilities.

### Changes Made

#### 1. VS Code Workspace Configuration
- **Created:** `AI ST3 Coach V4.code-workspace`
  - Multi-root workspace (backend, frontend, root)
  - Format on save enabled
  - ESLint auto-fix on save
  - Path IntelliSense enabled

#### 2. Debugging Infrastructure
- **Created:** `.vscode/launch.json`
  - Backend WebSocket server debugging
  - Nodemon auto-restart debugging
  - Chrome debugger for frontend
  - Jest test debugging
  - Full-stack compound configuration

- **Created:** `.vscode/tasks.json`
  - Frontend dev server task
  - Backend dev server task
  - Test runner tasks
  - Lint tasks

- **Created:** `.vscode/settings.json`
  - Workspace-specific settings
  - ESLint working directories
  - File associations

- **Created:** `.vscode/extensions.json`
  - Recommended extensions:
    - Prettier
    - ESLint
    - Jest
    - Chrome Debugger
    - Path IntelliSense
    - GitLens
    - Todo Tree

#### 3. Testing Framework
- **Updated:** `backend/package.json`
  - Added devDependencies:
    - jest@^29.7.0
    - supertest@^6.3.3
    - nodemon@^3.0.2
    - eslint@^8.56.0
    - prettier@^3.2.4
    - @types/jest@^29.5.11
  - Added scripts:
    - `npm run dev` - Nodemon auto-restart
    - `npm test` - Run tests with coverage
    - `npm run test:watch` - Watch mode
    - `npm run lint` - ESLint check
    - `npm run lint:fix` - Auto-fix linting issues
    - `npm run format` - Prettier formatting

- **Created:** `backend/jest.config.js`
  - Node.js test environment
  - Coverage thresholds: 70% (branches, functions, lines, statements)
  - Test timeout: 10 seconds
  - Auto-clear mocks between tests

- **Created:** `backend/.eslintrc.json`
  - ESLint rules for Node.js
  - Jest environment support
  - Recommended style guidelines

- **Created:** `backend/.prettierrc.json`
  - Code formatting rules
  - Single quotes, 2-space indentation
  - 100 character line width

#### 4. Unit Tests Created
- **Created:** `backend/__tests__/scenario-loader.test.js` (6 tests)
  - Prompts directory existence
  - Necrotising fasciitis file loading
  - Path traversal security
  - Bulk file reading

- **Created:** `backend/__tests__/server.test.js` (5 tests)
  - WebSocket module availability
  - Server instance creation
  - Message structure validation

- **Created:** `backend/__tests__/vad-logic.test.js` (13 tests)
  - RMS calculation simulation
  - Frame confirmation logic
  - Timing configuration
  - Voice frame detection

- **Created:** `backend/__tests__/gpt-integration.test.js` (12 tests)
  - GPT-4o-mini configuration
  - Conversation history structure
  - Message validation
  - Cost estimation

- **Created:** `backend/__tests__/tts-integration.test.js` (15 tests)
  - Google Cloud TTS voice configuration
  - Speech parameters
  - SSML processing
  - Audio output format
  - Cost estimation

**Total Test Coverage:** 51 unit tests covering critical functionality

### Git Backup
- **Commit:** `2eded28` - "Backup: Pre-development environment setup"
- **Tag:** `pre-dev-environment-setup` - Rollback point before changes

### Next Steps
1. Install npm dependencies: `cd backend && npm install`
2. Run tests: `npm test`
3. Fix any linting issues: `npm run lint:fix`
4. Test debugging: Set breakpoint in server.js and press F5
5. Configure Puppeteer MCP for E2E testing
6. Write E2E tests for full user journey

### Technical Decisions
- **VS Code over Visual Studio**: Better Node.js support, lighter weight
- **Jest over Mocha**: Better integration, built-in mocking
- **No TypeScript**: Project size doesn't justify migration cost (637 lines)
- **Prettier + ESLint**: Industry standard combination
- **Coverage threshold 70%**: Balanced target for initial setup

### Known Issues
- [ ] Dependencies not yet installed (pending `npm install`)
- [ ] Tests not yet run (pending dependency installation)
- [ ] Puppeteer MCP not yet configured
- [ ] E2E tests not yet written
- [ ] README not yet updated with setup instructions

### Files Modified
1. `backend/package.json` - Added scripts and devDependencies
2. `.gitignore` - To be updated for test artifacts

### Files Created (18 files)
1. `AI ST3 Coach V4.code-workspace`
2. `.vscode/launch.json`
3. `.vscode/tasks.json`
4. `.vscode/settings.json`
5. `.vscode/extensions.json`
6. `backend/jest.config.js`
7. `backend/.eslintrc.json`
8. `backend/.prettierrc.json`
9. `backend/.prettierignore`
10. `backend/__tests__/scenario-loader.test.js`
11. `backend/__tests__/server.test.js`
12. `backend/__tests__/vad-logic.test.js`
13. `backend/__tests__/gpt-integration.test.js`
14. `backend/__tests__/tts-integration.test.js`
15. `DEVELOPMENT_LOG.md` (this file)

### Time Investment
- Planning: 1 hour
- VS Code configuration: 30 minutes
- Testing infrastructure: 2 hours
- Test writing: 1.5 hours
- Documentation: 30 minutes
- **Total: 5.5 hours**

### Expected Benefits
- 30-40% faster debugging with VS Code debugger
- Catch bugs before deployment with automated tests
- Consistent code style across project
- Easier onboarding for new developers
- Production-grade development workflow

---

## Template for Future Entries

### YYYY-MM-DD: Brief Description

**Issue:** What problem needed solving?

**Solution:** How was it solved?

**Files Modified:**
- file1.js:42 - Description of change
- file2.js:100-120 - Description of change

**Test Results:** Did tests pass? What was learned?

**Performance Impact:** Any measurable changes?

**Related Commits:** Git commit hashes

**Notes:** Any additional context or gotchas

---

## 2026-03-08: Full React Migration — All Pages Ported to Unified SPA

### Summary
Migrated all vanilla frontend pages (`frontend/`) into a unified React SPA (`frontend-react/`). The app is now a single React Router application serving landing, auth, scenarios, simulation, profile, and prompt lab — replacing the previous hybrid vanilla+React architecture.

**Commit:** `87dbe41` — `feat: full React migration — all pages ported to unified SPA`
**Rollback tag:** `pre-full-react-migration` (pushed to remote)

### Architecture (Before → After)

**Before:** Hybrid — vanilla `frontend/index.html` (landing, auth, scenario selection) + React `frontend-react/` (simulation room only). Hash-based routing via `showPage()`. State via `window.*` globals.

**After:** Single React SPA. React Router v7 (`BrowserRouter`) handles all routes. Zustand 5 manages global state. Vite builds into `frontend/` for Vercel deployment. Backend UNCHANGED.

### Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `LandingPage` | Full landing with GSAP/Three.js animations |
| `/login` | `AuthPage` | Split-panel auth (email + Google OAuth) |
| `/scenarios/*` | `ScenarioFlow` | Multi-step selection (specialty→difficulty→mode→scenarios) |
| `/simulation` | `SimulationRoom` | WebSocket interview room (pre-existing) |
| `/profile` | `ProfilePage` | User stats, subscription management |
| `/prompt-lab` | `PromptLab` | 3-panel dark-themed prompt testing |
| `*` | `Navigate to /` | Catch-all 404 redirect |

### Pages Migrated (7 Total)

1. **Landing Page** (12 components) — GSAP ScrollTrigger, Lenis smooth scroll, Three.js icosahedron background, parallax hero, pinned scroll sections, cursor follower
2. **Auth Page** — Split-panel with cursor-following glow, Google OAuth, email/password, forgot password
3. **Scenario Selection** (7 step components) — Specialty → Difficulty → Mode → Mock Type → Station Type → Scenario hierarchy (category/subcategory/topic)
4. **Simulation Room** — Already React, updated for app-wide auth and React Router navigation
5. **Profile Page** — User info, subscription status, progress cards, session history
6. **Prompt Lab** — 3-panel layout (editor/chat/test), dark theme, 12 API endpoints
7. **Upgrade Modal** — Self-contained inline styles, monthly/annual toggle, Stripe checkout

### 5 Navigation Fixes Baked In

1. **Uniform BackButton** — Single `<BackButton>` component with consistent styling across all pages
2. **Smart scenario back navigation** — `ScenarioSelection` manages its own level stack (category→subcategory→topic), back button returns to correct parent level
3. **Difficulty persistence** — Zustand `selectionStore` with `persist` middleware keeps difficulty across navigation
4. **Auth modal centering** — AuthPage renders as fixed overlay, no `.page` class interference
5. **Consistent logo sizing** — LandingNav and AppHeader use same sizing

### Key Technical Decisions

- **Zustand 5** with `persist` middleware (sessionStorage) for `selectionStore` — survives page refresh
- **useAuth hook at App root** — single session restore point hydrates Zustand for all pages
- **sessionStorage bridge** — simulation params still passed via sessionStorage for backward compat
- **`emptyOutDir: false`** in Vite — builds into existing `frontend/` without destroying non-React assets (images, etc.)
- **Prebuild script** — cleans `frontend/assets/` before each build to remove stale hashed files
- **`cleanUrls: false`** in Vercel — prevents old `.html` files from shadowing React routes

### Files Created (58 new files)

#### Pages
- `src/pages/LandingPage/` — LandingPage, LandingNav, HeroSection, WhoSection, WhySection, TrustSection, ServicesSection, ProofSection, ActionSection, FooterSection, ThreeBackground, CursorFollower, GrainOverlay, useLandingAnimations.js, landing.css
- `src/pages/Auth/` — AuthPage, auth.css
- `src/pages/Scenarios/` — ScenarioFlow, SpecialtySelection, DifficultySelection, ModeSelection, MockTypeSelection, StationTypeSelection, ScenarioSelection, scenario-flow.css
- `src/pages/Profile/` — ProfilePage, profile.css
- `src/pages/PromptLab/` — PromptLab, PromptEditor, ChatPanel, TestPanel, promptLabApi.js, prompt-lab.css

#### Shared
- `src/components/BackButton.jsx` — Uniform back button
- `src/components/UpgradeModal.jsx` — Stripe checkout modal (inline styles)
- `src/lib/subscription.js` — `canAccessScenario()`, `isPremiumUser()` ported from vanilla
- `src/stores/authStore.js` — User, profile, subscription state
- `src/stores/selectionStore.js` — Selection flow state with persist
- `src/stores/sessionStore.js` — WebSocket session state
- `src/data/scenarios.js` — 165+ scenarios ported from vanilla `getTopicsData()`
- `public/images/Landing/` — 14 hero/parallax/why images

#### Files Modified
- `src/App.jsx` — React Router with all routes, useAuth at root
- `src/hooks/useAuth.js` — Full Zustand hydration (profile + subscription)
- `src/components/SimulationRoom.jsx` — React Router nav, Zustand auth, static access control import
- `vite.config.js` — SPA mode, proxy config
- `package.json` — prebuild script, new dependencies
- `vercel.json` — SPA rewrites, cleanUrls: false
- `frontend/index.html` — Now React SPA entry (replaced vanilla content)

### Build Output
- **JS:** ~1,345 KB (some chunks exceed 500KB — Three.js, GSAP, landing page)
- **CSS:** ~115 KB
- **Gzipped:** significantly smaller (~350KB JS, ~20KB CSS)

### Rollback Procedure
```bash
# Restore all files to pre-migration state
git checkout pre-full-react-migration -- .
git commit -m "revert: restore pre-React-migration state"
git push origin main
```
Additional tag `pre-react-migration` marks the state before even the simulation room React migration.

### Known Issues
- GSAP `ScrollTrigger` logs "target not found" warnings during initial render (cosmetic, no functional impact)
- Three.js + GSAP + landing CSS contribute to large chunk sizes (consider code splitting later)
- Existing E2E tests in `e2e-tests/` use vanilla DOM selectors — need updating for React

### Dependencies Added
- `react-router-dom` ^7 — Client-side routing
- `zustand` ^5 — Global state management
- `@supabase/supabase-js` — Auth + database
- `gsap` — Landing page scroll animations
- `lenis` — Smooth scroll
- `three` — 3D background
- (framer-motion was already installed for simulation room)

### Verification
- All 7 routes manually tested with Playwright browser
- Auth flow: login/signup forms render, Google OAuth redirects correctly
- Scenario flow: full path from specialty → topic → simulation launch
- Simulation room: WebSocket connects, exit returns to `/scenarios`
- Profile: loads user data from Zustand store
- Prompt Lab: 3-panel dark theme, API connectivity to backend
- Mobile: responsive layout verified at 393px viewport
- Build: clean Vite build, Vercel-compatible output structure

---

## Search Keywords for Claude Code

- VAD threshold tuning
- WebSocket debugging
- Necrotising fasciitis prompt
- Development environment setup
- Testing framework
- VS Code configuration
- Jest unit tests
- Cost optimization
- Session management
- Google Cloud TTS
- GPT-4o-mini integration
- React migration
- React Router SPA
- Zustand state management
- Landing page GSAP Three.js
- Vercel SPA deployment
- Auth session restore
- Scenario selection flow
- Rollback pre-full-react-migration
