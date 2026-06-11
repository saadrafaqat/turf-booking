const BookingState = {
    currentSlot: null,
    currentTime: '',
    currentPrice: 0,
    currentDate: '',
    selectedPaymentMethod: 'easypaisa',
    userDetails: {},
    bookedSlots: {},
    screenshotData: null
};

const SLOT_PRICES = { 1: 1000, 2: 1500, 3: 100, 4: 2000 };

function initBooking() {
    const dateInput = document.getElementById('booking-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
    BookingState.currentDate = today;

    dateInput.addEventListener('change', function() {
        BookingState.currentDate = this.value;
        loadSlotStates();
    });

    loadSlotStates();
}

async function loadSlotStates() {
    try {
        const date = BookingState.currentDate;
        const res = await fetch(`/api/get-slot-states?date=${date}`);
        const data = await res.json();

        if (data.slots) {
            BookingState.bookedSlots = data.slots;
            updateSlotUI(data.slots);
        }
    } catch (err) {
        // Fallback to localStorage if API not available
        const stored = localStorage.getItem('bookedSlots');
        if (stored) {
            const allSlots = JSON.parse(stored);
            const dateSlots = allSlots[BookingState.currentDate] || {};
            BookingState.bookedSlots = dateSlots;
            updateSlotUI(dateSlots);
        }
    }
}

function updateSlotUI(slots) {
    for (let i = 1; i <= 4; i++) {
        const status = slots[i];
        const statusEl = document.getElementById(`status-${i}`);
        const bookBtn = document.getElementById(`book-btn-${i}`);
        const card = document.querySelector(`.slot-card[data-slot="${i}"]`);

        if (!statusEl || !bookBtn) continue;

        if (status === 'confirmed') {
            statusEl.className = 'slot-status booked';
            statusEl.innerHTML = '<i class="fas fa-times-circle"></i><span>Booked</span>';
            bookBtn.disabled = true;
            bookBtn.innerHTML = '<span>Fully Booked</span>';
            bookBtn.style.opacity = '0.5';
            bookBtn.style.cursor = 'not-allowed';
            if (card) card.style.opacity = '0.7';
        } else if (status === 'pending') {
            statusEl.className = 'slot-status pending';
            statusEl.innerHTML = '<i class="fas fa-hourglass-half"></i><span>Pending</span>';
            bookBtn.disabled = false;
            bookBtn.style.opacity = '1';
            bookBtn.style.cursor = 'pointer';
        } else {
            statusEl.className = 'slot-status available';
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i><span>Available</span>';
            bookBtn.disabled = false;
            bookBtn.style.opacity = '1';
            bookBtn.style.cursor = 'pointer';
            if (card) card.style.opacity = '1';
        }
    }
}

function openBookingModal(slotNum, time, price) {
    const slotStatus = BookingState.bookedSlots[slotNum];
    if (slotStatus === 'confirmed') {
        showToast('This slot is already booked!', 'error');
        return;
    }

    BookingState.currentSlot = slotNum;
    BookingState.currentTime = time;
    BookingState.currentPrice = price;

    const dateInput = document.getElementById('booking-date');
    BookingState.currentDate = dateInput.value;

    const dateObj = new Date(BookingState.currentDate + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('en-PK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('summary-date').textContent = formatted;
    document.getElementById('summary-time').textContent = time;
    document.getElementById('summary-price').textContent = `₨${price.toLocaleString()}`;

    const modal = document.getElementById('booking-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    goToStep(1);
    document.getElementById('user-details-form').reset();
}

function closeModal() {
    const modal = document.getElementById('booking-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    goToStep(1);

    const fields = ['transactionId', 'senderNumber', 'paidAmount'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    clearScreenshot();
}

function goToStep(step) {
    for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        const indicatorEl = document.getElementById(`step-${i}-indicator`);

        if (stepEl) stepEl.classList.add('hidden');
        if (indicatorEl) indicatorEl.classList.remove('active', 'completed');
    }

    const targetStep = document.getElementById(`step-${step}`);
    if (targetStep) targetStep.classList.remove('hidden');

    for (let i = 1; i < step; i++) {
        const ind = document.getElementById(`step-${i}-indicator`);
        if (ind) ind.classList.add('completed');
        const line = document.getElementById(`line-${i}`);
        if (line) line.classList.add('completed');
    }

    const activeInd = document.getElementById(`step-${step}-indicator`);
    if (activeInd) activeInd.classList.add('active');
}

function initModalEvents() {
    // Close button
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Click outside modal to close
    const overlay = document.getElementById('booking-modal');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeModal();
        });
    }

    // Step 1 form submit
    const form = document.getElementById('user-details-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleStep1Submit();
        });
    }

    // Back button
    const backBtn = document.getElementById('back-to-step1-btn');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(1));

    // Payment method selection
    ['easypaisa', 'jazzcash', 'bank'].forEach(method => {
        const card = document.getElementById(`method-${method}`);
        if (card) card.addEventListener('click', () => selectPaymentMethod(method));
    });

    // Pay / Submit button
    const payBtn = document.getElementById('pay-button');
    if (payBtn) payBtn.addEventListener('click', handlePaymentSubmit);

    // Screenshot upload
    const screenshotInput = document.getElementById('screenshot');
    if (screenshotInput) screenshotInput.addEventListener('change', handleScreenshotUpload);

    const removeScreenshotBtn = document.getElementById('remove-screenshot-btn');
    if (removeScreenshotBtn) removeScreenshotBtn.addEventListener('click', clearScreenshot);

    // Done button
    const doneBtn = document.getElementById('done-btn');
    if (doneBtn) {
        doneBtn.addEventListener('click', function() {
            closeModal();
            loadSlotStates();
            showToast('Booking submitted! Awaiting admin verification.', 'success');
        });
    }

    // Download receipt
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadReceipt);

    // WhatsApp share
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) shareBtn.addEventListener('click', shareOnWhatsApp);
}

function handleStep1Submit() {
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const players = document.getElementById('players').value;
    const teamName = document.getElementById('teamName').value.trim();

    // Validation
    if (!fullName) {
        showToast('Please enter your full name', 'error');
        document.getElementById('fullName').focus();
        return;
    }
    if (!phone || !/^03\d{9}$/.test(phone.replace(/[-\s]/g, ''))) {
        showToast('Please enter a valid Pakistan phone number (03XXXXXXXXX)', 'error');
        document.getElementById('phone').focus();
        return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address', 'error');
        document.getElementById('email').focus();
        return;
    }
    if (!players) {
        showToast('Please select number of players', 'error');
        document.getElementById('players').focus();
        return;
    }

    BookingState.userDetails = { fullName, phone, email, players, teamName };

    // Update payment step summary
    const dateObj = new Date(BookingState.currentDate + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('en-PK', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    document.getElementById('payment-slot-time').textContent = BookingState.currentTime;
    document.getElementById('payment-date').textContent = formatted;
    document.getElementById('payment-customer').textContent = fullName;
    document.getElementById('payment-total').textContent = `₨${BookingState.currentPrice.toLocaleString()}`;

    // Update amount in all payment method sections
    const amountStr = `₨${BookingState.currentPrice.toLocaleString()}`;
    ['ep', 'jc', 'bk'].forEach(prefix => {
        const el = document.getElementById(`${prefix}-amount`);
        const stepEl = document.getElementById(`${prefix}-step-amount`);
        if (el) el.textContent = amountStr;
        if (stepEl) stepEl.textContent = amountStr;
    });

    // Set paid amount placeholder
    const paidInput = document.getElementById('paidAmount');
    if (paidInput) {
        paidInput.placeholder = `Enter ${BookingState.currentPrice} (exact amount)`;
    }

    goToStep(2);
}

function selectPaymentMethod(method) {
    BookingState.selectedPaymentMethod = method;

    ['easypaisa', 'jazzcash', 'bank'].forEach(m => {
        const card = document.getElementById(`method-${m}`);
        const details = document.getElementById(`details-${m}`);
        if (card) card.classList.remove('active');
        if (details) details.classList.add('hidden');
    });

    const selectedCard = document.getElementById(`method-${method}`);
    const selectedDetails = document.getElementById(`details-${method}`);
    if (selectedCard) selectedCard.classList.add('active');
    if (selectedDetails) selectedDetails.classList.remove('hidden');
}

function handleScreenshotUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showToast('Image too large. Max 5MB allowed.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const preview = document.getElementById('screenshot-preview');
        const img = document.getElementById('screenshot-img');
        const label = document.querySelector('.screenshot-label');

        if (img) img.src = event.target.result;
        if (preview) preview.classList.remove('hidden');
        if (label) label.style.display = 'none';

        BookingState.screenshotData = event.target.result;
    };
    reader.readAsDataURL(file);
}

function clearScreenshot() {
    const preview = document.getElementById('screenshot-preview');
    const img = document.getElementById('screenshot-img');
    const input = document.getElementById('screenshot');
    const label = document.querySelector('.screenshot-label');

    if (preview) preview.classList.add('hidden');
    if (img) img.src = '';
    if (input) input.value = '';
    if (label) label.style.display = '';

    BookingState.screenshotData = null;
}

async function handlePaymentSubmit() {
    const transactionId = document.getElementById('transactionId').value.trim();
    const senderNumber = document.getElementById('senderNumber').value.trim();
    const paidAmount = document.getElementById('paidAmount').value.trim();

    // Validation
    if (!transactionId) {
        showToast('Please enter your Transaction ID', 'error');
        document.getElementById('transactionId').focus();
        return;
    }
    if (transactionId.length < 5) {
        showToast('Transaction ID seems too short. Please check again.', 'error');
        return;
    }
    if (!senderNumber || !/^03\d{9}$/.test(senderNumber.replace(/[-\s]/g, ''))) {
        showToast("Please enter a valid sender's phone number (03XXXXXXXXX)", 'error');
        document.getElementById('senderNumber').focus();
        return;
    }
    if (!paidAmount || isNaN(paidAmount) || parseFloat(paidAmount) <= 0) {
        showToast('Please enter the amount you sent', 'error');
        document.getElementById('paidAmount').focus();
        return;
    }
    if (!BookingState.screenshotData) {
        showToast('Please upload your payment screenshot', 'error');
        return;
    }

    // Show loading state
    const payBtn = document.getElementById('pay-button');
    const payText = document.getElementById('pay-button-text');
    const spinner = document.getElementById('pay-spinner');

    payBtn.disabled = true;
    if (payText) payText.textContent = 'Submitting...';
    if (spinner) spinner.classList.remove('hidden');

    try {
        const bookingId = generateBookingId();
        const now = new Date();
        const expiryTime = new Date(now.getTime() + 15 * 60000);

        const bookingData = {
            bookingId,
            slotNumber: BookingState.currentSlot,
            date: BookingState.currentDate,
            time: BookingState.currentTime,
            expectedAmount: BookingState.currentPrice,
            paidAmount: parseFloat(paidAmount),
            transactionId,
            senderNumber,
            paymentMethod: BookingState.selectedPaymentMethod,
            userDetails: BookingState.userDetails,
            screenshot: BookingState.screenshotData,
            status: 'pending',
            submittedAt: now.toISOString(),
            expiresAt: expiryTime.toISOString()
        };

        // Try to submit to API
        try {
            const res = await fetch('/api/submit-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            const result = await res.json();
            if (!result.success) {
                throw new Error(result.error || 'API error');
            }
        } catch (apiErr) {
            console.warn('API not available, using localStorage fallback:', apiErr.message);
        }

        // Always save to localStorage as backup
        saveToLocalStorage(bookingData);

        // Mark slot as pending in UI
        markSlotAsPending(BookingState.currentSlot);

        // Show pending receipt
        showPendingReceipt(bookingData, expiryTime);

        goToStep(3);

    } catch (err) {
        showToast('Error submitting booking. Please try again.', 'error');
        console.error(err);
    } finally {
        payBtn.disabled = false;
        if (payText) payText.textContent = 'Submit for Verification';
        if (spinner) spinner.classList.add('hidden');
    }
}

function saveToLocalStorage(bookingData) {
    // Save to all bookings list
    const bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('allBookings', JSON.stringify(bookings));

    // Save slot state for this date
    const allSlots = JSON.parse(localStorage.getItem('bookedSlots') || '{}');
    if (!allSlots[bookingData.date]) allSlots[bookingData.date] = {};
    allSlots[bookingData.date][bookingData.slotNumber] = 'pending';
    localStorage.setItem('bookedSlots', JSON.stringify(allSlots));
}

function markSlotAsPending(slotNum) {
    if (!BookingState.bookedSlots) BookingState.bookedSlots = {};
    BookingState.bookedSlots[slotNum] = 'pending';

    const statusEl = document.getElementById(`status-${slotNum}`);
    if (statusEl) {
        statusEl.className = 'slot-status pending';
        statusEl.innerHTML = '<i class="fas fa-hourglass-half"></i><span>Pending</span>';
    }
}

function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'CT-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function showPendingReceipt(bookingData, expiryTime) {
    const dateObj = new Date(bookingData.date + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('en-PK', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Fill receipt fields
    setEl('receipt-id', bookingData.bookingId);
    setEl('receipt-name', bookingData.userDetails.fullName);
    setEl('receipt-phone', bookingData.userDetails.phone);
    setEl('receipt-email', bookingData.userDetails.email);
    setEl('receipt-date', formatted);
    setEl('receipt-time', bookingData.time);
    setEl('receipt-players', bookingData.userDetails.players + ' Players');
    setEl('receipt-team', bookingData.userDetails.teamName || 'N/A');
    setEl('receipt-method',
        bookingData.paymentMethod.charAt(0).toUpperCase() +
        bookingData.paymentMethod.slice(1)
    );
    setEl('receipt-txn', bookingData.transactionId);
    setEl('receipt-amount', `₨${bookingData.expectedAmount.toLocaleString()}`);
    setEl('receipt-timestamp', new Date().toLocaleString('en-PK'));

    // Fill pending info section
    setEl('pending-id', bookingData.bookingId);
    setEl('pending-expiry',
        expiryTime.toLocaleTimeString('en-PK', {
            hour: '2-digit',
            minute: '2-digit'
        }) + ' today'
    );

    // Generate QR code
    generateQRCode(bookingData.bookingId);
}

function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function generateQRCode(bookingId) {
    const container = document.getElementById('qr-container');
    if (!container) return;

    container.innerHTML = '';

    try {
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: `CricTurf Booking: ${bookingId}`,
                width: 100,
                height: 100,
                colorDark: '#6c5ce7',
                colorLight: '#1a1a2e',
                correctLevel: QRCode.CorrectLevel.M
            });
        } else {
            container.innerHTML = `
                <div style="
                    width:100px;height:100px;
                    background:rgba(255,255,255,0.1);
                    border-radius:8px;
                    display:flex;align-items:center;
                    justify-content:center;
                    font-size:0.65rem;
                    color:rgba(255,255,255,0.5);
                    text-align:center;padding:5px;
                    font-family:monospace;
                ">${bookingId}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div style="font-size:0.7rem;padding:5px;font-family:monospace;">${bookingId}</div>`;
    }
}

function downloadReceipt() {
    const receiptEl = document.getElementById('receipt');
    if (!receiptEl) return;

    const bookingId = document.getElementById('receipt-id').textContent;
    const content = receiptEl.innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CricTurf-Receipt-${bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Receipt downloaded!', 'success');
}

function shareOnWhatsApp() {
    const bookingId = document.getElementById('receipt-id').textContent;
    const name = document.getElementById('receipt-name').textContent;
    const date = document.getElementById('receipt-date').textContent;
    const time = document.getElementById('receipt-time').textContent;
    const amount = document.getElementById('receipt-amount').textContent;
    const txn = document.getElementById('receipt-txn').textContent;

    const msg =
        `🏏 *CricTurf Booking Submitted*\n\n` +
        `📋 Booking ID: ${bookingId}\n` +
        `👤 Name: ${name}\n` +
        `📅 Date: ${date}\n` +
        `⏰ Time: ${time}\n` +
        `💰 Amount: ${amount}\n` +
        `🔖 TXN ID: ${txn}\n\n` +
        `⏳ Status: PENDING VERIFICATION\n` +
        `Admin will verify your payment shortly.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
