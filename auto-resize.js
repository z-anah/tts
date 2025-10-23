(function () {
  function autoResize(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight) + 'px';
  }

  function setupAutoResize() {
    // Resize any existing textareas
    document.querySelectorAll('textarea').forEach(autoResize);

    // Resize on user input (capture to handle dynamically added textareas too)
    document.addEventListener('input', function (e) {
      if (e.target && e.target.tagName === 'TEXTAREA') {
        autoResize(e.target);
      }
    }, true);

    // Observe DOM for added textareas (for Vue dynamic inserts)
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          if (node.tagName === 'TEXTAREA') autoResize(node);
          node.querySelectorAll && node.querySelectorAll('textarea').forEach(autoResize);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAutoResize);
  } else {
    setupAutoResize();
  }
})();
