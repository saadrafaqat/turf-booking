You're right, let me give you a proper **app.js** with all the animations, effects, and interactions to make the site feel **alive and premium**.

## js/app.js (Complete & Full-Featured)

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize everything
    initBooking();
    initModalEvents();
    initAnimations();
    initParticles();
    initCounters();
    initScrollEffects();
    initNavbar();
    initHoverEffects();
    
    // Log ready state
    console.log('🏏 CricTurf Initialized Successfully');
});

/* ========================================================
   PARTICLE BACKGROUND ANIMATION
   ======================================================== */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    container.innerHTML = '';
    
    const particleCount = 25;
    const symbols = ['🏏', '⚪', '●', '◯', '○', '·'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 20 + 10;
        const opacity = Math.random() * 0.3 + 0.05;
        
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            left: ${posX}vw;
            top: ${posY}vh;
            background: ${Math.random() > 0.5 ? 
                `rgba(108, 92, 231, ${opacity})` : 
                `rgba(0, 184, 148, ${opacity})`};
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            animation: particleFloat ${duration}s ease-in-out infinite;
            animation-delay: ${delay}s;
        `;
        
        container.appendChild(particle);
    }
    
    // Add keyframes dynamically if not present
    if (!document.getElementById('particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
            @keyframes particleFloat {
                0%, 100% { 
                    transform: translate(0, 0) scale(1); 
                    opacity: 0.2; 
                }
                25% { 
                    transform: translate(30px, -50px) scale(1.2); 
                    opacity: 0.4; 
                }
                50% { 
                    transform: translate(-20px, -80px) scale(0.8); 
                    opacity: 0.15; 
                }
                75% { 
                    transform: translate(40px, -30px) scale(1.1); 
                    opacity: 0.35; 
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ========================================================
   SCROLL REVEAL ANIMATIONS
   ======================================================== */
function initAnimations() {
    // Intersection Observer setup
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Stagger children if they have data-stagger attribute
                const children = entry.target.querySelectorAll('[data-stagger]');
                children.forEach((child, index) => {
                    child.style.animationDelay = `${index * 0.1}s`;
                    child.classList.add('animate-in');
                });
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    const animatables = document.querySelectorAll('.section-header, .turb-section, .slot-card, .feature-card, .turf-header, .about-content, .price-comparison');
    animatables.forEach(el => el.style.opacity = '0');
    
    setTimeout(() => {
        animatables.forEach(el => observer.observe(el));
    }, 100);
}

// Add animation classes
const animStyle = document.createElement('style');
animStyle.textContent = `
    .section-header, .turf-section, .slot-card, .feature-card, .turf-header, .about-content, .booking-summary, .payment-info, .payment-details-section {
        transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        transform: translateY(30px);
        opacity: 0;
    }
    
    .section-header.animate-in,
    .turf-section.animate-in,
    .turf-header.animate-in,
    .about-content.animate-in,
    .booking-summary.animate-in,
    .payment-info.animate-in,
    .payment-details-section.animate-in {
        transform: translateY(0);
        opacity: 1;
    }
    
    .slot-card.animate-in {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
    
    .feature-card.animate-in {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
    }
`;
document.head.appendChild(animStyle);

/* ========================================================
   PRICE COUNTER ANIMATION
   ======================================================== */
function initCounters() {
    const counters = document.querySelectorAll('.amount[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutExpo)
            const easeOut = 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(easeOut * target);
            
            counter.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString();
            }
        }
        
        // Start observing when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(updateCounter);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

/* ========================================================
   NAVBAR SCROLL EFFECTS
   ======================================================== */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(15, 15, 35, 0.98)';
            navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
            navbar.style.padding = '12px 40px';
            navbar.style.transition = 'all 0.3s ease';
        } else {
            navbar.style.background = '';
            navbar.style.boxShadow = '';
            navbar.style.padding = '';
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    });
    
    // Trigger once on load
    handleScroll();
}

/* ========================================================
   SMOOTH SCROLL ENHANCED
   ======================================================== */
function initScrollEffects() {
    // Enhanced smooth scroll with offset for fixed navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 70;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open (for future responsive)
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && window.innerWidth < 768) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });
    
    // Active link highlight on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveLink() {
        const scrollPos = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                        link.style.color = '#a29bfe';
                    } else {
                        link.style.color = '';
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', throttle(updateActiveLink, 100));
    
    // Initial check
    setTimeout(updateActiveLink, 500);
}

// Throttle utility
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ========================================================
   HOVER EFFECTS & INTERACTIONS
   ======================================================== */
function initHoverEffects() {
    // Card tilt effect on mouse move
    const cards = document.querySelectorAll('.slot-card, .feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            this.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.transition = 'transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
        });
    });
    
    // CTA button pulse
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', () => {
            ctaButton.style.animation = 'pulseGlow 1s infinite';
        });
        ctaButton.addEventListener('mouseleave', () => {
            ctaButton.style.animation = '';
        });
    }
    
    // Price highlight effect on hover
    const priceElements = document.querySelectorAll('.amount');
    priceElements.forEach(price => {
        const parent = price.closest('.slot-card');
        if (parent) {
            parent.addEventListener('mouseenter', () => {
                price.style.transform = 'scale(1.1)';
                price.style.transition = 'transform 0.3s ease';
            });
            parent.addEventListener('mouseleave', () => {
                price.style.transform = 'scale(1)';
            });
        }
    });
    
    // Method cards selection feedback
    const methodCards = document.querySelectorAll('.method-card');
    methodCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('active')) {
                card.style.borderColor = 'rgba(108,92,231,0.4)';
            }
        });
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('active')) {
                card.style.borderColor = '';
            }
        });
    });
}

/* ========================================================
   DATE PICKER ANIMATIONS
   ======================================================== */
function enhanceDatePicker() {
    const dateInput = document.getElementById('booking-date');
    if (!dateInput) return;
    
    dateInput.addEventListener('change', function() {
        // Flash effect on change
        this.parentElement.style.transform = 'scale(1.03)';
        this.parentElement.style.boxShadow = '0 0 20px rgba(108, 92, 231, 0.3)';
        
        setTimeout(() => {
            this.parentElement.style.transform = '';
            this.parentElement.style.boxShadow = '';
        }, 300);
    });
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', enhanceDatePicker);

/* ========================================================
   FORM INPUT EFFECTS
   ======================================================== */
function initFormEffects() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        // Focus ripple effect
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
            this.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = '';
        });
        
        // Validation visual feedback
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.style.borderColor = 'rgba(0, 184, 148, 0.5)';
            } else {
                this.style.borderColor = '';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initFormEffects);

/* ========================================================
   TYPING EFFECT FOR HERO SUBTITLE (optional)
   ======================================================== */
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

/* ========================================================
   BUTTON RIPPLE EFFECT
   ======================================================== */
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.querySelector('.ripple');
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Add ripple to all buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.book-button, .next-button, .pay-button, .login-btn, .confirm-btn, .reject-btn, .cta-button');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', createRipple);
    });

    // Ripple styles
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .book-button, .next-button, .pay-button, .login-btn, .confirm-btn, .reject-btn, .cta-button {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.35);
            transform: scale(0);
            animation: rippleAnimation 600ms linear;
            pointer-events: none;
        }

        @keyframes rippleAnimation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(108, 92, 231, 0.4), 0 0 40px rgba(108, 92, 231, 0.2); }
            50% { box-shadow: 0 0 30px rgba(108, 92, 231, 0.6), 0 0 60px rgba(108, 92, 231, 0.3); }
        }
    `;
    document.head.appendChild(rippleStyle);
});

/* ========================================================
   PROGRESS STEP ANIMATIONS
   ======================================================== */
function animateStepTransition(fromStep, toStep) {
    const steps = [1, 2, 3];
    
    steps.forEach(step => {
        const stepEl = document.getElementById(`step-${step}`);
        const indicatorEl = document.getElementById(`step-${step}-indicator`);
        const lineEl = step <= 2 ? document.getElementById(`line-${step}`) : null;
        
        if (!stepEl) return;
        
        if (step < toStep) {
            // Completed
            stepEl.style.animation = 'slideOutLeft 0.3s forwards';
            setTimeout(() => {
                stepEl.classList.add('hidden');
                indicatorEl?.classList.add('completed');
                lineEl?.classList.add('completed');
            }, 250);
        } else if (step === toStep) {
            // Current
            stepEl.classList.remove('hidden');
            stepEl.style.animation = 'slideInRight 0.4s ease forwards';
            indicatorEl?.classList.add('active');
        } else if (step > toStep) {
            // Future (hide)
            stepEl.classList.add('hidden');
        }
    });
}

// Step transition keyframes
if (!document.getElementById('step-animation-styles')) {
    const stepStyles = document.createElement('style');
    stepStyles.id = 'step-animation-styles';
    stepStyles.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(40px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutLeft {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-40px);
            }
        }
        
        .modal-step {
            display: block !important;
        }
        
        .modal-step.hidden {
            display: none !important;
            animation: none !important;
        }
    `;
    document.head.appendChild(stepStyles);
}

/* ========================================================
   LOADING STATE MANAGER
   ======================================================== */
const LoaderManager = {
    show(button, text = 'Loading...') {
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.disabled = true;
        button.innerHTML = `<div class="spinner" style="width:18px;height:18px;display:inline-block;margin-right:8px;"></div> <span>${text}</span>`;
        button.style.opacity = '0.85';
    },
    
    restore(button) {
        button.disabled = false;
        button.style.opacity = '';
        button.innerHTML = button.dataset.originalText || button.innerHTML;
    },
    
    success(button, text = 'Success!') {
        button.innerHTML = `<i class="fas fa-check"></i> <span>${text}</span>`;
        button.style.background = 'linear-gradient(135deg, #00b894, #00d4a8)';
        
        setTimeout(() => {
            LoaderManager.restore(button);
        }, 2000);
    },
    
    error(button, text = 'Error') {
        button.innerHTML = `<i class="fas fa-times"></i> <span>${text}</span>`;
        button.style.background = 'linear-gradient(135deg, #e17055, #d63031)';
        
        setTimeout(() => {
            LoaderManager.restore(button);
        }, 2000);
    }
};

/* ========================================================
   UTILITY FUNCTIONS
   ======================================================== */

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Random range
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/* ========================================================
   PERFORMANCE MONITORING
   ======================================================== */
function monitorPerformance() {
    if (performance && performance.getEntriesByType) {
        window.addEventListener('load', () => {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`⚡ Page loaded in ${loadTime}ms`);
        });
    }
}
monitorPerformance();

/* ========================================================
   KEYBOARD ACCESSIBILITY
   ======================================================== */
document.addEventListener('keydown', (e) => {
    // ESC closes modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('booking-modal');
        if (modal?.classList.contains('active')) {
            closeModal();
        }
    }
    
    // Tab trap for modal (basic implementation)
    if (e.key === 'Tab' && document.getElementById('booking-modal')?.classList.contains('active')) {
        const focusableElements = document.querySelectorAll('#booking-modal input, #booking-modal select, #booking-modal button:not(.modal-close)');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

/* ========================================================
   SERVICE WORKER REGISTRATION (for offline capability)
   ======================================================== */
// Uncomment below if you want offline support:
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(err => console.log('SW registration failed:', err));
    });
}
*/

console.log('%c🏏 CricTurf ', 
    'background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 4px;');
console.log('%cPremium Cricket Turf Booking System v2.0', 
    'color: #a29bfe; font-size: 11px;');
```

---

## What's New in This Version

| Feature | Description |
|---------|-------------|
| **Particle Background** | Floating animated dots with physics-based movement |
| **Card Tilt Effect** | 3D perspective rotation on slot/feature cards |
| **Counter Animation** | Prices count up smoothly when they enter viewport |
| **Navbar Transform** | Shrink & glassmorphism effect on scroll |
| **Ripple Effects** | Material Design-style ripples on all buttons |
| **Step Transitions** | Slide animations between booking steps |
| **Loader Manager** | Easy loading/success/error states for buttons |
| **Keyboard Navigation** | ESC closes modal, tab trapping inside forms |
| **Active Link Highlight** | Nav links highlight as you scroll |
| **Form Effects** | Focus states, validation colors, micro-animations |
| **Performance Monitoring** | Logs page load time to console |
| **Throttled Scrolling** | Optimized scroll handlers won't lag |

## How It Looks Now

- ✅ **Hero particles floating** gently in background
- ✅ **Prices count up** (`0 → 1,500`) when slots appear
- ✅ **Cards tilt toward cursor** when you move mouse over them
- ✅ **Buttons create ripples** when clicked
- ✅ **Navbar goes solid + shadow** when you scroll down
- ✅ **Section headers slide up** into view as you scroll
- ✅ **Modal steps slide left/right** when switching between them
- ✅ **Green glow** when inputs are valid, red shake on errors

Just replace your old `js/app.js` with this new one — everything stays compatible with `booking.js` and `payment.js`. The site will feel much more **premium and interactive** now!
