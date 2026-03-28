/**
 * NewHack Presentation Controller
 * Handles slide navigation, animations, and counter animation
 */

(function () {
    'use strict';

    // ===== DOM =====
    const slides = document.querySelectorAll('.slide');
    const progressFill = document.getElementById('progressFill');
    const slideCounter = document.getElementById('slideCounter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    const totalSlides = slides.length;
    let currentSlide = 0;
    let isTransitioning = false;

    // ===== HELPERS =====
    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function updateCounter() {
        slideCounter.textContent = `${pad(currentSlide + 1)} / ${pad(totalSlides)}`;
    }

    function updateProgress() {
        const pct = ((currentSlide + 1) / totalSlides) * 100;
        progressFill.style.width = pct + '%';
    }

    // ===== ANIMATE IN =====
    function triggerAnimations(slideEl) {
        const items = slideEl.querySelectorAll('.animate-in');
        items.forEach((item) => {
            item.classList.remove('visible');
            const delay = parseInt(item.dataset.delay || 0, 10);
            setTimeout(() => item.classList.add('visible'), delay);
        });
    }

    function clearAnimations(slideEl) {
        slideEl.querySelectorAll('.animate-in').forEach((item) => {
            item.classList.remove('visible');
        });
    }

    // ===== COUNTING ANIMATION =====
    function animateCounters(slideEl) {
        const counters = slideEl.querySelectorAll('[data-count]');
        counters.forEach((el) => {
            const target = parseInt(el.dataset.count, 10);
            const duration = 1500;
            const start = performance.now();

            function step(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // ease out quad
                const eased = 1 - (1 - progress) * (1 - progress);
                el.textContent = Math.round(target * eased);
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
        });
    }

    // ===== GO TO SLIDE =====
    function goToSlide(index) {
        if (isTransitioning || index === currentSlide || index < 0 || index >= totalSlides) return;

        isTransitioning = true;

        const oldSlide = slides[currentSlide];
        const newSlide = slides[index];

        clearAnimations(oldSlide);
        oldSlide.classList.remove('active');

        newSlide.classList.add('active');
        triggerAnimations(newSlide);
        animateCounters(newSlide);

        currentSlide = index;
        updateCounter();
        updateProgress();

        // unlock after transition
        setTimeout(() => { isTransitioning = false; }, 700);
    }

    function nextSlide() {
        if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
    }
    function prevSlide() {
        if (currentSlide > 0) goToSlide(currentSlide - 1);
    }

    // ===== KEYBOARD =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'Home') {
            e.preventDefault();
            goToSlide(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            goToSlide(totalSlides - 1);
        }
    });

    // ===== CLICK NAV =====
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // ===== TOUCH SWIPE =====
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // ===== MOUSE WHEEL =====
    let wheelDebounce = false;
    document.addEventListener('wheel', (e) => {
        if (wheelDebounce) return;
        wheelDebounce = true;
        if (e.deltaY > 0) nextSlide();
        else prevSlide();
        setTimeout(() => { wheelDebounce = false; }, 800);
    }, { passive: true });

    // ===== INIT =====
    updateCounter();
    updateProgress();
    // Trigger animations on the first slide
    setTimeout(() => triggerAnimations(slides[0]), 100);

})();
