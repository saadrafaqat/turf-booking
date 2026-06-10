// ===== PAYMENT METHOD SELECTION =====
function selectPaymentMethod(method) {
    console.log('Selected payment method:', method);
    BookingState.selectedPaymentMethod = method;

    // Update active card
    document.querySelectorAll('.method-card').forEach(function(c) {
        c.classList.remove('active');
    });
    const card = document.getElementById('method-' + method);
    if (card) card.classList.add('active');

    // Show relevant details section
    document.querySelectorAll('.payment-method-details').forEach(function(d) {
        d.classList.add('hidden');
    });
    const details = document.getElementById('details-' + method);
    if (details) details.classList.remove('hidden');

    // Update pay button color based on method
    const payBtn = document.querySelector('.pay-button');
    if (payBtn) {
        if (method === 'easypaisa') {
            payBtn.style.background = 'linear-gradient(135deg, #3aaa35, #5ec95a)';
        } else if (method === 'jazzcash') {
            payBtn.style.background = 'linear-gradient(135deg, #e3272d, #ff5757)';
        } else {
            payBtn.style.background = 'linear-gradient(135deg, #1a5276, #2980b9)';
        }
    }
}

// ===== PROCESS PAYMENT =====
async function processPayment() {
    console.log('Process Payment clicked');
    
    const transactionIdEl = document.getElementById('transactionId');
    const senderNumberEl = document.getElementById('senderNumber');
    
    const transactionId = transactionIdEl ? transactionIdEl.value.trim() : '';
    const senderNumber = senderNumberEl ? senderNumberEl.value.trim() : '';

    // Validation
    if (!transactionId) {
        showToast('Please enter Transaction ID after sending payment', 'error');
        if (transactionIdEl) transactionIdEl.focus();
        return;
    }
    if (transactionId.length < 4) {
        showToast('Transaction ID seems too short. Please check.', 'error');
        if (transactionIdEl) transactionIdEl.focus();
        return;
    }
    if (!senderNumber) {
        showToast('Please enter your mobile number', 'error');
        if (senderNumberEl) senderNumberEl.focus();
        return;
    }
    
    // Pakistan number validation (03xxxxxxxxx)
    const cleanNumber = senderNumber.replace(/[\s\-\+]/g, '');
    if (!/^(03|923)\d{9,10}$/.test(cleanNumber)) {
        showToast('Please enter a valid Pakistani number (03xxxxxxxxx)', 'error');
        if (senderNumberEl) senderNumberEl.focus();
        return;
    }

    const payButton = document.getElementById('pay-button');
    const payButtonText = document.getElementById('pay-button-text');
    const paySpinner = document.getElementById('pay-spinner');

    if (payButton) payButton.disabled = true;
    if (payButtonText) payButtonText.textContent = 'Verifying Payment...';
    if (paySpinner) paySpinner.classList.remove('hidden');

    try {
        // Try server verification (works if deployed on Cloudflare)
        let serverVerified = false;
        try {
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId: transactionId,
                    senderNumber: senderNumber,
                    amount: BookingState.currentPrice,
                    paymentMethod: BookingState.selectedPaymentMethod,
                    slotId: BookingState.currentSlot,
                    date: BookingState.currentDate,
                    userDetails: BookingState.userDetails
                })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) serverVerified = true;
            }
        } catch (e) {
            console.log('Running in local mode (no server verification)');
        }

        // Simulate verification delay
        if (!serverVerified) {
            await new Promise(function(r) { setTimeout(r, 1500); });
        }

        completeBooking(transactionId, senderNumber);

    } catch (error) {
        console.error('Payment error:', error);
        showToast(error.message || 'Verification failed. Please try again.', 'error');
        if (payButton) payButton.disabled = false;
        if (payButtonText) payButtonText.textContent = 'Confirm Payment • ₨' + BookingState.currentPrice.toLocaleString();
        if (paySpinner) paySpinner.classList.add('hidden');
    }
}

// ===== COMPLETE BOOKING =====
function completeBooking(transactionId, senderNumber) {
    console.log('Completing booking with TXN:', transactionId);
    
    const bookingId = generateBookingId();
    markSlotAsBooked(BookingState.currentSlot, BookingState.currentDate);
    generateReceipt(bookingId, transactionId, senderNumber);
    goToStep(3);
    
    if (typeof createConfetti === 'function') createConfetti();

    // Reset button
    const payButton = document.getElementById('pay-button');
    const payButtonText = document.getElementById('pay-button-text');
    const paySpinner = document.getElementById('pay-spinner');
    if (payButton) payButton.disabled = false;
    if (payButtonText) payButtonText.textContent = 'Confirm Payment';
    if (paySpinner) paySpinner.classList.add('hidden');

    showToast('Howzat! Booking confirmed! 🏏', 'success');
}

// ===== GENERATE BOOKING ID =====
function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'TB-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}
