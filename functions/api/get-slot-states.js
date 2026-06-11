export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const date = url.searchParams.get('date');

        if (!date) return jsonResponse({ slots: {} }, 200);

        const kv = context.env.BOOKINGS_KV;
        if (!kv) return jsonResponse({ slots: {} }, 200);

        const raw = await kv.get('all_bookings');
        const bookings = raw ? JSON.parse(raw) : [];

        const dateBookings = bookings.filter(b => b.date === date);
        const slots = {};

        dateBookings.forEach(b => {
            const key = `${b.turfNumber}-${b.slotNumber}`;
            if (b.status === 'confirmed') {
                slots[key] = 'confirmed';
            } else if (b.status === 'pending' && slots[key] !== 'confirmed') {
                slots[key] = 'pending';
            }
        });

        return jsonResponse({ date, slots });

    } catch (err) {
        return jsonResponse({ slots: {}, error: err.message }, 200);
    }
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}
