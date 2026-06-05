/**
 * Stats Counter Animation
 * Animate numbers counting up when stats section enters viewport.
 */
(function() {
  'use strict';

  const statsMini = document.getElementById('stats-mini');
  if (!statsMini) return;

  const statNumbers = statsMini.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length === 0) return;

  let animated = false;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1500; // ms
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = Math.floor(easedProgress * target);

      el.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  function startAnimation() {
    if (animated) return;
    animated = true;

    for (const el of statNumbers) {
      animateCounter(el);
    }
  }

  // Use Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          startAnimation();
          observer.unobserve(statsMini);
          break;
        }
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(statsMini);
})();
