function copyToClipboard(text, el) {
    navigator.clipboard.writeText(text).then(() => {
        const original = el.innerHTML;
        el.innerHTML = `${text} <i class="fas fa-check" style="color:#00b894"></i>`;
        setTimeout(() => { el.innerHTML = original; }, 2000);
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied!', 'success');
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('.toast-icon i');

    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;

    // Icon and color based on type
    const configs = {
        success: { icon: 'fa-check-circle', color: '#00b894', bg: 'rgba(0,184,148,0.15)' },
        error:   { icon: 'fa-times-circle', color: '#e17055', bg: 'rgba(225,112,85,0.15)' },
        warning: { icon: 'fa-exclamation-triangle', color: '#fdcb6e', bg: 'rgba(253,203,110,0.15)' },
        info:    { icon: 'fa-info-circle', color: '#74b9ff', bg: 'rgba(116,185,255,0.15)' }
    };

    const cfg = configs[type] || configs.info;
    if (toastIcon) {
        toastIcon.className = `fas ${cfg.icon}`;
        toastIcon.style.color = cfg.color;
    }
    toast.style.background = cfg.bg;
    toast.style.borderColor = cfg.color;

    toast.classList.add('active');

    // Auto hide
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// Toast close button
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('toast-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('toast').classList.remove('active');
        });
    }
});
