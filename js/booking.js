// Configuration
const TURFS = {
    1: {
        name: 'Turf 1 - Premium',
        slots: [
            { id: 1, time: '6:00 AM - 8:00 AM', label: 'Morning', icon: 'fa-cloud-sun', bgClass: 'icon-morning', price: 1500 },
            { id: 2, time: '10:00 AM - 12:00 PM', label: 'Late Morning', icon: 'fa-sun', bgClass: 'icon-afternoon', price: 1800 },
            { id: 3, time: '4:00 PM - 6:00 PM', label: 'Evening', icon: 'fa-cloud-moon', bgClass: 'icon-evening', price: 2500 },
            { id: 4, time: '8:00 PM - 10:00 PM', label: 'Night', icon: 'fa-moon', bgClass: 'icon-night', price: 3000 }
        ]
    },
    2: {
        name: 'Turf 2 - Standard',
        slots: [
            { id: 1, time: '7:00 AM - 9:00 AM', label: 'Morning', icon: 'fa-cloud-sun', bgClass: 'icon-morning', price: 1000 },
            { id: 2, time: '2:00 PM - 4:00 PM', label: 'Afternoon', icon: 'fa-sun', bgClass: 'icon-afternoon', price: 1200 },
            { id: 3, time: '6:00 PM - 8:00 PM', label: 'Evening', icon: 'fa-cloud-moon', bgClass: 'icon-evening', price: 1800 },
            { id: 4, time: '9:00 PM - 11:00 PM', label: 'Night', icon: 'fa-moon', bgClass: 'icon-night', price: 2200 }
        ]
    }
};

// Global state
const BookingState = {
    currentTurf: null,
    currentSlot: null,
    currentTime: '',
    currentPrice: 0,
    currentDate: '',
    selectedMethod: 'easypaisa',
    userDetails: {},
    slotStates: {}
};

function initBooking() {
    renderAllSlots();
    setupDatePicker();
    loadSlotStatesFromAPI();
    
    console.log('[Booking] Initialized with', Object.keys(TURFS).length, 'turfs');
}

function renderAllSlots() {
    [1, 2].forEach(turfNum => renderTurfSlots(turfNum));
}

function renderTurfSlots(turfNum) {
    const container = document.getElementById(`turf-${turfNum}-slots`);
    if (!container) return;
    
    const turf = TURFS[turfNum];
    
    container.innerHTML = turf.slots.map(slot => {
        const key = `${turfNum}-${slot.id}`;
        const state = BookingState.slotStates[key] || '';
        
        let statusHTML = '', btnClass = 'book-button', btnText = 'Book Now', disabled = '';
        
        if (state === 'confirmed') {
            statusHTML = '<div class="slot-status booked"><i class="fas fa-times-circle"></i> Booked</div>';
            btnClass += ' disabled'; disabled = ' disabled'; btnText = 'Fully Booked';
        } else if (state === 'pending') {
            statusHTML = '<div class="slot-status pending"><i class="fas fa-hourglass-half"></i> Pending</div>';
        } else {
            statusHTML = '<div class="slot-status available"><i class="fas fa-check-circle"></i> Available</div>';
        }
        
        return `
        <div class="slot-card glass-effect" data-turb="${turfNum}" data-slot="${slot.id}">
            ${statusHTML}
            <div class="slot-icon ${slot.bgClass}"><i class="fas ${slot.icon}"></i></div>
            <h3 class="slot-title">${slot.label} Session</h3>
            <div class="slot-time"><i class="fas fa-clock"></i> ${slot.time}</div>
            <div class="slot-price">
                <span class="currency">₨</span>
                <span class="amount">${slot.price.toLocaleString()}</span>
                <span class="per">/session</span>
            </div>
            <button class="${btnClass}" ${disabled} 
                onclick="openBookingModal(${turfNum},${slot.id},'${slot.time}',${slot.price})">
                <span>${btnText}</span>${!disabled ? '<i class="fas fa-arrow-right"></i>' : ''}
            </button>
        </div>`;
    }).join('');
}

function setupDatePicker() {
    const input = document.getElementById('booking-date');
    if (!input) return;
    
    input.addEventListener('change', function() {
        BookingState.currentDate = this.value;
        loadSlotStatesFromAPI();
    });
}

async function loadSlotStatesFromAPI() {
    try {
        const date = BookingState.currentDate || document.getElementById('booking-date')?.value || new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/get-slot-states?date=${encodeURIComponent(date)}`);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        BookingState.slotStates = data.states || {};
        renderAllSlots();
        
    } catch (err) {
        console.warn('[Booking] Could not load states:', err.message);
        BookingState.slotStates = {};
        renderAllSlots();
    }
}

function openBookingModal(turfNum, slotId, time, price) {
    const key = `${turfNum}-${slotId}`;
    if (BookingState.slotStates[key] === 'confirmed') {
        showToast('This slot is already booked.', 'error');
        return;
    }
    
    BookingState.currentTurf = turfNum;
    BookingState.currentSlot = slotId;
    BookingState.currentTime = time;
    BookingState.currentPrice = price;
    BookingState.currentDate = document.getElementById('booking-date').value;
    BookingState.selectedMethod = 'easypaisa';
    
    // Populate summary
    const d = new Date(BookingState.currentDate + 'T00:00:00');
    document.getElementById('summary-turf').textContent = TURFS[turfNum].name;
    document.getElementById('summary-date').textContent = d.toLocaleDateString('en-PK', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    document.getElementById('summary-time').textContent = time;
    document.getElementById('summary-price').textContent = `₨${price.toLocaleString()}`;
    
    showModal();
    goToStep(1);
    document.getElementById('user-details-form').reset();
}

function closeModal() {
    hideModal();
    goToStep(1);
    ['transactionId','senderNumber','paidAmount'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
}

function showModal() {
    const m = document.getElementById('booking-modal');
    m.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function hideModal() {
    document.getElementById('booking-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function goToStep(step) {
    for(let i=1;i<=3;i++) {
        const el=document.getElementById(`step-${i}`);
        if(el) el.classList.add('hidden');
        const ind=document.getElementById(`step-${i}-indicator`);
        if(ind){ ind.classList.remove('active','completed'); ind.style.color=''; }
        const ln=i<3?document.getElementById(`line-${i}`):null;
        if(ln)ln.classList.remove('completed');
    }
    const tgt=document.getElementById(`step-${step}`);
    if(tgt)tgt.classList.remove('hidden');
    for(let i=1;i<step;i++){
        document.getElementById(`step-${i}-indicator`)?.classList.add('completed');
        document.getElementById(`line-${i}`)?.classList.add('completed');
    }
    document.getElementById(`step-${step}-indicator`)?.classList.add('active');
}

// =========================
// EVENT LISTENERS
// =========================
function initModalEvents() {
    document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
    document.getElementById('booking-modal')?.addEventListener('click', function(e) { if(e.target===this)closeModal(); });
    document.getElementById('user-details-form')?.addEventListener('submit', handleStep1Submit);
    document.getElementById('back-to-step1-btn')?.addEventListener('click',()=>goToStep(1));
    document.getElementById('pay-button')?.addEventListener('click', handlePayment);
    document.getElementById('done-btn')?.addEventListener('click',()=>{ closeModal(); loadSlotStatesFromAPI(); showToast('Thanks! Check your email for confirmation.','success'); });
    document.getElementById('share-btn')?.addEventListener('click',shareWA);
    ['method-easypaisa','method-jazzcash'].forEach(m=>{
        document.getElementById(m)?.addEventListener('click',()=>selectMethod(m.replace('method-','')));
    });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape')closeModal(); });
}

function handleStep1Submit(e) {
    e.preventDefault();
    const fn=document.getElementById('fullName').value.trim();
    const ph=document.getElementById('phone').value.trim();
    const em=document.getElementById('email').value.trim();
    const pl=document.getElementById('players').value;
    const tn=document.getElementById('teamName').value.trim();
    
    if(!fn){ showToast('Enter full name','error'); document.getElementById('fullName').focus(); return; }
    if(!ph||!/^\d{11}$/.test(ph)){ showToast('Valid phone required (e.g., 03001234567)','error'); document.getElementById('phone').focus(); return; }
    if(!em||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ showToast('Valid email required','error'); document.getElementById('email').focus(); return; }
    if(!pl){ showToast('Select player count','error'); document.getElementById('players').focus(); return; }
    
    BookingState.userDetails={ fullName:fn, phone:ph, email:em, players:pl, teamName:tn };
    
    document.getElementById('payment-turf').textContent=TURFS[BookingState.currentTurf].name;
    document.getElementById('payment-slot-time').textContent=BookingState.currentTime;
    document.getElementById('payment-date').textContent=new Date(BookingState.currentDate+'T00:00:00').toLocaleDateString('en-PK',{weekday:'short',month:'short',day:'numeric'});
    document.getElementById('payment-customer').textContent=fn;
    document.getElementById('payment-total').textContent=`₨${BookingState.currentPrice.toLocaleString()}`;
    
    document.getElementById('ep-amount').textContent=`₨${BookingState.currentPrice.toLocaleString()}`;
    document.getElementById('jc-amount').textContent=`₨${BookingState.currentPrice.toLocaleString()}`;
    document.getElementById('paidAmount').placeholder=`Enter ${BookingState.currentPrice} exactly`;
    
    goToStep(2);
}

function selectMethod(method) {
    BookingState.selectedMethod=method;
    ['easypaisa','jazzcash'].forEach(m=>{
        document.getElementById(`method-${m}`).classList.toggle('active', m===method);
        document.getElementById(`details-${m}`).classList.toggle('hidden', m!==method);
    });
}

async function handlePayment() {
    const txn=document.getElementById('transactionId').value.trim();
    const sender=document.getElementById('senderNumber').value.trim();
    const amt=document.getElementById('paidAmount').value.trim();
    
    if(!txn||txn.length<5){showToast('Valid TXN ID required','error');return;}
    if(!sender||!/^\d{11}$/.test(sender)){showToast('Valid sender number required','error');return;}
    if(!amt||isNaN(amt)||parseFloat(amt)<=0){showToast('Enter sent amount','error');return;}
    
    const btn=document.getElementById('pay-button');
    const txt=document.getElementById('pay-button-text');
    const sp=document.getElementById('pay-spinner');
    btn.disabled=true;txt.textContent='Submitting...';sp.classList.remove('hidden');
    
    try {
        const bid='CT-'+Math.random().toString(36).substr(2,8).toUpperCase();
        const payload={
            bookingId:bid,
            turfNumber:BookingState.currentTurf,
            slotNumber:BookingState.currentSlot,
            date:BookingState.currentDate,
            time:BookingState.currentTime,
            expectedAmount:BookingState.currentPrice,
            paidAmount:parseFloat(amt),
            transactionId:txn,
            senderNumber:sender,
            paymentMethod:BookingState.selectedMethod,
            userDetails:BookingState.userDetails,
            status:'pending',
            submittedAt:new Date().toISOString()
        };
        
        const res=await fetch('/api/submit-booking',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(payload)
        });
        const d=await res.json();
        
        if(d.success){
            showSuccessScreen(payload);
            goToStep(3);
        } else { throw new Error(d.error||'Submission failed'); }
    } catch(er) {
        showToast('Error: '+er.message,'error');
    } finally {
        btn.disabled=false;txt.textContent='Submit for Verification';sp.classList.add('hidden');
    }
}

function showSuccessScreen(booking) {
    document.getElementById('pending-id').textContent=booking.bookingId;
    const url=window.location.origin+'/receipt/?id='+booking.bookingId;
    document.getElementById('status-link').href=url;
}

function shareWA() {
    const id=document.getElementById('pending-id').textContent;
    const url=location.origin+'/receipt/?id='+id;
    open(`https://wa.me/?text=${encodeURIComponent('🏏 My CricTurf Booking ID: '+id+'\nCheck: '+url)}`,'_blank');
}


// =========================
// SMART AUTO-REFRESH WITH PAUSE FEATURE
// Saves API calls when user is not looking at the page
// =========================
let refreshTimer = null;

function startAutoRefresh() {
    // Don't start if already running
    if (refreshTimer) return;
    
    refreshTimer = setInterval(() => {
        const modal = document.getElementById('booking-modal');
        // Only refresh if modal is closed
        if (modal && !modal.classList.contains('active')) {
            loadSlotStatesFromAPI();
        }
    }, 15000); // Check every 15 seconds
    
    console.log('▶️ Auto-refresh STARTED');
}

function pauseAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
        console.log('⏸️ Auto-refresh PAUSED (tab not visible)');
    }
}

// Start refresh when page loads
startAutoRefresh();

// Smart pause: stop when user switches tabs, resume when they return
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // User left the tab → PAUSE to save API calls
        pauseAutoRefresh();
    } else {
        // User came back → RESUME + instant fresh check
        console.log('👀 User returned - refreshing now');
        loadSlotStatesFromAPI();
        startAutoRefresh();
    }
});
