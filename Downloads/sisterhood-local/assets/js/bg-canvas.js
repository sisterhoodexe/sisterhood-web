// assets/js/bg-canvas.js
// sisterhood.exe — background canvas animation only
// Draws: stars, connecting nodes, orbit rings, and floating shapes behind the page.
// Safe to load on any page that has <canvas id="bg-grid"></canvas>

document.addEventListener('DOMContentLoaded', function () {
  const bgCanvas = document.getElementById('bg-grid');
  if (!bgCanvas) return;

  const ctx = bgCanvas.getContext('2d');

  const nodes = [];      // floating points connected with lines
  const orbitRings = []; // oval rings
  const shapes = [];     // triangles/squares/hexagons
  const stars = [];      // twinkly stars

  // Resize + regenerate all background elements
  const resizeBg = () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    const w = bgCanvas.width;
    const h = bgCanvas.height;

    nodes.length = 0;
    orbitRings.length = 0;
    shapes.length = 0;
    stars.length = 0;

    // Scale counts to screen area
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

  // Time-ish counter
  let t = 0;

  const drawSystem = () => {
    const w = bgCanvas.width;
    const h = bgCanvas.height;
    ctx.clearRect(0, 0, w, h);

    // Stars
    stars.forEach(star => {
      const parallax = (1 - star.depth) * 0.3;
      const dx = Math.cos(t * 0.0004) * parallax * 8;
      const dy = Math.sin(t * 0.0003) * parallax * 8;

      let x = star.x + dx;
      let y = star.y + dy;

      // Wrap edges
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

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -10) n.x = w + 10;
      if (n.x > w + 10) n.x = -10;
      if (n.y < -10) n.y = h + 10;
      if (n.y > h + 10) n.y = -10;
    });

    // Connect nodes
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

    // Orbit rings
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

    // Shapes
    shapes.forEach(shape => {
      shape.rotation += shape.rotationSpeed;

      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);

      ctx.strokeStyle = 'rgba(255, 248, 251, 0.1)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();

      if (shape.type === 0) {
        // triangle
        ctx.moveTo(0, -shape.size);
        ctx.lineTo(shape.size * 0.866, shape.size * 0.5);
        ctx.lineTo(-shape.size * 0.866, shape.size * 0.5);
        ctx.closePath();
      } else if (shape.type === 1) {
        // square
        ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
      } else {
        // hexagon
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

    // Node dots
    nodes.forEach(n => {
      const pulse = 0.7 + 0.3 * Math.sin(t * n.pulseSpeed + n.phase);
      const r = 0.8 + pulse * 0.6;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 248, 251, ${0.15 + 0.1 * pulse})`;
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    t += 0.5;
    requestAnimationFrame(drawSystem);
  };

  drawSystem();
});
