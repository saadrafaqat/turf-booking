export async function onRequestPost(context) {
    try {
        const booking = await context.request.json();

        if (!booking.bookingId || !booking.transactionId || !booking.userDetails) {
            return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
        }

        const kv = context.env.BOOKINGS_KV;
        if (!kv) {
            return jsonResponse({ success: false, error: 'KV not configured. Bind BOOKINGS_KV in Cloudflare dashboard.' }, 500);
        }

        const existingRaw = await kv.get('all_bookings');
        let bookings = existingRaw ? JSON.parse(existingRaw) : [];

        // Check duplicate transaction
        if (bookings.find(b => b.transactionId === booking.transactionId)) {
            return jsonResponse({ success: false, error: 'This Transaction ID is already used' }, 400);
        }

        // Check slot already confirmed
        if (bookings.find(b =>
            b.date === booking.date &&
            b.turfNumber === booking.turfNumber &&
            b.slotNumber === booking.slotNumber &&
            b.status === 'confirmed'
        )) {
            return jsonResponse({ success: false, error: 'Slot already booked' }, 400);
        }

        bookings.push(booking);
        await kv.put('all_bookings', JSON.stringify(bookings));

        return jsonResponse({ success: true, bookingId: booking.bookingId });

    } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
    }
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}
