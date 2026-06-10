// ===== BOOKING STATE =====
const BookingState = {
    currentSlot: null,
    currentTime: '',
    currentPrice: 0,
    currentDate: '',
    userDetails: {},
    bookedSlots: {} // { "2024-01-15": [1, 2, 3] }
};

// ===== SLOT CONFIG =====
const SLOT_CONFIG = {
    1: { name: 'Morning Session', time: '6:00 AM - 8:00 AM', price: 1000 },
    2: { name: 'Afternoon Session', time: '2:00 PM - 4:00 PM', price: 1500 },
    3: { name: 'Evening Session', time: '6:00 PM - 8:00 PM', price: 2000 },
    4: { name: 'Night Session', time: '8:00 PM - 10:00 PM', price: 2000 }
};

// ===== INITIALIZE =====
function initBooking() {
    const dateInput = document.getElementById('booking-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
    BookingState.currentDate = today;

    // Load booked slots from localStorage
    const saved = localStorage.getItem('bookedSlots');
    if (saved) {
        BookingState.bookedSlots = JSON.parse(saved);
    }

    dateInput.addEventListener('change', (e) => {
        BookingState.currentDate = e.target.value;
        updateSlotAvailability();
    });

    document.getElementById('user-details-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit();
    });

    updateSlotAvailability();
}

// ===== UPDATE SLOT AVAILABILITY =====
function updateSlotAvailability() {
    const date = BookingState.currentDate;
    const bookedOnDate = BookingState.bookedSlots[date] || [];

    [1, 2, 3, 4].forEach((slotId) => {
        const statusEl = document.getElementById(`status-${slotId}`);
        const buttonEl = document.getElementById(`book-btn-${slotId}`);
        const isBooked = bookedOnDate.includes(slotId);

        if (isBooked) {
            statusEl.className = 'slot-status booked';
            statusEl.innerHTML = '<i class="fas fa-times-circle"></i><span>Booked</span>';
            buttonEl.disabled = true;
            buttonEl.innerHTML = '<span>Already Booked</span><i class="fas fa-lock"></i>';
        } else {
            statusEl.className = 'slot-status available';
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i><span>Available</span>';
            buttonEl.disabled = false;
            buttonEl.innerHTML = '<span>Book Now</span><i class="fas fa-arrow-right"></i>';
        }
    });
}

// ===== OPEN BOOKING MODAL =====
function openBookingModal(slotId, time, price) {
    const date = BookingState.currentDate;

    if (!date) {
        showToast('Please select a date first', 'error');
        return;
    }

    const bookedOnDate = BookingState.bookedSlots[date] || [];
    if (bookedOnDate.includes(slotId)) {
        showToast('This slot is already booked for the selected date', 'error');
        return;
    }

    BookingState.currentSlot = slotId;
    BookingState.currentTime = time;
    BookingState.currentPrice = price;

    const formattedDate = new Date(date).toLocaleDateString('en-PK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('summary-date').textContent = formattedDate;
    document.getElementById('summary-time').textContent = time;
    document.getElementById('summary-price').textContent = `₨${price.toLocaleString()}`;

    goToStep(1);

    document.getElementById('booking-modal').classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => initStripeElements(), 300);
}

// ===== CLOSE BOOKING MODAL =====
function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('user-details-form').reset();

    if (window.cardElement) {
        window.cardElement.destroy();
        window.cardElement = null;
    }
}

// ===== NAVIGATE STEPS =====
function goToStep(step) {
    document.querySelectorAll('.modal-step').forEach((s) => s.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');

    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`step-${i}-indicator`);
        indicator.classList.remove('active', 'completed');
        if (i < step) indicator.classList.add('completed');
        if (i === step) indicator.classList.add('active');
    }

    // Update step lines
    const line1 = document.getElementById('line-1');
    const line2 = document.getElementById('line-2');
    if (line1) line1.classList.toggle('active', step > 1);
    if (line2) line2.classList.toggle('active', step > 2);
}

// ===== HANDLE FORM SUBMIT =====
function handleFormSubmit() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const teamName = document.getElementById('teamName').value.trim();
    const players = document.getElementById('players').value;
    const notes = document.getElementById('notes').value.trim();

    if (!fullName || !email || !phone || !players) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Phone validation for Pakistan
    const phoneRegex = /^(\+92|0)?[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        showToast('Please enter a valid Pakistani phone number', 'error');
        return;
    }

    BookingState.userDetails = { fullName, email, phone, teamName, players, notes };

    // Update payment info
    document.getElementById('payment-slot-time').textContent = BookingState.currentTime;
    const formattedDate = new Date(BookingState.currentDate).toLocaleDateString('en-PK', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    document.getElementById('payment-date').textContent = formattedDate;
    document.getElementById('payment-customer').textContent = fullName;
    document.getElementById('payment-total').textContent = `₨${BookingState.currentPrice.toLocaleString()}`;

    // Update pay button text
    document.getElementById('pay-button-text').textContent = `Pay ₨${BookingState.currentPrice.toLocaleString()}`;

    goToStep(2);
}

// ===== MARK SLOT AS BOOKED =====
function markSlotAsBooked(slotId, date) {
    if (!BookingState.bookedSlots[date]) {
        BookingState.bookedSlots[date] = [];
    }
    BookingState.bookedSlots[date].push(slotId);
    localStorage.setItem('bookedSlots', JSON.stringify(BookingState.bookedSlots));
    updateSlotAvailability();
}

// ===== SHOW TOAST =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = toast.querySelector('.toast-icon i');

    toastMessage.textContent = message;
    toast.className = 'toast ' + type;

    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle';
    } else {
        toastIcon.className = 'fas fa-info-circle';
    }

    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

function hideToast() {
    document.getElementById('toast').classList.remove('show');
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Copied to clipboard!', 'success');
    });
}

document.addEventListener('DOMContentLoaded', initBooking);
