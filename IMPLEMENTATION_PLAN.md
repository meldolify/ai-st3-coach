# Step 1: Environment Optimization & Foundation (COMPLETED)
*Status: Done. VS Code debugging, Jest testing, and Linting are configured.*

---

# Step 2: Backend Scalability & Refactoring (COMPLETED)
*Status: Done. Modular structure (`backend/src/`) implemented. `server.js` retained as entry point but refactored to use `src/services`, `src/config`, and `src/utils`.*

---

# Step 3: Frontend Modernization (COMPLETED)
*Status: Done. Monolithic `index.html` and `index.js` refactored into modular JS files (`frontend/js/*.js`) and CSS (`frontend/styles/main.css`). No bundler used; scripts loaded via HTML tags.*

---

# Step 4: Security Hardening (COMPLETED)
*Status: Done. WebSocket middleware implemented for Rate Limiting, Session Security, and Message Validation.*

---

# Step 5: VAD Optimization (COMPLETED)
*Status: Done. Adaptive Noise Floor and Spectral Analysis implemented in `speech.js`.*

---

# Step 6: Testing Environment Setup (COMPLETED)
*Status: Done. Configured `launch.json` for "Full Stack + Embedded Edge" debugging. Solved "Headless Mode" issues by forcing `vscode-edge-devtools.headless: false` in `settings.json` and cleaning up stale processes. Created `TESTING_SETUP.md`.*

---

# Step 7: UI/UX Refinement (ACTIVE)

## Goal
Improve the clarity of the Unauthenticated experience and fix navigation bugs. **(To be implemented by Claude Code)**.

## Proposed Changes

### 1. Navigation Header Improvements
#### [MODIFY] `frontend/index.html`
*   **Guest Navigation:** Find `<div id="navLinksGuest">`. Change the "Explore" button text to **"Explore without login"**.
*   **Header Bug Fix:** Inspect the `navigateToLanding()` function key in `frontend/js/ui-helpers.js` (or inline if not separated).
    *   *Issue:* Clicking the logo from Profile page hides `appHeader` but might not correctly reset the state if the user IS logged in.
    *   *Fix:* Ensure `navigateToLanding()` checks `isAuthenticated` state. If logged in, it should probably go to `Dashboard` or keep `appHeader` visible if staying on a protected route. Or, if it goes to Landing, it should ensure the correct Nav (Guest vs User) is shown.

### 2. Landing Page Reorganization
#### [MODIFY] `frontend/index.html`
*   **Reorder Sections:**
    *   Move the entire `.hero-buttons` container (currently inside `.landing-hero`) to be **BELOW** the `.landing-features` section.
    *   *Alternative Layout:* If moving buttons out of Hero breaks the flow, consider moving `.landing-features` UP to sit between the Hero Description and the Hero Buttons.
    *   *Requirement:* VISUAL ORDER: Hero Title -> Features (Why Choose Us) -> Big Action Buttons.
*   **Rename Buttons (`.hero-buttons`):**
    *   Button 1 (Primary): Change "Start Practicing Free" to **"Login to Practise Free Sample Scenarios"**.
    *   Button 2 (Secondary): Change "Explore Scenarios" to **"Explore the website without login"**.
*   **Styling:** Update `frontend/styles/main.css` to accommodate the longer button text (allow wrapping or increase container width).

## Verification Plan
1.  **Visual Check:** Verify "Features" appear before "Buttons".
2.  **Navigation Check:** Go to Profile -> Click Logo -> Ensure Header/Nav bar state is correct.
