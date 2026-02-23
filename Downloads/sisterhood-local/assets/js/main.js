// assets/js/main.js
// sisterhood.exe — shared site JS (no background canvas, no blog expandable)
// Handles: mobile nav toggle (with outside click + Esc), contact form (Formspree),
// join button scroll, GitHub placeholder alert, fade-in on scroll, hero tagline typing.

document.addEventListener('DOMContentLoaded', function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========== Mobile nav toggle ==========
  (function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    function openMenu() {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen()) closeMenu();
      else openMenu();
    });

    // Close menu after clicking a link (mobile)
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 900px)').matches) {
          closeMenu();
        }
      });
    });

    // Close when clicking outside the nav
    document.addEventListener('click', (e) => {
      if (!isOpen()) return;
      const clickedInsideNav = e.target.closest('.nav-bar');
      if (!clickedInsideNav) closeMenu();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) closeMenu();
    });
  })();

  // ========== Contact form (Formspree) ==========
  const messageForm = document.getElementById('messageForm');
  const formStatus = document.getElementById('formStatus');

  if (messageForm && formStatus) {
    messageForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const action = messageForm.getAttribute('action');

      // If you didn't replace YOUR_FORM_ID yet, show a helpful message
      if (action && action.includes('YOUR_FORM_ID')) {
        formStatus.className = 'form-status form-status--error';
        formStatus.textContent =
          '> config_required: Replace YOUR_FORM_ID in index.html with your Formspree form ID from formspree.io';
        return;
      }

      const submitBtn = messageForm.querySelector('.form-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '> sending...';
      }

      const formData = new FormData(messageForm);

      fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) {
          if (r.ok) {
            formStatus.className = 'form-status form-status--success';
            formStatus.textContent = "> message_sent · we'll get back to you soon.";
            messageForm.reset();
          } else {
            formStatus.className = 'form-status form-status--error';
            formStatus.textContent =
              '> error · something went wrong. try again or email us directly.';
          }
        })
        .catch(function () {
          formStatus.className = 'form-status form-status--error';
          formStatus.textContent =
            '> error · something went wrong. try again or email us directly.';
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '> send_message';
          }
        });
    });
  }

  // ========== Join button (scroll to contact) ==========
  const joinButton = document.getElementById('joinButton');
  if (joinButton) {
    joinButton.addEventListener('click', function () {
      const contactSection = document.querySelector('.contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // small press animation
      joinButton.style.transform = 'scale(0.95)';
      setTimeout(() => { joinButton.style.transform = 'scale(1)'; }, 150);
    });
  }

  // ========== GitHub link placeholder ==========
  // Only intercept if the href is still "#"
  const githubLink = document.getElementById('githubLink');
  if (githubLink && githubLink.getAttribute('href') === '#') {
    githubLink.addEventListener('click', function (e) {
      e.preventDefault();
      alert('GitHub link - update with your actual GitHub URL');
    });
  }

   // ========== Fade-in on scroll ==========
  if (!prefersReducedMotion) {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('.service-card, .content-box, .blog-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });
  }


  // ========== Hero tagline typing effect ==========
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    const originalText = tagline.textContent;
    if (!originalText || !originalText.trim()) return;

    if (prefersReducedMotion) {
      // Show text instantly, no animation
      tagline.textContent = originalText;
      tagline.style.opacity = '1';
    } else {
      tagline.textContent = '';
      tagline.style.opacity = '0';

      setTimeout(() => {
        tagline.style.opacity = '1';
        let i = 0;
        const typeInterval = setInterval(() => {
          if (i < originalText.length) {
            tagline.textContent = originalText.substring(0, i + 1);
            i++;
          } else {
            clearInterval(typeInterval);
          }
        }, 50);
      }, 500);
    }
  }
});
