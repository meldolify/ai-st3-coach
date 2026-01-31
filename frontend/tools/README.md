# Frontend Tools

Development tools for the ST3 Interview Coach frontend.

## UI Annotator (`ui-annotator.html`)

An interactive playground for visually annotating UI elements and generating design change requests.

### Purpose

Allows pointing at specific elements across the website and describing what changes you want. Generates a structured markdown prompt that can be copied and given to Claude for implementation.

### How to Use

1. **Start the frontend dev server** (required for the iframe to work):
   ```bash
   cd frontend
   npx serve . -l 5500
   ```
   **Important:** Do NOT use `-s` flag (SPA mode) - it will redirect all requests to index.html.

2. **Open the annotator** in your browser:
   - Navigate to `http://localhost:5500/tools/ui-annotator.html`
   - Or open the file directly (but iframe won't load without server)

3. **Navigate between pages** using the tabs at the top:
   - Landing, Auth, Profile, Specialty, Difficulty, Mode, Mock Type, Station Type, Scenarios, Simulation

4. **Add annotations**:
   - Ensure the "Overlay" toggle is enabled (green)
   - Click anywhere on the preview to drop a marker
   - Fill in the annotation form:
     - **Element Name**: What you're pointing at (e.g., "Voice Orb", "Record Button")
     - **Change Request**: What you want changed
     - **Priority**: High (red), Medium (orange), Low (green)
     - **Category**: Color, Size, Spacing, Typography, Animation, Layout, Other

5. **Manage annotations**:
   - Click an annotation card to edit it
   - Click the X to delete
   - Annotations persist in localStorage across sessions

6. **Generate prompt**:
   - The prompt updates live as you add annotations
   - Click "Copy Prompt" to copy to clipboard
   - Paste into Claude to request the changes

### Features

- **Live iframe preview** of the actual frontend
- **10 page tabs** matching all app pages
- **Color-coded markers** by priority
- **Overlay toggle** to enable/disable click capture (disable to interact with actual UI)
- **Persistent storage** via localStorage
- **Markdown output** grouped by page, sorted by priority

### Technical Notes

- Single-file HTML with inline CSS and JS (no dependencies)
- Uses postMessage to communicate with iframe for page navigation
- Markers use percentage positioning (responsive)
- Added message listener in `js/app.js` to handle page navigation from annotator

### Example Output

```markdown
# UI Design Changes for ST3 Interview Coach

## Simulation

1. **Voice Orb** [High Priority - Size]
   → Increase size to 150px and add more prominent glow

2. **Record Button** [Medium Priority - Color]
   → Change the red to a softer coral tone

## Scenarios

3. **Category Cards** [High Priority - Layout]
   → Add more spacing between cards

---
*Generated with UI Annotator Playground*
```
