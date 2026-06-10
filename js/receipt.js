function generateReceipt(bookingId, transactionId, senderNumber) {
    const fDate = new Date(BookingState.currentDate).toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    const methodNames = { easypaisa: 'Easypaisa', jazzcash: 'JazzCash', bank: 'Bank Transfer' };

    document.getElementById('receipt-id').textContent = bookingId;
    document.getElementById('receipt-name').textContent = BookingState.userDetails.fullName;
    document.getElementById('receipt-phone').textContent = BookingState.userDetails.phone;
    document.getElementById('receipt-email').textContent = BookingState.userDetails.email;
    document.getElementById('receipt-date').textContent = fDate;
    document.getElementById('receipt-time').textContent = BookingState.currentTime;
    document.getElementById('receipt-players').textContent = BookingState.userDetails.players + ' Players';
    document.getElementById('receipt-team').textContent = BookingState.userDetails.teamName || 'N/A';
    document.getElementById('receipt-method').textContent = methodNames[BookingState.selectedPaymentMethod];
    document.getElementById('receipt-txn').textContent = transactionId;
    document.getElementById('receipt-amount').textContent = `₨${BookingState.currentPrice.toLocaleString()}`;
    document.getElementById('receipt-timestamp').textContent = 'Generated: ' + new Date().toLocaleString('en-PK');

    generateQRCode(bookingId);
}

function generateQRCode(data) {
    const qr = document.getElementById('qr-code');
    qr.innerHTML = '';
    const canvas = document.createElement('canvas');
    const size = 84; canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const seed = hashCode(data);
    const grid = 12, cell = size/grid;

    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,size,size);
    ctx.fillStyle = '#0a0a1a';
    drawCorner(ctx,0,0,cell,3);
    drawCorner(ctx,(grid-3)*cell,0,cell,3);
    drawCorner(ctx,0,(grid-3)*cell,cell,3);

    let rng = seed;
    for (let y=0;y<grid;y++) for (let x=0;x<grid;x++) {
        if ((x<4&&y<4)||(x>=grid-4&&y<4)||(x<4&&y>=grid-4)) continue;
        rng=(rng*1103515245+12345)&0x7fffffff;
        if (rng%3!==0) ctx.fillRect(x*cell,y*cell,cell,cell);
    }
    qr.appendChild(canvas);
}

function drawCorner(ctx,x,y,cell,s) {
    const sz=s*cell;
    ctx.fillRect(x,y,sz,sz);
    ctx.fillStyle='#fff';
    ctx.fillRect(x+cell,y+cell,sz-2*cell,sz-2*cell);
    ctx.fillStyle='#0a0a1a';
    ctx.fillRect(x+cell,y+cell,cell,cell);
}

function hashCode(s) {
    let h=0;
    for (let i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(i)&0xffffffff;
    return Math.abs(h);
}

function downloadReceipt() {
    const methodNames = { easypaisa: 'Easypaisa', jazzcash: 'JazzCash', bank: 'Bank Transfer' };
    const text = `
═══════════════════════════════════════════
                TURFBOOK
          Booking Confirmation 🇵🇰
═══════════════════════════════════════════

Booking ID: ${document.getElementById('receipt-id').textContent}

────────────────────────────────────────────
BOOKING DETAILS
────────────────────────────────────────────

Name:      ${document.getElementById('receipt-name').textContent}
Phone:     ${document.getElementById('receipt-phone').textContent}
Email:     ${document.getElementById('receipt-email').textContent}
Date:      ${document.getElementById('receipt-date').textContent}
Time:      ${document.getElementById('receipt-time').textContent}
Players:   ${document.getElementById('receipt-players').textContent}
Team:      ${document.getElementById('receipt-team').textContent}

────────────────────────────────────────────
PAYMENT DETAILS (PKR)
────────────────────────────────────────────

Method:      ${document.getElementById('receipt-method').textContent}
TXN ID:      ${document.getElementById('receipt-txn').textContent}
Amount Paid: ${document.getElementById('receipt-amount').textContent}
Status:      CONFIRMED ✓

────────────────────────────────────────────

${document.getElementById('receipt-timestamp').textContent}

Show this receipt at the venue.
Thank you for booking with TurfBook!

═══════════════════════════════════════════`.trim();

    const blob = new Blob([text], {type:'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `TurfBook-${document.getElementById('receipt-id').textContent}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Receipt downloaded!','success');
}

function shareOnWhatsApp() {
    const id = document.getElementById('receipt-id').textContent;
    const time = document.getElementById('receipt-time').textContent;
    const date = document.getElementById('receipt-date').textContent;
    const amount = document.getElementById('receipt-amount').textContent;
    const method = document.getElementById('receipt-method').textContent;

    const msg = encodeURIComponent(
        `⚽ *TurfBook Booking Confirmed!*\n\n` +
        `📋 Booking ID: ${id}\n` +
        `📅 Date: ${date}\n` +
        `⏰ Time: ${time}\n` +
        `💰 Amount: ${amount}\n` +
        `💳 Paid via: ${method}\n\n` +
        `✅ See you at the turf! 🏟️`
    );

    window.open(`https://wa.me/?text=${msg}`, '_blank');
}
