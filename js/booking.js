// ===== BOOKING STATE =====
const BookingState = {
    currentSlot: null,
    currentTime: '',
    currentPrice: 0,
    currentDate: '',
    selectedPaymentMethod: 'easypaisa',
    userDetails: {},
    bookedSlots: {}
};

// ===== INITIALIZE =====
function initBooking() {
    console.log('🏏 Booking system initialized');
    
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today;
        BookingState.currentDate = today;

        dateInput.addEventListener('change', function(e) {
            BookingState.currentDate = e.target.value;
            updateSlotAvailability();
        });
    }

    // Load booked slots from localStorage
    try {
        const saved = localStorage.getItem('bookedSlots');
        if (saved) BookingState.bookedSlots = JSON.parse(saved);
    } catch (e) {
        console.warn('Could not load saved bookings');
    }

    updateSlotAvailability();
}

// ===== UPDATE SLOT AVAILABILITY =====
function updateSlotAvailability() {
    const date = BookingState.currentDate;
    const booked = BookingState.bookedSlots[date] || [];

    [1, 2, 3, 4].forEach(function(id) {
        const status = document.getElementById('status-' + id);
        const btn = document.getElementById('book-btn-' + id);
        if (!status || !btn) return;

        if (booked.includes(id)) {
            status.className = 'slot-status booked';
            status.innerHTML = '<i class="fas fa-times-circle"></i><span>Booked</span>';
            btn.disabled = true;
            btn.innerHTML = '<span>Already Booked</span><i class="fas fa-lock"></i>';
        } else {
            status.className = 'slot-status available';
            status.innerHTML = '<i class="fas fa-check-circle"></i><span>Available</span>';
            btn.disabled = false;
            // Keep custom text for slot 3 (test)
            if (id === 3) {
                btn.innerHTML = '<span>Book Now (Test)</span><i class="fas fa-arrow-right"></i>';
            } else {
                btn.innerHTML = '<span>Book Now</span><i class="fas fa-arrow-right"></i>';
            }
        }
    });
}

// ===== OPEN BOOKING MODAL =====
function openBookingModal(slotId, time, price) {
    console.log('Opening booking modal:', { slotId, time, price });
    
    const date = BookingState.currentDate;
    if (!date) {
        showToast('Please select a date first', 'error');
        return;
    }

    const booked = BookingState.bookedSlots[date] || [];
    if (booked.includes(slotId)) {
        showToast('This slot is already booked for the selected date', 'error');
        return;
    }

    BookingState.currentSlot = slotId;
    BookingState.currentTime = time;
    BookingState.currentPrice = price;

    const fDate = new Date(date).toLocaleDateString('en-PK', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const sumDate = document.getElementById('summary-date');
    const sumTime = document.getElementById('summary-time');
    const sumPrice = document.getElementById('summary-price');
    
    if (sumDate) sumDate.textContent = fDate;
    if (sumTime) sumTime.textContent = time;
    if (sumPrice) sumPrice.textContent = '₨' + price.toLocaleString();

    goToStep(1);
    
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// ===== CLOSE BOOKING MODAL =====
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form
    ['fullName', 'email', 'phone', 'teamName', 'transactionId', 'senderNumber'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const players = document.getElementById('players');
    if (players) players.value = '';
    
    removeScreenshot();
    goToStep(1);
}

// ===== NAVIGATE STEPS =====
function goToStep(step) {
    console.log('Going to step:', step);
    
    // Hide all steps
    document.querySelectorAll('.modal-step').forEach(function(s) {
        s.classList.add('hidden');
    });
    
    // Show current step
    const currentStep = document.getElementById('step-' + step);
    if (currentStep) currentStep.classList.remove('hidden');
    
    // Update step indicators
    for (let i = 1; i <= 3; i++) {
        const ind = document.getElementById('step-' + i + '-indicator');
        if (!ind) continue;
        ind.classList.remove('active', 'completed');
        if (i < step) ind.classList.add('completed');
        if (i === step) ind.classList.add('active');
    }
    
    // Update step lines
    const l1 = document.getElementById('line-1');
    const l2 = document.getElementById('line-2');
    if (l1) l1.classList.toggle('active', step > 1);
    if (l2) l2.classList.toggle('active', step > 2);
}

// ===== HANDLE FORM SUBMIT (FIXED!) =====
function handleFormSubmit() {
    console.log('Continue to Payment clicked');
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const teamName = document.getElementById('teamName').value.trim();
    const players = document.getElementById('players').value;

    // Validation
    if (!fullName) {
        showToast('Please enter Captain Name', 'error');
        document.getElementById('fullName').focus();
        return;
    }
    if (!phone) {
        showToast('Please enter Phone Number', 'error');
        document.getElementById('phone').focus();
        return;
    }
    if (!email) {
        showToast('Please enter Email Address', 'error');
        document.getElementById('email').focus();
        return;
    }
    
    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
        showToast('Please enter a valid email address', 'error');
        document.getElementById('email').focus();
        return;
    }
    
    if (!players) {
        showToast('Please select number of players', 'error');
        document.getElementById('players').focus();
        return;
    }

    // Save details
    BookingState.userDetails = { fullName, email, phone, teamName, players };
    console.log('User details saved:', BookingState.userDetails);

    // Update payment step UI
    const fDate = new Date(BookingState.currentDate).toLocaleDateString('en-PK', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    
    document.getElementById('payment-slot-time').textContent = BookingState.currentTime;
    document.getElementById('payment-date').textContent = fDate;
    document.getElementById('payment-customer').textContent = fullName;
    document.getElementById('payment-total').textContent = '₨' + BookingState.currentPrice.toLocaleString();

    // Update amount in all payment method sections
    const amt = '₨' + BookingState.currentPrice.toLocaleString();
    ['ep-amount', 'jc-amount', 'bk-amount', 'ep-step-amount', 'jc-step-amount', 'bk-step-amount'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.textContent = amt;
    });
    
    const payBtnText = document.getElementById('pay-button-text');
    if (payBtnText) payBtnText.textContent = 'Confirm Payment • ' + amt;

    // Go to payment step
    goToStep(2);
    
    showToast('Please complete payment and enter Transaction ID', 'success');
}

// ===== MARK SLOT AS BOOKED =====
function markSlotAsBooked(slotId, date) {
    if (!BookingState.bookedSlots[date]) {
        BookingState.bookedSlots[date] = [];
    }
    BookingState.bookedSlots[date].push(slotId);
    try {
        localStorage.setItem('bookedSlots', JSON.stringify(BookingState.bookedSlots));
    } catch (e) {
        console.warn('Could not save booking');
    }
    updateSlotAvailability();
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type) {
    type = type || 'success';
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    const icon = toast ? toast.querySelector('.toast-icon i') : null;
    
    if (!toast || !msg) return;
    
    msg.textContent = message;
    toast.className = 'toast ' + type;
    
    if (icon) {
        icon.className = type === 'success' ? 'fas fa-check-circle' :
                         type === 'error' ? 'fas fa-exclamation-circle' :
                         'fas fa-info-circle';
    }
    
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 4000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text, el) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('Copied: ' + text, 'success');
            if (el) {
                const orig = el.innerHTML;
                el.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(function() { el.innerHTML = orig; }, 1500);
            }
        }).catch(function() {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    try {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Copied: ' + text, 'success');
    } catch (e) {
        showToast('Could not copy. Please copy manually: ' + text, 'error');
    }
}

// ===== SCREENSHOT =====
function handleScreenshot(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('screenshot-img');
            const prev = document.getElementById('screenshot-preview');
            if (img) img.src = e.target.result;
            if (prev) prev.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeScreenshot() {
    const inp = document.getElementById('screenshot');
    const prev = document.getElementById('screenshot-preview');
    const img = document.getElementById('screenshot-img');
    if (inp) inp.value = '';
    if (prev) prev.classList.add('hidden');
    if (img) img.src = '';
}

// ===== INIT ON LOAD =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBooking);
} else {
    initBooking();
}
