const BookingState = {
    currentSlot: null,
    currentTime: '',
    currentPrice: 0,
    currentDate: '',
    selectedPaymentMethod: 'easypaisa',
    userDetails: {},
    bookedSlots: {}
};

function initBooking() {
    const dateInput = document.getElementById('booking-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
    BookingState.currentDate = today;

    const saved = localStorage.getItem('bookedSlots');
    if (saved) BookingState.bookedSlots = JSON.parse(saved);

    dateInput.addEventListener('change', e => {
        BookingState.currentDate = e.target.value;
        updateSlotAvailability();
    });

    document.getElementById('user-details-form').addEventListener('submit', e => {
        e.preventDefault();
        handleFormSubmit();
    });

    updateSlotAvailability();
}

function updateSlotAvailability() {
    const date = BookingState.currentDate;
    const booked = BookingState.bookedSlots[date] || [];

    [1,2,3,4].forEach(id => {
        const status = document.getElementById(`status-${id}`);
        const btn = document.getElementById(`book-btn-${id}`);
        if (booked.includes(id)) {
            status.className = 'slot-status booked';
            status.innerHTML = '<i class="fas fa-times-circle"></i><span>Booked</span>';
            btn.disabled = true;
            btn.innerHTML = '<span>Already Booked</span><i class="fas fa-lock"></i>';
        } else {
            status.className = 'slot-status available';
            status.innerHTML = '<i class="fas fa-check-circle"></i><span>Available</span>';
            btn.disabled = false;
            btn.innerHTML = '<span>Book Now</span><i class="fas fa-arrow-right"></i>';
        }
    });
}

function openBookingModal(slotId, time, price) {
    const date = BookingState.currentDate;
    if (!date) { showToast('Please select a date first','error'); return; }
    if ((BookingState.bookedSlots[date]||[]).includes(slotId)) { showToast('This slot is already booked','error'); return; }

    BookingState.currentSlot = slotId;
    BookingState.currentTime = time;
    BookingState.currentPrice = price;

    const fDate = new Date(date).toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    document.getElementById('summary-date').textContent = fDate;
    document.getElementById('summary-time').textContent = time;
    document.getElementById('summary-price').textContent = `₨${price.toLocaleString()}`;

    goToStep(1);
    document.getElementById('booking-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('user-details-form').reset();
    document.getElementById('transactionId').value = '';
    document.getElementById('senderNumber').value = '';
    removeScreenshot();
}

function goToStep(step) {
    document.querySelectorAll('.modal-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');
    for (let i=1;i<=3;i++) {
        const ind = document.getElementById(`step-${i}-indicator`);
        ind.classList.remove('active','completed');
        if (i<step) ind.classList.add('completed');
        if (i===step) ind.classList.add('active');
    }
    const l1 = document.getElementById('line-1');
    const l2 = document.getElementById('line-2');
    if (l1) l1.classList.toggle('active', step>1);
    if (l2) l2.classList.toggle('active', step>2);
}

function handleFormSubmit() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const teamName = document.getElementById('teamName').value.trim();
    const players = document.getElementById('players').value;

    if (!fullName||!email||!phone||!players) { showToast('Please fill all required fields','error'); return; }

    BookingState.userDetails = { fullName, email, phone, teamName, players };

    // Update payment step
    const fDate = new Date(BookingState.currentDate).toLocaleDateString('en-PK',{month:'short',day:'numeric',year:'numeric'});
    document.getElementById('payment-slot-time').textContent = BookingState.currentTime;
    document.getElementById('payment-date').textContent = fDate;
    document.getElementById('payment-customer').textContent = fullName;
    document.getElementById('payment-total').textContent = `₨${BookingState.currentPrice.toLocaleString()}`;

    // Update amounts in all payment methods
    const amt = `₨${BookingState.currentPrice.toLocaleString()}`;
    document.getElementById('ep-amount').textContent = amt;
    document.getElementById('jc-amount').textContent = amt;
    document.getElementById('bk-amount').textContent = amt;
    document.getElementById('ep-step-amount').textContent = amt;
    document.getElementById('jc-step-amount').textContent = amt;
    document.getElementById('bk-step-amount').textContent = amt;
    document.getElementById('pay-button-text').textContent = `Confirm Payment • ${amt}`;

    goToStep(2);
}

function markSlotAsBooked(slotId, date) {
    if (!BookingState.bookedSlots[date]) BookingState.bookedSlots[date] = [];
    BookingState.bookedSlots[date].push(slotId);
    localStorage.setItem('bookedSlots', JSON.stringify(BookingState.bookedSlots));
    updateSlotAvailability();
}

function showToast(message, type='success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    const icon = toast.querySelector('.toast-icon i');
    msg.textContent = message;
    toast.className = 'toast ' + type;
    icon.className = type==='success'?'fas fa-check-circle':type==='error'?'fas fa-exclamation-circle':'fas fa-info-circle';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function hideToast() { document.getElementById('toast').classList.remove('show'); }

function copyToClipboard(text, el) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied: ' + text, 'success');
        if (el) {
            const orig = el.innerHTML;
            el.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => el.innerHTML = orig, 1500);
        }
    }).catch(() => {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Copied!','success');
    });
}

function handleScreenshot(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('screenshot-img').src = e.target.result;
            document.getElementById('screenshot-preview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeScreenshot() {
    document.getElementById('screenshot').value = '';
    document.getElementById('screenshot-preview').classList.add('hidden');
    document.getElementById('screenshot-img').src = '';
}

document.addEventListener('DOMContentLoaded', initBooking);
