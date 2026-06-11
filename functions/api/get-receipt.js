export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonResponse({ success: false, error: 'No booking ID' }, 400);

        const kv = context.env.BOOKINGS_KV;
        if (!kv) return jsonResponse({ success: false, error: 'KV not configured' }, 500);

        const raw = await kv.get('all_bookings');
        if (!raw) return jsonResponse({ success: false, error: 'Booking not found' }, 404);

        const bookings = JSON.parse(raw);
        const booking = bookings.find(b => b.bookingId === id);

        if (!booking) return jsonResponse({ success: false, error: 'Booking not found' }, 404);

        return jsonResponse({ success: true, booking });

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
