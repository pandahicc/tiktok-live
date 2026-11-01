/**
 * Main JavaScript
 * Navbar scroll, mobile menu, scroll reveals, pricing toggle, smooth scroll.
 */
(function() {
  'use strict';

  // ── Navbar scroll effect ──────────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  function handleScroll() {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ── Mobile hamburger menu ─────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('open');
      this.setAttribute('aria-expanded',
        this.classList.contains('active').toString()
      );
    });

    // Close menu on link click
    const links = navLinks.querySelectorAll('a');
    for (const link of links) {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    }
  }

  // ── Smooth scroll for anchor links ────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight + 16;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Scroll-triggered reveal animations ────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Stagger the start of observing for cards within grids
    for (const el of revealElements) {
      revealObserver.observe(el);
    }
  }

  // ── Pricing toggle (Monthly / Yearly) ─────────────────────────
  const billingSwitch = document.getElementById('billing-switch');
  const toggleLabels = document.querySelectorAll('.toggle-label');
  const monthlyCard = document.querySelector('.pricing-card.featured[data-plan="monthly"]');
  const yearlyCard = document.querySelector('.pricing-card.featured[data-plan="yearly"]');

  if (billingSwitch && monthlyCard && yearlyCard) {
    let currentPeriod = 'monthly';

    function updatePricing() {
      if (currentPeriod === 'monthly') {
        monthlyCard.style.display = '';
        yearlyCard.style.display = 'none';
        billingSwitch.classList.remove('yearly');
      } else {
        monthlyCard.style.display = 'none';
        yearlyCard.style.display = '';
        billingSwitch.classList.add('yearly');
      }

      // Update toggle labels
      for (const label of toggleLabels) {
        if (label.dataset.period === currentPeriod) {
          label.classList.add('active');
        } else {
          label.classList.remove('active');
        }
      }
    }

    billingSwitch.addEventListener('click', () => {
      currentPeriod = currentPeriod === 'monthly' ? 'yearly' : 'monthly';
      updatePricing();
    });

    // Click on label also toggles
    for (const label of toggleLabels) {
      label.addEventListener('click', () => {
        const period = label.dataset.period;
        if (period && period !== currentPeriod) {
          currentPeriod = period;
          updatePricing();
        }
      });
    }

    // Init
    updatePricing();
  }

  // ── Screenshots Carousel ──────────────────────────────────────
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const carousel = document.querySelector('.carousel');

  if (track && dotsContainer && carousel) {
    const slides = track.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;

    if (totalSlides <= 1) {
      carousel.classList.add('single');
    } else {
      let currentIndex = 0;
      let isDragging = false;
      let startX = 0;
      let startTranslate = 0;
      let autoPlayTimer = null;

      // Create dots
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      }

      const dots = dotsContainer.querySelectorAll('.carousel-dot');

      function updateCarousel() {
        track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
        for (let i = 0; i < dots.length; i++) {
          dots[i].classList.toggle('active', i === currentIndex);
        }
      }

      function goToSlide(index) {
        currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
        updateCarousel();
        resetAutoPlay();
      }

      function nextSlide() { goToSlide(currentIndex + 1); }
      function prevSlide() { goToSlide(currentIndex - 1); }

      function resetAutoPlay() {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = setTimeout(nextSlide, 6000);
      }

      // Arrow buttons
      const prevBtn = carousel.querySelector('.carousel-prev');
      const nextBtn = carousel.querySelector('.carousel-next');
      if (prevBtn) prevBtn.addEventListener('click', prevSlide);
      if (nextBtn) nextBtn.addEventListener('click', nextSlide);

      // Touch / drag events
      track.addEventListener('mousedown', onDragStart);
      track.addEventListener('touchstart', onDragStart, { passive: true });
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('touchmove', onDragMove, { passive: true });
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchend', onDragEnd);

      function onDragStart(e) {
        isDragging = true;
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startTranslate = -currentIndex * track.parentElement.offsetWidth;
        track.style.transition = 'none';
        clearTimeout(autoPlayTimer);
      }

      function onDragMove(e) {
        if (!isDragging) return;
        const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const diff = currentX - startX;
        track.style.transform = 'translateX(' + (startTranslate + diff) + 'px)';
      }

      function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = '';
        const currentTranslate = parseFloat(
          track.style.transform.replace(/[^-\d.]/g, '') || 0
        );
        const slideWidth = track.parentElement.offsetWidth;
        currentIndex = Math.round(-currentTranslate / slideWidth);
        goToSlide(currentIndex);
      }

      // Keyboard navigation
      document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') { prevSlide(); }
        if (e.key === 'ArrowRight') { nextSlide(); }
      });

      // Init
      updateCarousel();
      resetAutoPlay();
    }
  }

  // ── Lightbox ─────────────────────────────────────────────────
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
  const lightboxBackdrop = lightbox ? lightbox.querySelector('.lightbox-backdrop') : null;

  if (lightbox && lightboxImg && track) {
    const slideImages = track.querySelectorAll('.slide-image img');
    let lightboxIndex = 0;

    function openLightbox(index) {
      if (!slideImages[index]) return;
      lightboxIndex = index;
      lightboxImg.src = slideImages[lightboxIndex].src;
      lightboxImg.alt = slideImages[lightboxIndex].alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function lightboxPrevSlide() {
      if (!slideImages.length) return;
      lightboxIndex = (lightboxIndex - 1 + slideImages.length) % slideImages.length;
      lightboxImg.src = slideImages[lightboxIndex].src;
      lightboxImg.alt = slideImages[lightboxIndex].alt;
    }

    function lightboxNextSlide() {
      if (!slideImages.length) return;
      lightboxIndex = (lightboxIndex + 1) % slideImages.length;
      lightboxImg.src = slideImages[lightboxIndex].src;
      lightboxImg.alt = slideImages[lightboxIndex].alt;
    }

    // Click on carousel image → open lightbox
    for (let i = 0; i < slideImages.length; i++) {
      slideImages[i].addEventListener('click', function() {
        openLightbox(i);
      });
    }

    // Close buttons
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

    // Lightbox arrow buttons
    if (lightboxPrev) lightboxPrev.addEventListener('click', lightboxPrevSlide);
    if (lightboxNext) lightboxNext.addEventListener('click', lightboxNextSlide);

    // Keyboard: ESC to close, arrows to navigate
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') { closeLightbox(); }
      if (e.key === 'ArrowLeft') { lightboxPrevSlide(); }
      if (e.key === 'ArrowRight') { lightboxNextSlide(); }
    });
  }

  // ── Initial scroll check ──────────────────────────────────────
  handleScroll();
})();
