# Frontend Cleanup Report

**Generated:** 2026-02-02
**Backup Branch:** `backup/pre-frontend-cleanup-2026-02-02`

---

## SUMMARY

| Category | Count | Priority |
|----------|-------|----------|
| Obsolete Files | 3 | HIGH |
| Duplicate Functions | 4 | HIGH |
| Legacy Code Blocks | 1 (~450 lines) | MEDIUM |
| Duplicate Data Structures | 3 | HIGH |
| CLAUDE.md Outdated | 2 issues | LOW |

---

## 1. OBSOLETE FILES (Safe to Delete)

### 1.1 `index-monolithic.js` (~2,684 lines)
- **Status:** DEFINITELY OBSOLETE
- **Reason:** Old monolithic version before code was modularized into separate JS files
- **Evidence:** Contains duplicate of all code now in `js/*.js` files
- **Action:** DELETE

### 1.2 `index-monolithic.html`
- **Status:** DEFINITELY OBSOLETE
- **Reason:** Old monolithic HTML version
- **Action:** DELETE

### 1.3 `js/webgl-persona-reveal.js`
- **Status:** DISABLED/UNUSED
- **Reason:** Explicitly commented out in index.html (lines 1802-1804)
- **Evidence:**
  ```html
  <!-- WebGL Persona Reveal (disabled - replaced with gradient cards)
  <script src="js/webgl-persona-reveal.js"></script>
  -->
  ```
- **Action:** DELETE (or keep if planning to re-enable)

---

## 2. DUPLICATE FUNCTIONS

### 2.1 `float32ToWav()` - Duplicated 3x
| File | Lines |
|------|-------|
| `js/speech.js` | 338-372 |
| `js/vad/VADManager.js` | 205-239 |
| `js/vad/SimpleVAD.js` | 413-447 |

**Action:** Extract to shared `js/utils/audio-utils.js`

### 2.2 `blobToBase64()` - Duplicated 3x
| File | Lines |
|------|-------|
| `js/speech.js` | 374-383 |
| `js/vad/VADManager.js` | 241-250 |
| `js/vad/SimpleVAD.js` | 452-461 |

**Action:** Extract to shared `js/utils/audio-utils.js`

### 2.3 `_getPreferredMimeType()` - Duplicated 2x
| File | Lines |
|------|-------|
| `js/speech.js` | 408-430 |
| `js/vad/SimpleVAD.js` | 319-336 |

**Action:** Extract to shared utility

### 2.4 `escapeHtml()` / `escapeHtmlSidebar()` - Duplicated 2x
| File | Lines |
|------|-------|
| `js/ui-helpers.js` | 242-246 |
| `js/sidebar.js` | 16-20 |

**Action:** Use single shared version from ui-helpers.js

---

## 3. DUPLICATE DATA STRUCTURES

### 3.1 Topics Data - Duplicated 3-4x
The same scenario topics data is defined in multiple places:

| Location | Purpose | ~Lines |
|----------|---------|--------|
| `scenarios.js:155-431` | `getTopicsData()` - Primary source | 276 |
| `scenarios.js:645-933` | `updateTopicsContent()` - Legacy panels | 288 |
| `scenarios.js:1159-1375` | `mobileShowTopics()` - Mobile UI | 216 |
| `mock-exam.js:47-261` | `mockExamTopicsData` - Mock exam | 214 |

**Total duplication:** ~700+ lines of duplicate data

**Action:** Consolidate to single source (`getTopicsData()`), have all other functions reference it

---

## 4. LEGACY CODE BLOCKS

### 4.1 Legacy Panel Navigation (`scenarios.js:562-1010`)
- **Lines:** 565-1010 (~445 lines)
- **Comment:** "LEGACY PANEL NAVIGATION (Keeping for backwards compatibility)"
- **Functions included:**
  - `toggleMenu()`
  - `showSubheadings()`
  - `cancelSubheadingsTimer()`
  - `cancelTopicsTimer()`
  - `showTopics()`
  - `updateTopicsContent()` (includes duplicate topics data)
  - `handlePanelMouseLeave()`
  - `hideAllPanels()`
  - `initMobilePanelNavigation()`
  - `mobileShowHeadings()`
  - `mobileShowSubheadings()`
  - `mobileShowTopics()` (includes duplicate topics data)

**Status:** Need to verify if these are still called anywhere or can be removed

**Action:**
1. Search codebase for calls to these functions
2. If unused, DELETE entire section
3. If used, consider refactoring to use new card-based navigation

---

## 5. POTENTIALLY UNUSED CODE

### 5.1 Variables
| Variable | File | Line | Notes |
|----------|------|------|-------|
| `originalShowAuthPage` | auth.js | 811 | Stored but never used |
| `originalExitSimulation` | mock-exam.js | 756 | Stored but never used |

### 5.2 Functions
| Function | File | Notes |
|----------|------|-------|
| `exitMockExamSimulation()` | mock-exam.js:758 | Defined but never called |
| `loadSelectedScenario()` | Referenced in sidebar.js:251 | Not found - may be missing |

---

## 6. INLINE CSS IN HTML

`index.html` contains ~500 lines of inline CSS (lines 36-500+) that could be moved to `styles/main.css`:
- Simulation room styles
- Neumorphic button styles
- Control button styles
- AI status bubble styles
- Mobile orb optimization

**Action:** Consider extracting to main.css for maintainability

---

## 7. CLAUDE.md DOCUMENTATION OUTDATED

| Issue | Current | Actual |
|-------|---------|--------|
| `index.js` reference | "2,684 lines" | File doesn't exist |
| `index.html` line count | "4,354 lines" | 1,807 lines |

**Action:** Update CLAUDE.md to reflect current modular structure

---

## 8. RECOMMENDED CLEANUP ORDER

### Phase 2A: Quick Wins (Low Risk) ✅ COMPLETED
1. [x] Delete `index-monolithic.js` - DONE
2. [x] Delete `index-monolithic.html` - DONE
3. [x] Delete `js/webgl-persona-reveal.js` - DONE
4. [x] Remove comment reference to webgl-persona-reveal.js in index.html - DONE

### Phase 2B: Consolidate Utilities ✅ COMPLETED
1. [x] Create `js/utils/audio-utils.js` with shared functions - DONE
2. [x] Update imports in speech.js, VADManager.js, SimpleVAD.js - DONE
3. [x] Remove duplicate escapeHtml from sidebar.js - DONE (was unused, simply deleted)

### Phase 2C: Consolidate Data ✅ COMPLETED
1. [x] Removed duplicate topics data from legacy functions - DONE (824 lines deleted)
2. [x] `updateTopicsContent()` - REMOVED (legacy code)
3. [x] `mobileShowTopics()` - REMOVED (legacy code)
4. [x] `mockExamTopicsData` - Consolidated with getMockExamTopics() wrapper

### Phase 2D: Remove Legacy Code ✅ COMPLETED
1. [x] Verified legacy panel functions (toggleMenu, showSubheadings, etc.) are NOT called anywhere
2. [x] Removed ~824 lines of legacy code from scenarios.js (lines 561-1383)
3. [x] Fixed missing `loadSelectedScenario` function (created proper implementation)

### Phase 2E: Documentation ✅ COMPLETED
1. [x] Updated CLAUDE.md with current modular structure
2. [ ] Consider moving inline CSS to main.css - DEFERRED (optional)

---

## ACTUAL SAVINGS (COMPLETED)

| Action | Lines Removed |
|--------|---------------|
| Delete monolithic files (js + html) | 7,070 |
| Remove webgl-persona-reveal.js | 566 |
| Remove legacy panel navigation + duplicate topics | 824 |
| Remove duplicate utility functions | ~180 |
| index.html cleanup | 630 |
| **Total** | **~9,270 lines** |

**Before cleanup:** ~16,000+ lines
**After cleanup:** ~6,700 lines
**Reduction: ~58%**

---

## COMPLETION STATUS

**Completed:** 2026-02-02
**Lines removed:** ~9,270
**New files created:** js/utils/audio-utils.js (~100 lines)
**Bugs fixed:** Added missing loadSelectedScenario() function
