document.addEventListener('DOMContentLoaded', () => {
    console.log('⚽ TurfBook App Initialized');
    console.log('💰 Currency: PKR | Payment: Easypaisa, JazzCash, Bank');
    console.log('📋 Slots: ₨1,000 / ₨1,500 / ₨2,000 / ₨2,000');

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const t = document.querySelector(this.getAttribute('href'));
            if (t) t.scrollIntoView({behavior:'smooth',block:'start'});
        });
    });

    document.getElementById('booking-modal').addEventListener('click', e => {
        if (e.target === e.currentTarget) closeBookingModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeBookingModal();
    });

    addTypingCursor();
    animateCounters();
    addInteractiveEffects();
});

function addTypingCursor() {
    const h = document.querySelector('.hero-highlight');
    if (!h) return;
    const c = document.createElement('span');
    c.style.cssText = 'display:inline-block;width:3px;height:1em;background:var(--primary);margin-left:5px;animation:blink 1s step-end infinite;vertical-align:text-bottom;';
    if (!document.getElementById('blink-style')) {
        const s = document.createElement('style');
        s.id = 'blink-style';
        s.textContent = '@keyframes blink{50%{opacity:0}}';
        document.head.appendChild(s);
    }
    h.appendChild(c);
    setTimeout(() => { c.style.animation='none'; c.style.opacity='0'; c.style.transition='opacity 0.5s'; }, 3000);
}

function animateCounters() {
    document.querySelectorAll('.slot-price .amount').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        if (!target) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    let start = null;
                    function step(ts) {
                        if (!start) start = ts;
                        const p = Math.min((ts-start)/1500, 1);
                        const eased = 1-Math.pow(1-p,3);
                        el.textContent = Math.floor(eased*target).toLocaleString();
                        if (p<1) requestAnimationFrame(step);
                        else el.textContent = target.toLocaleString();
                    }
                    requestAnimationFrame(step);
                    observer.unobserve(e.target);
                }
            });
        }, {threshold:0.5});
        observer.observe(el);
    });
}

function addInteractiveEffects() {
    const cta = document.querySelector('.cta-button');
    if (cta) {
        cta.addEventListener('mousemove', e => {
            const r = cta.getBoundingClientRect();
            cta.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.1}px,${(e.clientY-r.top-r.height/2)*0.1}px)`;
        });
        cta.addEventListener('mouseleave', () => cta.style.transform = 'translate(0,0)');
    }
}
