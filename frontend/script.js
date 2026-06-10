// ========== STATE ==========
const API_BASE = 'http://127.0.0.1:5000/api';
let currentDate = new Date().toISOString().split('T')[0];
let selectedTurf = null;
let selectedSlot = null;

// ========== DOM REFS ==========
const dateInput = document.getElementById('booking-date');
const turfsContainer = document.getElementById('turfs-container');
const modal = document.getElementById('booking-modal');
const modalBody = document.getElementById('modal-body');
const modalSuccess = document.getElementById('modal-success');
const closeModal = document.getElementById('close-modal');
const closeSuccess = document.getElementById('close-success');
const bookingForm = document.getElementById('booking-form');
const slotInfoText = document.getElementById('modal-slot-info');
const displayAmount = document.getElementById('display-amount');

// ========== INIT ==========
dateInput.value = currentDate;
dateInput.addEventListener('change', () => {
  currentDate = dateInput.value;
  fetchAvailability();
});

closeModal.addEventListener('click', closeBookingModal);
closeSuccess.addEventListener('click', () => {
  closeBookingModal();
  fetchAvailability();
});

bookingForm.addEventListener('submit', handleBooking);

// Close modal on outside click
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeBookingModal();
});

// ========== FETCH AVAILABILITY ==========
async function fetchAvailability() {
  turfsContainer.innerHTML = '<div class="loading">Loading turfs</div>';

  try {
    const res = await fetch(`${API_BASE}/availability?date=${currentDate}`);
    const turfs = await res.json();
    renderTurfs(turfs);
  } catch (err) {
    turfsContainer.innerHTML = `
      <div class="error" style="text-align:center;padding:40px;color:var(--danger);">
        ⚠️ Could not load turfs. Make sure the backend is running.<br/>
        <small style="color:var(--text-muted);">${err.message}</small>
      </div>`;
  }
}

// ========== RENDER TURFS ==========
function renderTurfs(turfs) {
  turfsContainer.innerHTML = '';

  turfs.forEach(turf => {
    const card = document.createElement('div');
    card.className = 'turf-card glass';
    card.id = `turf-${turf.id}`;

    const slotsHtml = turf.slots.map(slot => {
      const priceClass = slot.is_morning ? 'morning' : '';
      const bookedClass = slot.booked ? 'booked' : '';
      const label = slot.is_morning ? '🌅 Morning Special' : '';
      return `
        <div class="slot-card ${bookedClass}" data-turf-id="${turf.id}" data-slot-id="${slot.id}" data-time="${slot.time_label}" data-price="${slot.price}" data-is-morning="${slot.is_morning}">
          <div class="time">${slot.time_label}</div>
          ${label ? `<div style="font-size:0.6rem;color:var(--warning);margin-bottom:2px;">${label}</div>` : ''}
          <div class="price ${priceClass}">Rs. ${slot.price.toLocaleString()}</div>
          <div class="booked-label">🔒 Booked</div>
          ${!slot.booked ? `<button class="book-btn">Book Now</button>` : ''}
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <h3>🏟️ ${turf.name}</h3>
      <div class="slots-container">${slotsHtml}</div>
    `;

    turfsContainer.appendChild(card);

    // Attach event listeners to slot cards
    card.querySelectorAll('.slot-card:not(.booked)').forEach(slotEl => {
      slotEl.addEventListener('click', (e) => {
        if (e.target.closest('.book-btn')) {
          openBookingModal(
            parseInt(slotEl.dataset.turfId),
            parseInt(slotEl.dataset.slotId),
            slotEl.dataset.time,
            parseInt(slotEl.dataset.price),
            slotEl.dataset.isMorning === 'true'
          );
        }
      });
    });
  });
}

// ========== OPEN MODAL ==========
function openBookingModal(turfId, slotId, timeLabel, price, isMorning) {
  selectedTurf = turfId;
  selectedSlot = slotId;

  document.getElementById('form-turf-id').value = turfId;
  document.getElementById('form-slot-id').value = slotId;
  document.getElementById('form-price').value = price;

  slotInfoText.textContent = `🕐 ${timeLabel} — ${isMorning ? '🌅 Morning' : 'Regular'} Slot`;
  displayAmount.innerHTML = `<strong>Amount: Rs. ${price.toLocaleString()}</strong>`;

  // Reset form
  bookingForm.reset();
  document.getElementById('form-turf-id').value = turfId;
  document.getElementById('form-slot-id').value = slotId;
  document.getElementById('form-price').value = price;

  modalBody.classList.remove('hidden');
  modalSuccess.classList.add('hidden');

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Focus first input
  setTimeout(() => document.getElementById('form-name').focus(), 300);
}

// ========== CLOSE MODAL ==========
function closeBookingModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  selectedTurf = null;
  selectedSlot = null;
}

// ========== HANDLE BOOKING ==========
async function handleBooking(e) {
  e.preventDefault();

  const name = document.getElementById('form-name').value.trim();
  const phone = document.getElementById('form-phone').value.trim();
  const email = document.getElementById('form-email').value.trim();
  const transactionId = document.getElementById('form-transaction-id').value.trim();
  const turfId = parseInt(document.getElementById('form-turf-id').value);
  const slotId = parseInt(document.getElementById('form-slot-id').value);

  if (!name || !phone || !transactionId) {
    alert('Please fill in all required fields.');
    return;
  }

  const submitBtn = document.getElementById('submit-booking');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Processing...';

  try {
    // Step 1: Verify transaction
    const verifyRes = await fetch(`${API_BASE}/verify_transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId })
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.valid) {
      alert('Invalid transaction ID. Please check and try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Confirm Booking';
      return;
    }

    // Step 2: Book the slot
    const bookRes = await fetch(`${API_BASE}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turf_id: turfId,
        slot_id: slotId,
        date: currentDate,
        name,
        phone,
        email,
        transaction_id: transactionId
      })
    });
    const bookData = await bookRes.json();

    if (bookData.success) {
      // Show success
      modalBody.classList.add('hidden');
      modalSuccess.classList.remove('hidden');
      document.getElementById('success-message').textContent = bookData.message;
    } else {
      alert(bookData.message);
      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Confirm Booking';
    }
  } catch (err) {
    alert('Something went wrong. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = '✅ Confirm Booking';
  }
}

// ========== START ==========
fetchAvailability();

// Auto-refresh every 30 seconds
setInterval(fetchAvailability, 30000);
