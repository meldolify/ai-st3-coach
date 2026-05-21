# CodeQL Accepted Findings

Audit trail for CodeQL findings we deliberately do **not** fix, with rationale.
Update this file when a new finding is dismissed.

Cross-references:
- Scan output: `static_analysis_codeql_1/results/results.sarif`
- Sanitizer extension that suppresses several findings at source: `docs/security/codeql-extensions/path-validators.yml`
- Original plan: `C:\Users\mezze\.claude\plans\make-a-solid-plan-parallel-clock.md`

| Rule ID | File:line | Reviewer | Date | Why accepted |
|---------|-----------|----------|------|--------------|
| `js/log-injection-more-sources` | [frontend-react/src/pages/PromptLab/PromptLab.jsx:73](../../frontend-react/src/pages/PromptLab/PromptLab.jsx#L73), 105, 119, 144, 154, 163 | dev | 2026-05-21 | Browser `console.log` calls inside the admin-only Prompt Lab page. Logs go to the user's own DevTools console, not a centralised log pipeline that an attacker could spoof or alert on. Admin-only access already gates this. |
| `js/log-injection-more-sources` | [frontend-react/src/pages/Profile/ProfilePage.jsx:166](../../frontend-react/src/pages/Profile/ProfilePage.jsx#L166), 187 | dev | 2026-05-21 | Browser `console.log` of the logged-in user's own data. Same reasoning as above — local DevTools console only. |
| `js/remote-property-injection-more-sources` | [frontend-react/src/pages/PromptLab/PromptLab.jsx:582](../../frontend-react/src/pages/PromptLab/PromptLab.jsx#L582) | dev | 2026-05-21 | `topicGroups[t.group]` builds buckets for `<optgroup>` rendering. Mitigation already applied: `topicGroups` is now `Object.create(null)` so a `t.group === "__proto__"` cannot poison `Object.prototype`. Even before that, the failure mode was a rendering glitch, not code execution. |
| `js/cors-permissive-configuration` | [backend/server.js:1059](../../backend/server.js#L1059) | dev | 2026-05-21 | Conditional config: production reads `FRONTEND_URL` (one specific origin) and falls back to `false` (no CORS) if unset. The wildcard previously used in dev has been tightened to a localhost allowlist, so this should no longer fire on the next scan; if it does, it's misreading the conditional. |
| `js/log-injection` / `js/log-injection-more-sources` | [backend/src/utils/promptAssembler.js](../../backend/src/utils/promptAssembler.js) — any remaining after sanitizeForLog wraps | dev | 2026-05-21 | The remaining log-injection candidates in `promptAssembler.js` operate on values that have already passed `validateInputs()` — `difficulty ∈ {easy,medium,strict}`, `domain ∈ {clinical, call_the_boss, consent, structured_interview}`. They are enum values, not free-text. The `sanitizeForLog` wraps applied in W4 are defence-in-depth, not strictly required. |
| `js/path-injection` | Any remaining in [backend/src/services/PromptLabService.js](../../backend/src/services/PromptLabService.js), [backend/src/services/TestScriptGenerator.js](../../backend/src/services/TestScriptGenerator.js) | dev | 2026-05-21 | Inputs are validated by `validateTopicPath` / `assertSafeTopicPath` (regex allowlist `^[a-z0-9_/]+$`, rejects `..` and leading `/`). Paths are resolved by `safeResolveInPromptsDir` / `safeResolveIn` which enforce `startsWith(root + sep)`. The data extension at `docs/security/codeql-extensions/path-validators.yml` models both as sanitizers — anything still flagged after that is a CodeQL false positive against our threat model. |
| `js/tainted-format-string` | [backend/src/services/GeminiTTSService.js:103](../../backend/src/services/GeminiTTSService.js#L103) | dev | 2026-05-21 | Template literal logging only — Node does not interpret `%s`-style format specifiers in `console.log` template literals. `voiceName` comes from server-side scenario config, not user input. `sanitizeForLog` wrap applied in W4 as defence-in-depth. |
| `js/xss-more-sources` | [frontend-react/src/lib/subscription.js:66](../../frontend-react/src/lib/subscription.js#L66), 90 | dev | 2026-05-21 | Mitigated, not accepted. The `isSafeRedirectUrl()` check added in W5 rejects anything that isn't an `https://*.stripe.com` URL before assignment to `window.location.href`. If CodeQL still flags the line because it can't trace the validator, that's a false positive — confirm via the data-extension's effect on the next scan run. |

## When to add a row here

- The next time you run CodeQL and a finding survives that you choose not to fix — add a row.
- If you change scope of an accepted finding (e.g. Prompt Lab becomes publicly accessible), revisit and either fix or re-justify.
- If a sanitizer goes away (someone removes `validateTopicPath`), the corresponding row in the data extension YAML must also be deleted, and the relevant code paths re-fixed at the call site.

## Re-running the scan

Run the same scan with the sanitizer extension applied so suppressed findings stop appearing:

```
cd "d:/Projects 2025/AI ST3 Coach V4"
codeql database create static_analysis_codeql_2/codeql.db \
  --language=javascript --source-root=. \
  --codescanning-config=static_analysis_codeql_1/codeql-config.yml --overwrite

codeql database analyze static_analysis_codeql_2/codeql.db \
  --format=sarif-latest \
  --output=static_analysis_codeql_2/raw/results.sarif \
  --threads=0 \
  --additional-packs=docs/security/codeql-extensions \
  -- static_analysis_codeql_1/raw/important-only.qls
```

Apply the Python post-filter from the original run to produce the final filtered SARIF.
