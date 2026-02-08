// ============================================================================
// TIMER.JS - Unified Scenario Timer
// ============================================================================
// Provides a configurable countdown timer for both practice and mock-exam modes.
// Practice: shows ready state with adjust buttons, user clicks Start.
// Mock exam: hides adjust buttons, auto-starts when session connects.
// ============================================================================

const ScenarioTimer = (function () {
  let timerSeconds = 300; // Default 5 minutes
  let remainingSeconds = 300;
  let intervalId = null;
  let isRunning = false;
  let startTimestamp = null;
  let mode = 'practice'; // 'practice' or 'mock-exam'

  const MIN_SECONDS = 60;   // 1 minute
  const MAX_SECONDS = 1800; // 30 minutes

  function getElements() {
    return {
      container: document.getElementById('scenarioTimer'),
      decreaseBtn: document.getElementById('timerDecrease'),
      increaseBtn: document.getElementById('timerIncrease'),
      startBtn: document.getElementById('timerStartBtn'),
      minutesEl: document.getElementById('timerMinutes'),
      secondsEl: document.getElementById('timerSeconds')
    };
  }

  function updateDisplay() {
    const els = getElements();
    if (!els.minutesEl || !els.secondsEl) return;

    const displaySeconds = isRunning ? remainingSeconds : timerSeconds;
    const mins = Math.floor(displaySeconds / 60);
    const secs = displaySeconds % 60;
    els.minutesEl.textContent = mins.toString().padStart(2, '0');
    els.secondsEl.textContent = secs.toString().padStart(2, '0');

    // Warning state
    if (isRunning && remainingSeconds <= 60 && remainingSeconds > 0) {
      els.container.classList.add('warning');
    } else {
      els.container.classList.remove('warning');
    }

    // Finished state
    if (isRunning && remainingSeconds <= 0) {
      els.container.classList.add('finished');
      els.container.classList.remove('warning');
    } else {
      els.container.classList.remove('finished');
    }
  }

  function tick() {
    // Recalculate from start timestamp for accuracy (handles background tab throttling)
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    remainingSeconds = Math.max(0, timerSeconds - elapsed);
    updateDisplay();

    if (remainingSeconds <= 0) {
      stopTimer();
      // Keep showing "TIME'S UP" - no auto-action
    }
  }

  function initTimer(timerMode) {
    mode = timerMode || 'practice';
    const els = getElements();
    if (!els.container) return;

    // Reset state
    stopTimer();
    timerSeconds = 300;
    remainingSeconds = 300;
    els.container.classList.remove('running', 'warning', 'finished');

    if (mode === 'mock-exam') {
      // Mock exam: hide adjust/start buttons, timer will auto-start
      els.container.classList.add('mock-mode');
    } else {
      // Practice: show adjust buttons and start button
      els.container.classList.remove('mock-mode');
    }

    updateDisplay();

    // Wire up buttons
    if (els.decreaseBtn) {
      els.decreaseBtn.onclick = function () { adjustTimer(-60); };
    }
    if (els.increaseBtn) {
      els.increaseBtn.onclick = function () { adjustTimer(60); };
    }
    if (els.startBtn) {
      els.startBtn.onclick = function () { startTimer(); };
    }
  }

  function adjustTimer(delta) {
    if (isRunning) return;
    timerSeconds = Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, timerSeconds + delta));
    remainingSeconds = timerSeconds;
    updateDisplay();
  }

  function startTimer() {
    if (isRunning) return;
    const els = getElements();
    if (!els.container) return;

    isRunning = true;
    remainingSeconds = timerSeconds;
    startTimestamp = Date.now();
    els.container.classList.add('running');
    els.container.classList.remove('finished');

    intervalId = setInterval(tick, 1000);
    updateDisplay();
  }

  function stopTimer() {
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function resetTimer() {
    stopTimer();
    const els = getElements();
    if (!els.container) return;
    remainingSeconds = timerSeconds;
    els.container.classList.remove('running', 'warning', 'finished');
    updateDisplay();
  }

  // Recalculate on tab focus (setInterval is throttled in background tabs)
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && isRunning) {
      tick();
    }
  });

  return {
    init: initTimer,
    adjust: adjustTimer,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
    get isRunning() { return isRunning; }
  };
})();
