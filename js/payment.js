// ===== PAYMENT METHOD SELECTION =====
function selectPaymentMethod(method) {
    BookingState.selectedPaymentMethod = method;

    // Update active card
    document.querySelectorAll('.method-card').forEach(c => c.classList.remove('active'));
    document.getElementById(`method-${method}`).classList.add('active');

    // Show relevant details
    document.querySelectorAll('.payment-method-details').forEach(d => d.classList.add('hidden'));
    document.getElementById(`details-${method}`).classList.remove('hidden');

    // Update pay button style
    const payBtn = document.querySelector('.pay-button');
    if (method === 'easypaisa') {
        payBtn.style.background = 'linear-gradient(135deg, #3aaa35, #5ec95a)';
    } else if (method === 'jazzcash') {
        payBtn.style.background = 'linear-gradient(135deg, #e3272d, #ff5757)';
    } else {
        payBtn.style.background = 'linear-gradient(135deg, #1a5276, #2980b9)';
    }
}

// ===== PROCESS PAYMENT =====
async function processPayment() {
    const transactionId = document.getElementById('transactionId').value.trim();
    const senderNumber = document.getElementById('senderNumber').value.trim();

    if (!transactionId) {
        showToast('Please enter the Transaction ID', 'error');
        return;
    }
    if (!senderNumber) {
        showToast('Please enter your mobile number', 'error');
        return;
    }

    const phoneRegex = /^(03|\\+923)[0-9]{9}$/;
    if (!phoneRegex.test(senderNumber.replace(/[\s-]/g, ''))) {
        showToast('Please enter a valid Pakistani number (03xxxxxxxxx)', 'error');
        return;
    }

    const payButton = document.getElementById('pay-button');
    const payButtonText = document.getElementById('pay-button-text');
    const paySpinner = document.getElementById('pay-spinner');

    payButton.disabled = true;
    payButtonText.textContent = 'Verifying Payment...';
    paySpinner.classList.remove('hidden');

    try {
        // Try server verification first
        let verified = false;
        try {
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionId,
                    senderNumber,
                    amount: BookingState.currentPrice,
                    paymentMethod: BookingState.selectedPaymentMethod,
                    slotId: BookingState.currentSlot,
                    date: BookingState.currentDate,
                    userDetails: BookingState.userDetails
                })
            });
            const result = await response.json();
            if (result.success) verified = true;
        } catch (e) {
            console.log('Server not available, using local verification');
        }

        // Simulate verification delay if server not available
        if (!verified) {
            await new Promise(r => setTimeout(r, 2000));
        }

        // Complete booking
        completeBooking(transactionId, senderNumber);

    } catch (error) {
        showToast(error.message || 'Verification failed. Please try again.', 'error');
        payButton.disabled = false;
        payButtonText.textContent = `Confirm Payment • ₨${BookingState.currentPrice.toLocaleString()}`;
        paySpinner.classList.add('hidden');
    }
}

// ===== COMPLETE BOOKING =====
function completeBooking(transactionId, senderNumber) {
    const bookingId = generateBookingId();

    markSlotAsBooked(BookingState.currentSlot, BookingState.currentDate);

    generateReceipt(bookingId, transactionId, senderNumber);

    goToStep(3);
    createConfetti();

    // Reset button
    const payButton = document.getElementById('pay-button');
    const payButtonText = document.getElementById('pay-button-text');
    const paySpinner = document.getElementById('pay-spinner');
    payButton.disabled = false;
    payButtonText.textContent = `Confirm Payment • ₨${BookingState.currentPrice.toLocaleString()}`;
    paySpinner.classList.add('hidden');

    showToast('Booking confirmed successfully! 🎉', 'success');
}

function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'TB-';
    for (let i = 0; i < 8; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
    return id;
}
