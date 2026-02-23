// sisterhood.exe — main JS
// Handles: background canvas animation, contact form (Formspree), join button scroll, GitHub link, blog read more/less, fade-in on scroll, hero tagline typing.
// Everything runs after the page is loaded so we're not trying to grab elements that don't exist yet.
document.addEventListener('DOMContentLoaded', function() {
// ========== Mobile nav toggle ==========
(function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    function openMenu() {
        menu.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    function isOpen() {
        return toggle.getAttribute('aria-expanded') === 'true';
    }

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOpen()) closeMenu();
        else openMenu();
    });

    // close menu after clicking a link (on mobile)
    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 900px)').matches) {
                closeMenu();
            }
        });
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
        if (!isOpen()) return;
        const clickedInsideNav = e.target.closest('.nav-bar');
        if (!clickedInsideNav) closeMenu();
    });

    // close on esc key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) closeMenu();
    });
})();

    // ========== Background animation (the moving dots, lines, stars behind the page) ==========
    // We draw on a canvas so it's one layer - no need to animate a ton of DOM elements
    const bgCanvas = document.getElementById('bg-grid');
    if (bgCanvas) {
        const ctx = bgCanvas.getContext('2d');

        const nodes = [];      // floating points that get connected with lines
        const orbitRings = []; // the oval rings
        const shapes = [];     // little triangles/squares/hexagons
        const stars = [];      // twinkly stars

        // When the window resizes we need to redraw everything at the new size and regenerate positions
        const resizeBg = () => {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
            const w = bgCanvas.width;
            const h = bgCanvas.height;

            // Clear and regenerate elements
            nodes.length = 0;
            orbitRings.length = 0;
            shapes.length = 0;
            stars.length = 0;

            // How many of each thing we draw - scales with screen size so it doesn't look empty on big monitors
            const starCount = Math.floor((w * h) / 14000);
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    depth: Math.random(),
                    tint: Math.random(),
                    phase: Math.random() * Math.PI * 2,
                    twinkleSpeed: 0.002 + Math.random() * 0.003
                });
            }

            const nodeCount = Math.floor((w * h) / 8000);
            for (let i = 0; i < nodeCount; i++) {
                nodes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.08,
                    vy: (Math.random() - 0.5) * 0.08,
                    phase: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.001 + Math.random() * 0.002
                });
            }

            const ringCount = Math.floor((w * h) / 90000);
            for (let i = 0; i < ringCount; i++) {
                orbitRings.push({
                    cx: Math.random() * w,
                    cy: Math.random() * h,
                    radius: 30 + Math.random() * 220,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.0004,
                    phase: Math.random() * Math.PI * 2
                });
            }

            const shapeCount = Math.floor((w * h) / 200000);
            for (let i = 0; i < shapeCount; i++) {
                shapes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    size: 8 + Math.random() * 16,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.0002,
                    type: Math.floor(Math.random() * 3)
                });
            }
        };
        resizeBg();
        window.addEventListener('resize', resizeBg);

        // t = time-ish, we increment it each frame so animations (twinkle, rotation, etc.) move
        let t = 0;
        const drawSystem = () => {
            const w = bgCanvas.width;
            const h = bgCanvas.height;
            ctx.clearRect(0, 0, w, h);

            stars.forEach(star => {
                const parallax = (1 - star.depth) * 0.3;
                const dx = Math.cos(t * 0.0004) * parallax * 8;
                const dy = Math.sin(t * 0.0003) * parallax * 8;
                let x = star.x + dx;
                let y = star.y + dy;
                if (x < 0) x += w;
                if (x > w) x -= w;
                if (y < 0) y += h;
                if (y > h) y -= h;
                const size = 0.6 + (1 - star.depth) * 1.2;
                const twinkle = 0.4 + 0.6 * Math.sin(t * star.twinkleSpeed + star.phase);
                if (star.tint < 0.65) {
                    ctx.fillStyle = `rgba(255, 248, 251, ${0.12 + 0.18 * twinkle})`;
                } else if (star.tint < 0.85) {
                    ctx.fillStyle = `rgba(255, 0, 121, ${0.1 + 0.15 * twinkle})`;
                } else {
                    ctx.fillStyle = `rgba(0, 255, 255, ${0.08 + 0.12 * twinkle})`;
                }
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            });

            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < -10) n.x = w + 10;
                if (n.x > w + 10) n.x = -10;
                if (n.y < -10) n.y = h + 10;
                if (n.y > h + 10) n.y = -10;
            });

            const maxDist = 170;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < maxDist) {
                        const alpha = 0.12 * (1 - dist / maxDist);
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(255, 0, 121, ${alpha})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            orbitRings.forEach(ring => {
                ring.rotation += ring.rotationSpeed;
                const pulse = 0.85 + 0.15 * Math.sin(t * 0.0015 + ring.phase);
                ctx.save();
                ctx.translate(ring.cx, ring.cy);
                ctx.rotate(ring.rotation);
                ctx.beginPath();
                ctx.ellipse(0, 0, ring.radius, ring.radius * 0.6, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 0, 121, ${0.08 * pulse})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(0, 0, ring.radius * 0.6, ring.radius * 0.4, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 248, 251, ${0.06 * pulse})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.restore();
            });

            shapes.forEach(shape => {
                shape.rotation += shape.rotationSpeed;
                ctx.save();
                ctx.translate(shape.x, shape.y);
                ctx.rotate(shape.rotation);
                ctx.strokeStyle = 'rgba(255, 248, 251, 0.1)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                if (shape.type === 0) {
                    ctx.moveTo(0, -shape.size);
                    ctx.lineTo(shape.size * 0.866, shape.size * 0.5);
                    ctx.lineTo(-shape.size * 0.866, shape.size * 0.5);
                    ctx.closePath();
                } else if (shape.type === 1) {
                    ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
                } else {
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2;
                        const x = Math.cos(angle) * shape.size;
                        const y = Math.sin(angle) * shape.size;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                }
                ctx.stroke();
                ctx.restore();
            });

            nodes.forEach(n => {
                const pulse = 0.7 + 0.3 * Math.sin(t * n.pulseSpeed + n.phase);
                const r = 0.8 + pulse * 0.6;
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 248, 251, ${0.15 + 0.1 * pulse})`;
                ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                ctx.fill();
            });

            t += 0.5;
            requestAnimationFrame(drawSystem); // loop: draw again next frame
        };

        drawSystem();
    }

    // ========== Contact form (send message) ==========
    // Formspree receives the form and emails us. We just POST to their URL and show success/error here.
    const messageForm = document.getElementById('messageForm');
    const formStatus = document.getElementById('formStatus');
        if (messageForm && formStatus) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault(); // don't do the default form submit, we're doing it with fetch
            const action = messageForm.getAttribute('action');
            // If you haven't replaced YOUR_FORM_ID in index.html yet, we show a friendly error instead of sending to a broken URL
            if (action && action.includes('YOUR_FORM_ID')) {
                formStatus.className = 'form-status form-status--error';
                formStatus.textContent = '> config_required: Replace YOUR_FORM_ID in index.html with your Formspree form ID from formspree.io';
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
                .then(function(r) {
                    if (r.ok) {
                        formStatus.className = 'form-status form-status--success';
                        formStatus.textContent = "> message_sent · we'll get back to you soon.";
                        messageForm.reset();
                    } else {
                        formStatus.className = 'form-status form-status--error';
                        formStatus.textContent = '> error · something went wrong. try again or email us directly.';
                    }
                })
                .catch(function() {
                    formStatus.className = 'form-status form-status--error';
                    formStatus.textContent = '> error · something went wrong. try again or email us directly.';
                })
                .finally(function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '> send_message';
                    }
                });
        });
    }

    // ========== Join button ==========
    // "get started" just smooth-scrolls down to the contact section so people can reach out
    const joinButton = document.getElementById('joinButton');
    if (joinButton) {
        joinButton.addEventListener('click', function() {
            const contactSection = document.querySelector('.contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // little press animation
            joinButton.style.transform = 'scale(0.95)';
            setTimeout(() => { joinButton.style.transform = 'scale(1)'; }, 150);
        });
    }

    // GitHub link: right now it's # so we prevent going nowhere and show an alert. When we have a real repo URL, change the href in index.html and you can remove this listener (or make it open in new tab).
    const githubLink = document.getElementById('githubLink');
    if (githubLink) {
        githubLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('GitHub link - update with your actual GitHub URL');
        });
    }

    // ========== Blog "Read more" / "Read less" ==========
    // Each card has a button with aria-controls pointing to the expandable region's id. We toggle max-height so the open/close animates nicely.
    (function initBlogExpandable() {
        var buttons = document.querySelectorAll('.blog-read-more-btn');
        var expandedLabel = '> read less';
        var collapsedLabel = '> read more';

        function expand(btn, region, card) {
            region.style.maxHeight = region.scrollHeight + 'px'; // use actual content height so transition works
            region.classList.add('is-open');
            card.classList.add('is-expanded');
            btn.setAttribute('aria-expanded', 'true');
            btn.textContent = expandedLabel;
        }

        function collapse(btn, region, card) {
            region.style.maxHeight = region.scrollHeight + 'px'; // set to current height first so transition to 0 is smooth
            requestAnimationFrame(function() {
                region.style.maxHeight = '0';
                card.classList.remove('is-expanded');
                btn.setAttribute('aria-expanded', 'false');
                btn.textContent = collapsedLabel;
            });
            // After the transition ends we clear max-height so if the card content changes it can grow/shrink
            region.addEventListener('transitionend', function clearAfterCollapse() {
                region.removeEventListener('transitionend', clearAfterCollapse);
                region.style.maxHeight = '';
                region.classList.remove('is-open');
            }, { once: true });
        }

        buttons.forEach(function(btn) {
            var id = btn.getAttribute('aria-controls');
            if (!id) return;
            var region = document.getElementById(id);
            var card = btn.closest('.blog-card');
            if (!region || !card) return;

            btn.addEventListener('click', function() {
                var isExpanded = btn.getAttribute('aria-expanded') === 'true';
                if (isExpanded) {
                    collapse(btn, region, card);
                } else {
                    expand(btn, region, card);
                }
            });
        });
    })();

    // ========== Fade-in on scroll ==========
    // When service cards, content boxes, or blog cards scroll into view we fade them in and slide them up a bit. Makes the page feel less static.
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver(function(entries) {
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

    // ========== Hero tagline typing effect ==========
    // The line under the big title ("building safer digital spaces...") types out character by character. Only runs on the hero that has .hero-tagline (homepage or blog).
    const tagline = document.querySelector('.hero-tagline');
    if (tagline) {
        const originalText = tagline.textContent;
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
});
