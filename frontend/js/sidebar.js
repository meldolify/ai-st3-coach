// ============================================================================
// SIDEBAR.JS - Simulation Room Sidebar Navigation
// ============================================================================
// Handles the collapsible sidebar with category/subcategory/topic navigation
// Dependencies: scenarios.js (categorySubcategories, getTopicsForSubheading, etc.)
// ============================================================================

// Track expanded states
let expandedCategories = new Set();
let expandedSubcategories = new Set();
let currentScenarioFile = null;

/**
 * Initialize the simulation room sidebar
 * Populates categories and subcategories from scenarios.js data
 */
function initSimSidebar() {
  console.log('[Sidebar] Initializing simulation sidebar');

  // Reset any previous state
  expandedCategories.clear();
  expandedSubcategories.clear();

  // Collapse all categories first
  document.querySelectorAll('.nav-category').forEach(el => {
    el.classList.remove('expanded');
  });

  // Populate each category's subcategories
  populateSidebarCategory('clinical');
  populateSidebarCategory('call-the-boss');
  populateSidebarCategory('consent');
  populateSidebarCategory('structured');

  // Set up sidebar toggle button
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSimSidebar);
  }
}

/**
 * Create a subcategory element safely using DOM methods
 */
function createSubcategoryElement(category, sub) {
  const div = document.createElement('div');
  div.className = 'nav-subcategory';
  div.dataset.subcategory = sub.id;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-subcategory-btn';
  btn.onclick = () => toggleSimSubcategory(category, sub.id);

  const iconSpan = document.createElement('span');
  iconSpan.className = 'nav-icon';
  iconSpan.textContent = sub.icon;

  const labelSpan = document.createElement('span');
  labelSpan.className = 'nav-label';
  labelSpan.textContent = sub.name;

  const chevronSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevronSvg.setAttribute('class', 'nav-chevron');
  chevronSvg.setAttribute('width', '12');
  chevronSvg.setAttribute('height', '12');
  chevronSvg.setAttribute('viewBox', '0 0 24 24');
  chevronSvg.setAttribute('fill', 'none');
  chevronSvg.setAttribute('stroke', 'currentColor');
  chevronSvg.setAttribute('stroke-width', '2');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M9 18l6-6-6-6');
  chevronSvg.appendChild(path);

  btn.appendChild(iconSpan);
  btn.appendChild(labelSpan);
  btn.appendChild(chevronSvg);

  const topicsDiv = document.createElement('div');
  topicsDiv.className = 'nav-topics';
  topicsDiv.id = `topics-${sub.id}`;

  div.appendChild(btn);
  div.appendChild(topicsDiv);

  return div;
}

/**
 * Populate subcategories for a given category
 */
function populateSidebarCategory(category) {
  const container = document.getElementById(`subcats-${category}`);
  if (!container) return;

  const subcategories = categorySubcategories[category] || [];

  // Clear existing content
  container.innerHTML = '';

  // Create elements safely using DOM methods
  subcategories.forEach(sub => {
    const element = createSubcategoryElement(category, sub);
    container.appendChild(element);
  });
}

/**
 * Toggle category expansion in sidebar
 */
function toggleSimCategory(category) {
  const categoryEl = document.querySelector(`.nav-category[data-category="${category}"]`);
  if (!categoryEl) return;

  const isExpanded = expandedCategories.has(category);

  if (isExpanded) {
    expandedCategories.delete(category);
    categoryEl.classList.remove('expanded');
  } else {
    expandedCategories.add(category);
    categoryEl.classList.add('expanded');
  }
}

/**
 * Toggle subcategory expansion and load topics
 */
function toggleSimSubcategory(category, subcategoryId) {
  const subcatEl = document.querySelector(`.nav-subcategory[data-subcategory="${subcategoryId}"]`);
  if (!subcatEl) return;

  const isExpanded = expandedSubcategories.has(subcategoryId);

  if (isExpanded) {
    expandedSubcategories.delete(subcategoryId);
    subcatEl.classList.remove('expanded');
  } else {
    expandedSubcategories.add(subcategoryId);
    subcatEl.classList.add('expanded');

    // Load topics if not already loaded
    const topicsContainer = document.getElementById(`topics-${subcategoryId}`);
    if (topicsContainer && !topicsContainer.hasChildNodes()) {
      loadSidebarTopics(subcategoryId, topicsContainer);
    }
  }
}

/**
 * Create a topic button element safely
 */
function createTopicButton(topic, diff, promptFile, canAccess, isCurrent) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-topic-btn';
  if (isCurrent) btn.classList.add('current');
  if (!canAccess) btn.classList.add('locked');

  // topic has: file, name, image properties (from getTopicsForSubheading)
  const topicName = topic.name || topic.title || 'Unknown';
  const topicImage = topic.image || topic.imageFile || '';

  btn.onclick = () => {
    if (canAccess) {
      selectScenarioFromSidebar(topicName, topicImage, promptFile);
    }
  };

  if (!canAccess) btn.disabled = true;
  btn.title = `${topicName} (${diff})`;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'topic-name';
  nameSpan.textContent = topicName;

  const diffSpan = document.createElement('span');
  diffSpan.className = `topic-difficulty ${diff}`;
  diffSpan.textContent = diff === 'moderate' ? 'mod' : diff.substring(0, 4);

  btn.appendChild(nameSpan);
  btn.appendChild(diffSpan);

  return btn;
}

/**
 * Load topics for a subcategory - filtered by user's selected difficulty
 */
function loadSidebarTopics(subcategoryId, container) {
  // Get topics from scenarios.js
  const topics = getTopicsForSubheading(subcategoryId);
  if (!topics || topics.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'nav-topic-empty';
    emptyDiv.textContent = 'No topics available';
    container.appendChild(emptyDiv);
    return;
  }

  // Clear container using DOM method
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Get the user's selected difficulty (from state.js global)
  // Map 'medium' to 'moderate' for prompt file naming
  const difficultyMap = { 'easy': 'easy', 'medium': 'moderate', 'strict': 'strict' };
  const userDiff = selectedDifficulty || 'easy';
  const targetDiff = difficultyMap[userDiff] || userDiff;

  topics.forEach(topic => {
    // topic structure from getTopicsForSubheading: { file, name, image, difficulty }
    // Build prompt file path based on topic.file
    const folderName = topic.file.split('/').pop();
    const heading = topic.file.split('/')[0];

    // Only create ONE button per topic for the user's selected difficulty
    const promptFile = `prompts/${topic.file}/${targetDiff}_${heading}_${folderName}_1.txt`;
    const canAccess = typeof canAccessScenario === 'function' ? canAccessScenario(promptFile) : true;
    const isCurrent = currentScenarioFile === promptFile;

    const btn = createTopicButton(topic, targetDiff, promptFile, canAccess, isCurrent);
    container.appendChild(btn);
  });
}

/**
 * Select a scenario from the sidebar
 * If there's an active session, shows exit modal first
 */
function selectScenarioFromSidebar(title, imageFile, promptFile) {
  console.log('[Sidebar] Selecting scenario:', title);

  // Check if there's an active connected session
  if (window.session && window.session.isConnected) {
    console.log('[Sidebar] Active session detected, showing exit modal');

    // Show exit confirmation modal
    if (typeof showSessionExitModal === 'function') {
      showSessionExitModal();
      // Note: After user gets feedback and dismisses summary screen,
      // they'll need to click the new scenario again
      return;
    }
    // Fallback: disconnect and continue if modal not available
    window.session.disconnect();
  }

  // No active session - proceed with scenario switch
  performScenarioSwitch(title, imageFile, promptFile);
}

/**
 * Perform the actual scenario switch (after session check)
 */
function performScenarioSwitch(title, imageFile, promptFile) {
  // Update current scenario tracking
  currentScenarioFile = promptFile;

  // Update UI to show current selection
  highlightCurrentScenario(promptFile);

  // Load the scenario using existing function from scenarios.js
  if (typeof loadSelectedScenario === 'function') {
    loadSelectedScenario(title, imageFile, promptFile);
  } else {
    console.error('[Sidebar] loadSelectedScenario function not found');
  }

  // Update scenario title badge
  const titleEl = document.getElementById('currentScenarioTitle');
  const categoryEl = document.getElementById('currentScenarioCategory');

  if (titleEl) titleEl.textContent = title;

  // Show difficulty mode instead of category
  if (categoryEl) {
    const diff = selectedDifficulty || 'easy';
    const difficultyLabels = {
      'easy': 'Easy Mode',
      'medium': 'Medium Mode',
      'strict': 'Strict Mode'
    };
    categoryEl.textContent = difficultyLabels[diff] || 'Easy Mode';

    // Update CSS class for color
    categoryEl.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-strict');
    categoryEl.classList.add(`difficulty-${diff}`);
  }
}

/**
 * Highlight the currently selected scenario in sidebar
 */
function highlightCurrentScenario(promptFile) {
  // Remove current class from all topic buttons
  document.querySelectorAll('.nav-topic-btn.current').forEach(btn => {
    btn.classList.remove('current');
  });

  // We can't easily match by onclick content with DOM approach,
  // so we'll track via data attribute
  currentScenarioFile = promptFile;

  // Refresh the topics display to show current state
  // This is handled by the createTopicButton function checking currentScenarioFile
}

/**
 * Toggle sidebar expanded/collapsed state
 */
function toggleSimSidebar() {
  const sidebar = document.getElementById('simSidebar');
  if (sidebar) {
    sidebar.classList.toggle('expanded');
  }
}

/**
 * Reset sidebar state when exiting simulation
 */
function resetSimSidebar() {
  expandedCategories.clear();
  expandedSubcategories.clear();
  currentScenarioFile = null;

  // Collapse all categories
  document.querySelectorAll('.nav-category.expanded').forEach(el => {
    el.classList.remove('expanded');
  });

  // Collapse all subcategories
  document.querySelectorAll('.nav-subcategory.expanded').forEach(el => {
    el.classList.remove('expanded');
  });

  // Collapse sidebar itself
  const sidebar = document.getElementById('simSidebar');
  if (sidebar) {
    sidebar.classList.remove('expanded');
  }
}

/**
 * Expand sidebar to show current scenario
 */
function expandToCurrentScenario(promptFile) {
  if (!promptFile) return;

  currentScenarioFile = promptFile;

  // Parse the prompt file path to determine category and subcategory
  // Format: prompts/{category}/{subcategory}/{difficulty}_{topic}_1.txt
  const pathParts = promptFile.replace('prompts/', '').split('/');
  if (pathParts.length < 2) return;

  const category = pathParts[0];
  const subcategoryPath = pathParts[1];

  // Map folder names to sidebar category IDs
  const categoryMap = {
    'clinical': 'clinical',
    'call_the_boss': 'call-the-boss',
    'consent': 'consent',
    'structured': 'structured',
    'structured_interview': 'structured'
  };

  const sidebarCategory = categoryMap[category] || category.replace(/_/g, '-');

  // Find matching subcategory ID
  const subcategories = categorySubcategories[sidebarCategory] || [];
  const matchingSubcat = subcategories.find(sub => {
    // Check if subcategory path matches
    return sub.id.includes(subcategoryPath.replace(/_/g, '-')) ||
           subcategoryPath.includes(sub.id.replace(/-/g, '_'));
  });

  if (sidebarCategory) {
    // Expand the category
    expandedCategories.add(sidebarCategory);
    const categoryEl = document.querySelector(`.nav-category[data-category="${sidebarCategory}"]`);
    if (categoryEl) categoryEl.classList.add('expanded');

    // Expand matching subcategory if found
    if (matchingSubcat) {
      setTimeout(() => {
        toggleSimSubcategory(sidebarCategory, matchingSubcat.id);

        // Highlight current after topics are loaded
        setTimeout(() => {
          highlightCurrentScenario(promptFile);
        }, 100);
      }, 50);
    }
  }
}

// ============================================================================
// MOBILE SIDEBAR FUNCTIONALITY
// ============================================================================

/**
 * Initialize mobile sidebar (called alongside desktop init)
 */
function initMobileSidebar() {
  console.log('[Sidebar] Initializing mobile sidebar');

  const toggleBtn = document.getElementById('mobileSidebarToggle');
  const closeBtn = document.getElementById('mobileSidebarClose');
  const backdrop = document.getElementById('mobileSidebarBackdrop');
  const sidebar = document.getElementById('mobileSidebar');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', openMobileSidebar);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileSidebar);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileSidebar);
  }

  // Set up category buttons in mobile sidebar
  const mobileCategoryBtns = document.querySelectorAll('.mobile-sidebar-nav .nav-category-btn');
  mobileCategoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      if (category) {
        toggleMobileCategory(category);
      }
    });
  });

  // Populate mobile sidebar categories (mirrors desktop)
  populateMobileSidebarCategory('clinical');
  populateMobileSidebarCategory('call-the-boss');
  populateMobileSidebarCategory('consent');
  populateMobileSidebarCategory('structured');
}

/**
 * Populate subcategories for mobile sidebar using safe DOM methods
 */
function populateMobileSidebarCategory(category) {
  const container = document.getElementById(`mobile-subcats-${category}`);
  if (!container) return;

  const subcategories = categorySubcategories[category] || [];

  // Clear using safe DOM method
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  subcategories.forEach(sub => {
    const element = createMobileSubcategoryElement(category, sub);
    container.appendChild(element);
  });
}

/**
 * Create a mobile subcategory element using safe DOM methods
 */
function createMobileSubcategoryElement(category, sub) {
  const div = document.createElement('div');
  div.className = 'nav-subcategory';
  div.dataset.subcategory = sub.id;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-subcategory-btn';
  btn.onclick = () => toggleMobileSubcategory(category, sub.id);

  const iconSpan = document.createElement('span');
  iconSpan.className = 'nav-icon';
  iconSpan.textContent = sub.icon;

  const labelSpan = document.createElement('span');
  labelSpan.className = 'nav-label';
  labelSpan.textContent = sub.name;

  const chevronSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevronSvg.setAttribute('class', 'nav-chevron');
  chevronSvg.setAttribute('width', '12');
  chevronSvg.setAttribute('height', '12');
  chevronSvg.setAttribute('viewBox', '0 0 24 24');
  chevronSvg.setAttribute('fill', 'none');
  chevronSvg.setAttribute('stroke', 'currentColor');
  chevronSvg.setAttribute('stroke-width', '2');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M9 18l6-6-6-6');
  chevronSvg.appendChild(path);

  btn.appendChild(iconSpan);
  btn.appendChild(labelSpan);
  btn.appendChild(chevronSvg);

  const topicsDiv = document.createElement('div');
  topicsDiv.className = 'nav-topics';
  topicsDiv.id = `mobile-topics-${sub.id}`;

  div.appendChild(btn);
  div.appendChild(topicsDiv);

  return div;
}

/**
 * Toggle mobile category expansion
 */
function toggleMobileCategory(category) {
  const sidebar = document.getElementById('mobileSidebar');
  const categoryEl = sidebar?.querySelector(`.nav-category[data-category="${category}"]`);
  if (!categoryEl) return;

  const isExpanded = categoryEl.classList.contains('expanded');

  if (isExpanded) {
    categoryEl.classList.remove('expanded');
  } else {
    categoryEl.classList.add('expanded');
  }
}

/**
 * Toggle mobile subcategory expansion and load topics
 */
function toggleMobileSubcategory(category, subcategoryId) {
  const sidebar = document.getElementById('mobileSidebar');
  const subcatEl = sidebar?.querySelector(`.nav-subcategory[data-subcategory="${subcategoryId}"]`);
  if (!subcatEl) return;

  const isExpanded = subcatEl.classList.contains('expanded');

  if (isExpanded) {
    subcatEl.classList.remove('expanded');
  } else {
    subcatEl.classList.add('expanded');

    // Load topics if not already loaded
    const topicsContainer = document.getElementById(`mobile-topics-${subcategoryId}`);
    if (topicsContainer && !topicsContainer.hasChildNodes()) {
      loadMobileSidebarTopics(subcategoryId, topicsContainer);
    }
  }
}

/**
 * Load topics for mobile sidebar subcategory using safe DOM methods
 */
function loadMobileSidebarTopics(subcategoryId, container) {
  const topics = getTopicsForSubheading(subcategoryId);
  if (!topics || topics.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'nav-topic-empty';
    emptyDiv.textContent = 'No topics available';
    container.appendChild(emptyDiv);
    return;
  }

  // Clear using safe DOM method
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const difficultyMap = { 'easy': 'easy', 'medium': 'moderate', 'strict': 'strict' };
  const userDiff = selectedDifficulty || 'easy';
  const targetDiff = difficultyMap[userDiff] || userDiff;

  topics.forEach(topic => {
    const folderName = topic.file.split('/').pop();
    const heading = topic.file.split('/')[0];
    const promptFile = `prompts/${topic.file}/${targetDiff}_${heading}_${folderName}_1.txt`;
    const canAccess = typeof canAccessScenario === 'function' ? canAccessScenario(promptFile) : true;
    const isCurrent = currentScenarioFile === promptFile;

    const btn = createMobileTopicButton(topic, targetDiff, promptFile, canAccess, isCurrent);
    container.appendChild(btn);
  });
}

/**
 * Create a mobile topic button with auto-close behavior
 */
function createMobileTopicButton(topic, diff, promptFile, canAccess, isCurrent) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-topic-btn';
  if (isCurrent) btn.classList.add('current');
  if (!canAccess) btn.classList.add('locked');

  const topicName = topic.name || topic.title || 'Unknown';
  const topicImage = topic.image || topic.imageFile || '';

  btn.onclick = () => {
    if (canAccess) {
      selectScenarioFromSidebar(topicName, topicImage, promptFile);
      // Auto-close mobile sidebar after selection
      closeMobileSidebar();
      // Update mobile header scenario info
      updateMobileScenarioInfo(topicName);
    }
  };

  if (!canAccess) btn.disabled = true;
  btn.title = `${topicName} (${diff})`;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'topic-name';
  nameSpan.textContent = topicName;

  const diffSpan = document.createElement('span');
  diffSpan.className = `topic-difficulty ${diff}`;
  diffSpan.textContent = diff === 'moderate' ? 'mod' : diff.substring(0, 4);

  btn.appendChild(nameSpan);
  btn.appendChild(diffSpan);

  return btn;
}

/**
 * Open mobile sidebar
 */
function openMobileSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const backdrop = document.getElementById('mobileSidebarBackdrop');

  if (sidebar) sidebar.classList.add('active');
  if (backdrop) backdrop.classList.add('active');

  // Prevent body scroll when sidebar open
  document.body.style.overflow = 'hidden';
}

/**
 * Close mobile sidebar
 */
function closeMobileSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const backdrop = document.getElementById('mobileSidebarBackdrop');

  if (sidebar) sidebar.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');

  // Restore body scroll
  document.body.style.overflow = '';
}

/**
 * Update mobile header scenario info
 */
function updateMobileScenarioInfo(title, category) {
  const titleEl = document.getElementById('mobileScenarioTitle');
  const categoryEl = document.getElementById('mobileScenarioCategory');

  if (titleEl && title) {
    titleEl.textContent = title;
  }

  if (categoryEl) {
    const diff = selectedDifficulty || 'easy';
    const difficultyLabels = {
      'easy': 'Easy Mode',
      'medium': 'Medium Mode',
      'strict': 'Strict Mode'
    };
    categoryEl.textContent = category || difficultyLabels[diff] || 'Easy Mode';
  }
}

/**
 * Reset mobile sidebar state
 */
function resetMobileSidebar() {
  closeMobileSidebar();

  // Collapse all mobile categories
  const sidebar = document.getElementById('mobileSidebar');
  if (sidebar) {
    sidebar.querySelectorAll('.nav-category.expanded').forEach(el => {
      el.classList.remove('expanded');
    });
    sidebar.querySelectorAll('.nav-subcategory.expanded').forEach(el => {
      el.classList.remove('expanded');
    });
  }

  // Reset mobile header info
  updateMobileScenarioInfo('Select Scenario', '');
}

// Export functions for global access
window.initSimSidebar = initSimSidebar;
window.toggleSimCategory = toggleSimCategory;
window.toggleSimSubcategory = toggleSimSubcategory;
window.selectScenarioFromSidebar = selectScenarioFromSidebar;
window.toggleSimSidebar = toggleSimSidebar;
window.resetSimSidebar = resetSimSidebar;
window.expandToCurrentScenario = expandToCurrentScenario;

// Mobile exports
window.initMobileSidebar = initMobileSidebar;
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.updateMobileScenarioInfo = updateMobileScenarioInfo;
window.resetMobileSidebar = resetMobileSidebar;
