// ===== MAIN APP INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏟️ TurfBook App Initialized');
    console.log('💰 Currency: PKR (Pakistani Rupee)');
    console.log('📋 Slots: 4 (₨1,000 / ₨1,500 / ₨2,000 / ₨2,000)');
    console.log('📌 Configure Stripe keys in js/payment.js and functions/api/');

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Close modal on overlay click
    document.getElementById('booking-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeBookingModal();
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBookingModal();
    });

    addTypingCursor();
    addInteractiveEffects();
    animateCounters();
});

// ===== TYPING CURSOR =====
function addTypingCursor() {
    const highlight = document.querySelector('.hero-highlight');
    if (highlight) {
        const cursor = document.createElement('span');
        cursor.style.cssText = `
            display: inline-block; width: 3px; height: 1em;
            background: var(--primary); margin-left: 5px;
            animation: blink 1s step-end infinite;
            vertical-align: text-bottom;
        `;
        if (!document.getElementById('blink-style')) {
            const style = document.createElement('style');
            style.id = 'blink-style';
            style.textContent = `@keyframes blink { 50% { opacity: 0; } }`;
            document.head.appendChild(style);
        }
        highlight.appendChild(cursor);
        setTimeout(() => {
            cursor.style.animation = 'none';
            cursor.style.opacity = '0';
            cursor.style.transition = 'opacity 0.5s';
        }, 3000);
    }
}

// ===== INTERACTIVE EFFECTS =====
function addInteractiveEffects() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mousemove', (e) => {
            const rect = ctaButton.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            ctaButton.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        ctaButton.addEventListener('mouseleave', () => {
            ctaButton.style.transform = 'translate(0, 0)';
        });
    }
}

// ===== COUNTER ANIMATION FOR PRICES =====
function animateCounters() {
    document.querySelectorAll('.slot-price .amount').forEach((el) => {
        const target = parseInt(el.getAttribute('data-target'));
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        let startTime = null;
                        const duration = 1500;

                        function step(timestamp) {
                            if (!startTime) startTime = timestamp;
                            const progress = Math.min((timestamp - startTime) / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            el.textContent = Math.floor(eased * target).toLocaleString();
                            if (progress < 1) {
                                requestAnimationFrame(step);
                            } else {
                                el.textContent = target.toLocaleString();
                            }
                        }

                        requestAnimationFrame(step);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(el);
    });
}
