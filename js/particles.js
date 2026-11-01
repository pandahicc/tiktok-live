/**
 * Hero Canvas Particle Network
 * Animated particles with connecting lines and mouse interaction.
 */
(function() {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Configuration
  const config = {
    particleCount: 80,
    connectionDistance: 150,
    particleRadius: 2,
    particleSpeed: 0.5,
    mouseRadius: 120,
    color: '99, 102, 241', // Indigo
    colorSecondary: '139, 92, 246', // Purple
    lineOpacity: 0.15,
    particleOpacity: 0.6
  };

  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, active: false };
  let animationId;

  // Particle class
  class Particle {
    constructor() {
      this.reset();
      // Random start position to avoid clustering
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * config.particleSpeed;
      this.vy = (Math.random() - 0.5) * config.particleSpeed;
      this.radius = config.particleRadius * (0.5 + Math.random() * 0.5);
      // Randomly choose between primary and secondary color
      this.color = Math.random() > 0.7 ? config.colorSecondary : config.color;
    }

    update() {
      // Mouse interaction - attract particles to cursor
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.mouseRadius && dist > 0) {
          const force = (config.mouseRadius - dist) / config.mouseRadius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.05;
          this.vy += Math.sin(angle) * force * 0.05;
        }
      }

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Clamp position
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));

      // Speed dampening
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > config.particleSpeed * 1.5) {
        this.vx = (this.vx / speed) * config.particleSpeed * 1.2;
        this.vy = (this.vy / speed) * config.particleSpeed * 1.2;
      }
      if (speed < config.particleSpeed * 0.3) {
        this.vx += (Math.random() - 0.5) * 0.02;
        this.vy += (Math.random() - 0.5) * 0.02;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${config.particleOpacity})`;
      ctx.fill();
    }
  }

  // Create particles
  function createParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Draw connections between particles
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDistance) {
          const opacity = (1 - dist / config.connectionDistance) * config.lineOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${config.color}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections first (behind particles)
    drawConnections();

    // Update and draw particles
    for (const p of particles) {
      p.update();
      p.draw();
    }

    animationId = requestAnimationFrame(animate);
  }

  // Handle resize
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Adjust particle count for screen size
    const density = Math.min(1, (width * height) / (1920 * 1080));
    const count = Math.max(30, Math.floor(config.particleCount * density));

    if (particles.length !== count) {
      config.particleCount = count;
      createParticles();
    }
  }

  // Mouse events
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  // Touch events for mobile
  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }

  function onTouchEnd() {
    mouse.active = false;
  }

  // Init
  function init() {
    resize();
    createParticles();

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    animate();
  }

  // Start if not prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    init();
  } else {
    // Show static particles for accessibility
    resize();
    createParticles();
    for (const p of particles) { p.draw(); }
  }
})();
