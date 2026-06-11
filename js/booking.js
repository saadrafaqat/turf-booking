// Turf and slot configuration
const TURFS = {
    1: {
        name: 'Turf 1 - Premium',
        slots: [
            { id: 1, time: '6:00 AM - 8:00 AM', label: 'Morning', icon: 'fa-cloud-sun', iconClass: 'morning', price: 1500 },
            { id: 2, time: '10:00 AM - 12:00 PM', label: 'Late Morning', icon: 'fa-sun', iconClass: 'morning', price: 1800 },
            { id: 3, time: '4:00 PM - 6:00 PM', label: 'Evening', icon: 'fa-cloud-moon', iconClass: 'evening', price: 2500 },
            { id: 4, time: '8:00 PM - 10:00 PM', label: 'Night', icon: 'fa-moon', iconClass: 'night', price: 3000 }
        ]
    },
    2: {
        name: 'Turf 2 - Standard',
        slots: [
            { id: 1, time: '7:00 AM - 9:00 AM', label: 'Morning', icon: 'fa-cloud-sun', iconClass: 'morning', price: 1000 },
            { id: 2, time: '2:00 PM - 4:00 PM', label: 'Afternoon', icon: 'fa-sun', iconClass: 'afternoon', price: 1200 },
            { id: 3, time: '6:00 PM - 8:00 PM', label: 'Evening', icon: 'fa-cloud-moon', iconClass: 'evening', price: 1800 },
            { id: 4, time: '9:00 PM - 11:00 PM', label: 'Night', icon: 'fa-moon', iconClass: 'night', price: 2200 }
        ]
    }
};

const BookingState = {
    currentTurf: null,
    currentSlot: null,
    currentTime: '',
    currentPrice: 0,
    currentDate: '',
    selectedPaymentMethod: 'easypaisa',
    userDetails: {}
};

let slotStates = {}; // { '1-1': 'confirmed', '2-3': 'pending' }

function initBooking() {
    const dateInput = document.getElementById('booking-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
    BookingState.currentDate = today;

    dateInput.addEventListener('change', function() {
        BookingState.currentDate = this.value;
        renderAllSlots();
        loadSlotStates();
    });

    renderAllSlots();
    loadSlotStates();
}

function renderAllSlots() {
    renderTurfSlots(1);
    renderTurfSlots(2);
}

function renderTurfSlots(turfNum) {
    const container = document.getElementById(`turf-${turfNum}-slots`);
    if (!container) return;

    const turf = TURFS[turfNum];
    container.innerHTML = turf.slots.map(slot => {
        const stateKey = `${turfNum}-${slot.id}`;
        const state = slotStates[stateKey];

        let statusClass = 'available';
        let statusIcon = 'fa-check-circle';
        let statusText = 'Available';
        let btnDisabled = '';
        let btnText = 'Book Now';

        if (state === 'confirmed') {
            statusClass = 'booked';
            statusIcon = 'fa-times-circle';
            statusText = 'Booked';
            btnDisabled = 'disabled';
            btnText = 'Fully Booked';
        } else if (state === 'pending') {
            statusClass = 'pending';
            statusIcon = 'fa-hourglass-half';
            statusText = 'Pending';
        }

        return `
        <div class="slot-card glass-effect" data-turf="${turfNum}" data-slot="${slot.id}">
            <div class="slot-status ${statusClass}">
                <i class="fas ${statusIcon}"></i>
                <span>${statusText}</span>
            </div>
            <div class="slot-icon ${slot.iconClass}"><i class="fas ${slot.icon}"></i></div>
            <h3 class="slot-title">${slot.label} Session</h3>
            <div class="slot-time"><i class="fas fa-clock"></i> ${slot.time}</div>
            <div class="slot-price">
                <span class="currency">₨</span>
                <span class="amount">${slot.price.toLocaleString()}</span>
                <span class="per">/session</span>
            </div>
            <button class="book-button" ${btnDisabled} onclick="openBookingModal(${turfNum}, ${slot.id}, '${slot.time}', ${slot.price})">
                <span>${btnText}</span>
                ${!btnDisabled ? '<i class="fas fa-arrow-right"></i>' : ''}
            </button>
        </div>`;
    }).join('');
}

async function loadSlotStates() {
    try {
        const date = BookingState.currentDate;
        const res = await fetch(`/api/get-slot-states?date=${date}`);

        if (!res.ok) throw new Error('API error');

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); }
        catch { throw new Error('Invalid response'); }

        slotStates = data.slots || {};
        renderAllSlots();
    } catch (err) {
        console.warn('Could not load slot states:', err.message);
        slotStates = {};
        renderAllSlots();
    }
}

function openBookingModal(turfNum, slotId, time, price) {
    const stateKey = `${turfNum}-${slotId}`;
    if (slotStates[stateKey] === 'confirmed') {
        showToast('This slot is already booked!', 'error');
        return;
    }

    BookingState.currentTurf = turfNum;
    BookingState.currentSlot = slotId;
    BookingState.currentTime = time;
    BookingState.currentPrice = price;
    BookingState.currentDate = document.getElementById('booking-date').value;

    const dateObj = new Date(BookingState.currentDate + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('en-PK', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    document.getElementById('summary-turf').textContent = TURFS[turfNum].name;
    document.getElementById('summary-date').textContent = formatted;
    document.getElementById('summary-time').textContent = time;
    document.getElementById('summary-price').textContent = `₨${price.toLocaleString()}`;

    document.getElementById('booking-modal').classList.add('active');
    document.body.style.overflow = 'hidden';

    goToStep(1);
    document.getElementById('user-details-form').reset();
}

function closeModal() {
    document.getElementById('booking-modal').classList.remove('active');
    document.body.style.overflow = '';
    goToStep(1);

    ['transactionId', 'senderNumber', 'paidAmount'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function goToStep(step) {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`step-${i}`)?.classList.add('hidden');
        const ind = document.getElementById(`step-${i}-indicator`);
        if (ind) ind.classList.remove('active', 'completed');
    }

    document.getElementById(`step-${step}`)?.classList.remove('hidden');

    for (let i = 1; i < step; i++) {
        document.getElementById(`step-${i}-indicator`)?.classList.add('completed');
    }
    document.getElementById(`step-${step}-indicator`)?.classList.add('active');
}

function initModalEvents() {
    document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);

    document.getElementById('booking-modal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    document.getElementById('user-details-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleStep1();
    });

    document.getElementById('back-btn')?.addEventListener('click', () => goToStep(1));

    ['easypaisa', 'jazzcash'].forEach(method => {
        document.getElementById(`method-${method}`)?.addEventListener('click', () => selectPaymentMethod(method));
    });

    document.getElementById('pay-button')?.addEventListener('click', handlePayment);

    document.getElementById('done-btn')?.addEventListener('click', () => {
        closeModal();
        loadSlotStates();
    });

    document.getElementById('share-btn')?.addEventListener('click', shareOnWhatsApp);
}

function handleStep1() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const players = document.getElementById('players').value;
    const teamName = document.getElementById('teamName').value.trim();

    if (!fullName) { showToast('Enter your name', 'error'); return; }
    if (!phone || !/^03\d{9}$/.test(phone.replace(/[-\s]/g, ''))) { showToast('Enter valid phone (03XXXXXXXXX)', 'error'); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Enter valid email', 'error'); return; }
    if (!players) { showToast('Select players', 'error'); return; }

    BookingState.userDetails = { fullName, phone, email, players, teamName };

    const dateObj = new Date(BookingState.currentDate + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' });

    document.getElementById('payment-turf').textContent = TURFS[BookingState.currentTurf].name;
    document.getElementById('payment-slot-time').textContent = BookingState.currentTime;
    document.getElementById('payment-date').textContent = formatted;
    document.getElementById('payment-total').textContent = `₨${BookingState.currentPrice.toLocaleString()}`;

    const amountStr = `₨${BookingState.currentPrice.toLocaleString()}`;
    document.getElementById('ep-amount').textContent = amountStr;
    document.getElementById('jc-amount').textContent = amountStr;

    document.getElementById('paidAmount').placeholder = `Enter ${BookingState.currentPrice}`;

    goToStep(2);
}

function selectPaymentMethod(method) {
    BookingState.selectedPaymentMethod = method;

    ['easypaisa', 'jazzcash'].forEach(m => {
        document.getElementById(`method-${m}`)?.classList.remove('active');
        document.getElementById(`details-${m}`)?.classList.add('hidden');
    });

    document.getElementById(`method-${method}`)?.classList.add('active');
    document.getElementById(`details-${method}`)?.classList.remove('hidden');
}

async function handlePayment() {
    const txnId = document.getElementById('transactionId').value.trim();
    const senderNum = document.getElementById('senderNumber').value.trim();
    const paidAmount = document.getElementById('paidAmount').value.trim();

    if (!txnId || txnId.length < 5) { showToast('Enter valid Transaction ID', 'error'); return; }
    if (!senderNum || !/^03\d{9}$/.test(senderNum.replace(/[-\s]/g, ''))) { showToast('Enter valid sender number', 'error'); return; }
    if (!paidAmount || isNaN(paidAmount) || parseFloat(paidAmount) <= 0) { showToast('Enter amount sent', 'error'); return; }

    const payBtn = document.getElementById('pay-button');
    const payText = document.getElementById('pay-text');
    const spinner = document.getElementById('pay-spinner');

    payBtn.disabled = true;
    payText.textContent = 'Submitting...';
    spinner?.classList.remove('hidden');

    try {
        const bookingId = generateBookingId();

        const bookingData = {
            bookingId,
            turfNumber: BookingState.currentTurf,
            slotNumber: BookingState.currentSlot,
            date: BookingState.currentDate,
            time: BookingState.currentTime,
            expectedAmount: BookingState.currentPrice,
            paidAmount: parseFloat(paidAmount),
            transactionId: txnId,
            senderNumber: senderNum,
            paymentMethod: BookingState.selectedPaymentMethod,
            userDetails: BookingState.userDetails,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        const res = await fetch('/api/submit-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const text = await res.text();
        let result;
        try { result = JSON.parse(text); }
        catch { throw new Error('Server returned invalid response'); }

        if (!result.success) {
            throw new Error(result.error || 'Submission failed');
        }

        showPendingScreen(bookingData);
        goToStep(3);

    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        payBtn.disabled = false;
        payText.textContent = 'Submit for Verification';
        spinner?.classList.add('hidden');
    }
}

function showPendingScreen(bookingData) {
    document.getElementById('pending-id').textContent = bookingData.bookingId;

    const receiptUrl = `${window.location.origin}/receipt/?id=${bookingData.bookingId}`;
    const statusLink = document.getElementById('status-link');
    statusLink.href = receiptUrl;
    document.getElementById('status-link-text').textContent = `View Receipt`;
}

function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'CT-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function shareOnWhatsApp() {
    const bookingId = document.getElementById('pending-id').textContent;
    const receiptUrl = `${window.location.origin}/receipt/?id=${bookingId}`;
    const msg = `🏏 *CricTurf Booking*\n\nBooking ID: ${bookingId}\nStatus: PENDING\n\nCheck your receipt: ${receiptUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
