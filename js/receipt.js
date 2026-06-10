// ===== GENERATE RECEIPT =====
function generateReceipt(bookingId, paymentId) {
    const formattedDate = new Date(BookingState.currentDate).toLocaleDateString('en-PK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('receipt-id').textContent = bookingId;
    document.getElementById('receipt-name').textContent = BookingState.userDetails.fullName;
    document.getElementById('receipt-email').textContent = BookingState.userDetails.email;
    document.getElementById('receipt-phone').textContent = BookingState.userDetails.phone;
    document.getElementById('receipt-date').textContent = formattedDate;
    document.getElementById('receipt-time').textContent = BookingState.currentTime;
    document.getElementById('receipt-players').textContent = BookingState.userDetails.players + ' Players';
    document.getElementById('receipt-team').textContent = BookingState.userDetails.teamName || 'N/A';
    document.getElementById('receipt-amount').textContent = `₨${BookingState.currentPrice.toLocaleString()}`;
    document.getElementById('receipt-timestamp').textContent = 'Generated: ' + new Date().toLocaleString('en-PK');

    generateQRCode(bookingId);
}

// ===== SIMPLE QR CODE GENERATOR =====
function generateQRCode(data) {
    const qrContainer = document.getElementById('qr-code');
    qrContainer.innerHTML = '';

    const canvas = document.createElement('canvas');
    const size = 84;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const seed = hashCode(data);
    const gridSize = 12;
    const cellSize = size / gridSize;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0a0a1a';

    drawCornerMarker(ctx, 0, 0, cellSize, 3);
    drawCornerMarker(ctx, (gridSize - 3) * cellSize, 0, cellSize, 3);
    drawCornerMarker(ctx, 0, (gridSize - 3) * cellSize, cellSize, 3);

    let rng = seed;
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if ((x < 4 && y < 4) || (x >= gridSize - 4 && y < 4) || (x < 4 && y >= gridSize - 4)) continue;
            rng = (rng * 1103515245 + 12345) & 0x7fffffff;
            if (rng % 3 !== 0) {
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    qrContainer.appendChild(canvas);
}

function drawCornerMarker(ctx, x, y, cellSize, markerSize) {
    const s = markerSize * cellSize;
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + cellSize, y + cellSize, s - 2 * cellSize, s - 2 * cellSize);
    ctx.fillStyle = '#0a0a1a';
    if (markerSize >= 3) {
        ctx.fillRect(x + cellSize * 1, y + cellSize * 1, cellSize, cellSize);
    }
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

// ===== DOWNLOAD RECEIPT =====
function downloadReceipt() {
    const receiptText = `
═══════════════════════════════════════════
                TURFBOOK
          Booking Confirmation
═══════════════════════════════════════════

Booking ID: ${document.getElementById('receipt-id').textContent}

────────────────────────────────────────────
BOOKING DETAILS
────────────────────────────────────────────

Name:      ${document.getElementById('receipt-name').textContent}
Email:     ${document.getElementById('receipt-email').textContent}
Phone:     ${document.getElementById('receipt-phone').textContent}
Date:      ${document.getElementById('receipt-date').textContent}
Time:      ${document.getElementById('receipt-time').textContent}
Players:   ${document.getElementById('receipt-players').textContent}
Team:      ${document.getElementById('receipt-team').textContent}

────────────────────────────────────────────
PAYMENT (PKR)
────────────────────────────────────────────

Amount Paid: ${document.getElementById('receipt-amount').textContent}
Currency:    Pakistani Rupee (PKR)
Status:      CONFIRMED ✓

────────────────────────────────────────────

${document.getElementById('receipt-timestamp').textContent}

Please show this receipt at the venue.
Thank you for booking with TurfBook! 🇵🇰

═══════════════════════════════════════════
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TurfBook-Receipt-${document.getElementById('receipt-id').textContent}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Receipt downloaded successfully!', 'success');
}

// ===== SHARE RECEIPT =====
function shareReceipt() {
    const bookingId = document.getElementById('receipt-id').textContent;
    const time = document.getElementById('receipt-time').textContent;
    const date = document.getElementById('receipt-date').textContent;
    const amount = document.getElementById('receipt-amount').textContent;

    const shareText = `🏟️ TurfBook Booking Confirmed!\n\n📋 Booking ID: ${bookingId}\n📅 Date: ${date}\n⏰ Time: ${time}\n💰 Amount: ${amount}\n\n✅ See you at the turf!`;

    if (navigator.share) {
        navigator.share({
            title: 'TurfBook Booking Confirmation',
            text: shareText
        }).catch(() => {
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Booking details copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Could not share. Please take a screenshot.', 'error');
    });
}
