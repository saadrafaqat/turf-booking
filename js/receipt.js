// Receipt generation helper
function generateReceiptData(booking) {
    return {
        id: booking.bookingId,
        customer: booking.userDetails?.fullName || '-',
        phone: booking.userDetails?.phone || '-',
        email: booking.userDetails?.email || '-',
        team: booking.userDetails?.teamName || 'N/A',
        turf: `Turf ${booking.turfNumber}`,
        date: new Date(booking.date+'T00:00:00').toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'}),
        slot: booking.time,
        players: booking.userDetails?.players || '-',
        method: booking.paymentMethod,
        txn: booking.transactionId,
        amount: parseInt(booking.expectedAmount||0).toLocaleString(),
        status: booking.status || 'pending'
    };
}

console.log('[Receipt] Module loaded');
