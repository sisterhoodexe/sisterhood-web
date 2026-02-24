// assets/js/blog.js
// sisterhood.exe — blog-only JS
// Handles: "Read more" / "Read less" expandable cards on blog page.

document.addEventListener('DOMContentLoaded', function () {
  (function initBlogExpandable() {
    const buttons = document.querySelectorAll('.blog-read-more-btn');
    if (!buttons.length) return;

    const expandedLabel = '> read less';
    const collapsedLabel = '> read more';

    function expand(btn, region, card) {
      // Set to actual content height so transition works
      region.style.maxHeight = region.scrollHeight + 'px';
      region.classList.add('is-open');
      card.classList.add('is-expanded');
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = expandedLabel;
    }

    function collapse(btn, region, card) {
      // Set current height, then transition to 0
      region.style.maxHeight = region.scrollHeight + 'px';
      requestAnimationFrame(function () {
        region.style.maxHeight = '0';
        card.classList.remove('is-expanded');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = collapsedLabel;
      });

      // Clear styles after close so it can re-measure later if content changes
      region.addEventListener(
        'transitionend',
        function clearAfterCollapse() {
          region.style.maxHeight = '';
          region.classList.remove('is-open');
        },
        { once: true }
      );
    }

    buttons.forEach(function (btn) {
      const id = btn.getAttribute('aria-controls');
      if (!id) return;

      const region = document.getElementById(id);
      const card = btn.closest('.blog-card');
      if (!region || !card) return;

      // Ensure starting state is collapsed
      region.style.maxHeight = '0';
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = collapsedLabel;

      btn.addEventListener('click', function () {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        if (isExpanded) collapse(btn, region, card);
        else expand(btn, region, card);
      });
    });
  })();
});
