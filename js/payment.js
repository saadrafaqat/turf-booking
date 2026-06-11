// Toast notification system & utility functions

function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        const orig = element.innerHTML;
        element.innerHTML = text + ' <i class="fas fa-check" style="color:#00b894"></i>';
        setTimeout(()=>element.innerHTML=orig, 2500);
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const ta=document.createElement('textarea');
        ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
        document.body.appendChild(ta);ta.select();
        document.execCommand('copy');ta.remove();
        showToast('Copied!','success');
    });
}

function showToast(message, type='info') {
    const t=document.getElementById('toast');
    const m=document.getElementById('toast-message');
    const i=t.querySelector('.toast-icon i');
    
    if(!t)return;
    m.textContent=message;
    
    const colors={ success:'#00b894', error:'#e17055', warning:'#fdcb6e', info:'#74b9ff' };
    const icons={ success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
    
    if(i)i.className='fas '+(icons[type]||icons.info);
    if(i)i.style.color=colors[type]||colors.info;
    t.style.borderColor=colors[type]||colors.info;
    
    t.classList.add('active');
    clearTimeout(window._toastTimer);
    window._toastTimer=setTimeout(()=>t.classList.remove('active'),4200);
}
