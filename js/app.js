// Main Application Entry Point
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏏 [CricTurf] Initializing application...');
    
    // Initialize core modules
    if (typeof initBooking === 'function') initBooking();
    if (typeof initModalEvents === 'function') initModalEvents();
    
    // Set today's date
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today;
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 70;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    console.log('[CricTurf] Ready!');
});
