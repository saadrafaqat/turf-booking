function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        p.style.left = Math.random() * 100 + '%';
        p.style.width = p.style.height = Math.random() * 4 + 1 + 'px';
        p.style.animationDuration = Math.random() * 15 + 10 + 's';
        p.style.animationDelay = Math.random() * 10 + 's';
        p.style.opacity = Math.random() * 0.5 + 0.1;
        container.appendChild(p);
    }
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.fade-in-up,.fade-in-left,.fade-in-right').forEach(el => observer.observe(el));
}

function initNavbarScroll() {
    window.addEventListener('scroll', () => {
        document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
    });
}

function createConfetti() {
    const c = document.getElementById('confetti');
    c.innerHTML = '';
    const colors = ['#6c5ce7','#00cec9','#fd79a8','#fdcb6e','#00b894','#3aaa35','#e3272d','#f39c12'];
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.classList.add('confetti-piece');
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--x', (Math.random()-0.5)*350+'px');
        p.style.setProperty('--y', (Math.random()-0.5)*350+'px');
        p.style.animationDelay = Math.random()*0.5+'s';
        p.style.width = Math.random()*10+4+'px';
        p.style.height = Math.random()*10+4+'px';
        c.appendChild(p);
    }
}

function addRippleEffect() {
    document.querySelectorAll('.book-button,.cta-button,.next-button,.pay-button,.download-button,.share-button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            Object.assign(ripple.style, {
                width: size+'px', height: size+'px',
                left: e.clientX-rect.left-size/2+'px',
                top: e.clientY-rect.top-size/2+'px',
                position: 'absolute', borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                transform: 'scale(0)', animation: 'ripple 0.6s ease-out',
                pointerEvents: 'none'
            });
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
    if (!document.getElementById('ripple-style')) {
        const s = document.createElement('style');
        s.id = 'ripple-style';
        s.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
        document.head.appendChild(s);
    }
}

function addTiltEffect() {
    document.querySelectorAll('.slot-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const rX = (e.clientY-r.top-r.height/2)/25;
            const rY = (r.width/2-(e.clientX-r.left))/25;
            card.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

function animatePriceBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.bar-fill').forEach(bar => {
                    const w = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => bar.style.width = w, 300);
                });
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    const pc = document.querySelector('.price-comparison');
    if (pc) observer.observe(pc);
}

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initScrollAnimations();
    initNavbarScroll();
    addRippleEffect();
    addTiltEffect();
    animatePriceBars();
});
