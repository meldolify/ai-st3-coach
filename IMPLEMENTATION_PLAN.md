# Visual Polish & Layout Fixes

## Problem Statement
The current UI execution lacks professional polish, resembling a "MS Paint" mockup.
1.  **Buttons**: The control buttons are inconsistent in style (dark semi-transparent squircle vs. solid colored circles) and lack a cohesive design language.
2.  **Layout**: The bottom margin is missing or inconsistent, causing elements to feel crowded or cut off.
3.  **Orb Position**: The "Voice Orb" feels like a sticker on top of the persona image rather than an integrated UI element.

## Proposed Design Specs (for "Claude Code" Execution)

### 1. Unified Control Bar
Instead of floating individual buttons, implement a **Unified Control Bar** pinned to the bottom of the container.

*   **Container**:
    *   `width`: `90%` (centered with auto margins).
    *   `background`: `rgba(255, 255, 255, 0.9)` (Glassmorphism) or Solid White.
    *   `border-radius`: `100px` (Capsule shape).
    *   `padding`: `16px 32px`.
    *   `box-shadow`: `0 10px 40px rgba(0,0,0,0.1)` (Premium elevation).
    *   `bottom`: `24px` (Rigid margin from bottom of panel).
    *   `display`: `flex`, `justify-content`: `space-between`, `align-items`: `center`.

*   **Buttons (Inside Control Bar)**:
    *   **Record (Center)**: Largest element.
        *   size: `64px`.
        *   style: Solid primary color (e.g., `#E91E63` or `#6366F1`) with white icon.
        *   pulse animation when active.
    *   **Playback Controls (Left/Right)**:
        *   size: `48px`.
        *   style: Ghost/Subtle (grey background) or text-labeled.
        *   Play/Pause on one side, Stop/Disconnect on the other.

### 2. Panel Constraints & Margins
The panel currently has an "unlimited lower end".
*   **Fix**: Enforce `position: relative` and `overflow: hidden` on the parent `.persona-panel`.
*   **Flex-box Layout**:
    *   The internal container (`.persona-layout-container`) must use `height: 100%` with `box-sizing: border-box`.
    *   Use `padding-bottom: 32px` (or more) to create a visual "floor" that the Control Bar sits above.

### 3. Voice Orb Integration
The orb shouldn't obscure the persona's face.
*   **Position**: Move the orb to a dedicated "Status Area" or ensure the persona image is scaled/cropped such that the face is in the top 50% and the orb occupies the bottom 50% (empty chest area).
*   **Alternative**: Make the orb much smaller (`48px`) and integrate it into the **Control Bar** as a dynamic visualizer next to the record button.

## CSS Strategy
1.  **Clear Styles**: Delete all existing `.control-btn`, `.voice-orb`, and `.ai-status-bubble` styles to start fresh.
2.  **Theme Variables**: Use CSS variables for spacing and colors to ensure consistency btwn buttons.
3.  **Z-Index**: Ensure the `Control Bar` is `z-index: 20` and Image is `z-index: 0`.

## Example Structure
```html
<div class="persona-panel-footer">
  <!-- Unified Bar -->
  <div class="control-bar">
    <button class="btn-secondary">End Session</button>
    <div class="record-container">
       <button class="btn-record">🎤</button> <!-- Orb effect around this? -->
    </div>
    <button class="btn-secondary">Pause</button>
  </div>
</div>
```
