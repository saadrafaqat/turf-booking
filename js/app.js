document.addEventListener('DOMContentLoaded', function() {
    initAnimations();
    initBooking();
    initModalEvents();
    animateCounters();
    createParticles();
});

function animateCounters() {
    const amounts = document.querySelectorAll('.amount');
    amounts.forEach(el => {
        const target = parseInt(el.getAttribute('data-target')) || 0;
        let current = 0;
        const increment = Math.ceil(target / 60);
        const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            el.textContent = current.toLocaleString();
            if (current >= target) clearInterval(timer);
        }, 25);
    });
}

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `
            position: fixed;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(108, 92, 231, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            animation: floatParticle ${Math.random() * 10 + 8}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
            pointer-events: none;
            z-index: 0;
        `;
        container.appendChild(p);
    }
}
