function copyToClipboard(text, el) {
    navigator.clipboard.writeText(text).then(() => {
        const original = el.innerHTML;
        el.innerHTML = text + ' <i class="fas fa-check" style="color:#00b894"></i>';
        setTimeout(() => { el.innerHTML = original; }, 2000);
        showToast('Copied!', 'success');
    }).catch(() => {
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
    const msg = document.getElementById('toast-message');
    const icon = toast.querySelector('.toast-icon i');

    if (!toast) return;

    msg.textContent = message;

    const configs = {
        success: { icon: 'fa-check-circle', color: '#00b894' },
        error: { icon: 'fa-times-circle', color: '#e17055' },
        warning: { icon: 'fa-exclamation-triangle', color: '#fdcb6e' },
        info: { icon: 'fa-info-circle', color: '#74b9ff' }
    };

    const cfg = configs[type] || configs.info;
    if (icon) {
        icon.className = 'fas ' + cfg.icon;
        icon.style.color = cfg.color;
    }

    toast.classList.add('active');

    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}
