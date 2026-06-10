// ===== STRIPE CONFIGURATION =====
// Replace with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY';

let stripe = null;
window.cardElement = null;

// ===== INITIALIZE STRIPE ELEMENTS =====
function initStripeElements() {
    if (window.cardElement) {
        window.cardElement.destroy();
        window.cardElement = null;
    }

    try {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const elements = stripe.elements();

        const style = {
            base: {
                color: '#ffffff',
                fontFamily: '"Inter", sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': { color: 'rgba(255, 255, 255, 0.4)' }
            },
            invalid: { color: '#e17055', iconColor: '#e17055' }
        };

        window.cardElement = elements.create('card', { style });
        window.cardElement.mount('#card-element');

        window.cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            displayError.textContent = event.error ? event.error.message : '';
        });
    } catch (error) {
        console.log('Stripe initialization - using demo mode:', error.message);
    }
}

// ===== PROCESS PAYMENT =====
async function processPayment() {
    const payButton = document.getElementById('pay-button');
    const payButtonText = document.getElementById('pay-button-text');
    const paySpinner = document.getElementById('pay-spinner');

    payButton.disabled = true;
    payButtonText.textContent = 'Processing...';
    paySpinner.classList.remove('hidden');

    try {
        if (stripe && window.cardElement && STRIPE_PUBLISHABLE_KEY !== 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY') {
            // ===== REAL STRIPE PAYMENT FLOW =====
            
            // Convert PKR to smallest unit (paisa)
            const amountInPaisa = BookingState.currentPrice * 100;
            
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountInPaisa,
                    currency: 'pkr',
                    slotId: BookingState.currentSlot,
                    date: BookingState.currentDate,
                    userDetails: BookingState.userDetails
                })
            });

            const { clientSecret, error: serverError } = await response.json();

            if (serverError) throw new Error(serverError);

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: window.cardElement,
                    billing_details: {
                        name: BookingState.userDetails.fullName,
                        email: BookingState.userDetails.email,
                        phone: BookingState.userDetails.phone
                    }
                }
            });

            if (error) throw new Error(error.message);

            if (paymentIntent.status === 'succeeded') {
                await fetch('/api/confirm-booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        slotId: BookingState.currentSlot,
                        date: BookingState.currentDate,
                        userDetails: BookingState.userDetails
                    })
                });

                completeBooking(paymentIntent.id);
            }
        } else {
            // ===== DEMO MODE =====
            console.log('Running in demo mode - simulating payment');
            console.log(`Processing ₨${BookingState.currentPrice.toLocaleString()} PKR`);
            
            await new Promise((resolve) => setTimeout(resolve, 2500));
            
            const demoPaymentId = 'demo_' + generateBookingId();
            completeBooking(demoPaymentId);
        }
    } catch (error) {
        showToast(error.message || 'Payment failed. Please try again.', 'error');
        payButton.disabled = false;
        payButtonText.textContent = `Pay ₨${BookingState.currentPrice.toLocaleString()}`;
        paySpinner.classList.add('hidden');
    }
}

// ===== COMPLETE BOOKING =====
function completeBooking(paymentId) {
    const bookingId = generateBookingId();

    markSlotAsBooked(BookingState.currentSlot, BookingState.currentDate);
    generateReceipt(bookingId, paymentId);
    goToStep(3);
    createConfetti();

    const payButton = document.getElementById('pay-button');
    const payButtonText = document.getElementById('pay-button-text');
    const paySpinner = document.getElementById('pay-spinner');
    payButton.disabled = false;
    payButtonText.textContent = `Pay ₨${BookingState.currentPrice.toLocaleString()}`;
    paySpinner.classList.add('hidden');

    showToast('Booking confirmed successfully! 🎉', 'success');
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
