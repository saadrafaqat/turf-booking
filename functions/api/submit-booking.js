export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const kv = context.env.BOOKINGS_KV;
        
        if (!kv) return jsonResponse({ error: 'BOOKINGS_KV binding missing' }, 500);
        if (!body.bookingId || !body.transactionId) return jsonResponse({ error: 'Missing fields' }, 400);
        
        let all = JSON.parse(await kv.get('all_bookings') || '[]');
        
        // Check duplicate txn
        if (all.find(b => b.transactionId === body.transactionId)) {
            return jsonResponse({ error: 'Transaction ID already used' }, 400);
        }
        // Check slot availability
        if (all.find(b => b.date===body.date && b.turfNumber===body.turfNumber && b.slotNumber===body.slotNumber && b.status==='confirmed')) {
            return jsonResponse({ error: 'Slot already booked' }, 400);
        }
        
        all.push(body);
        await kv.put('all_bookings', JSON.stringify(all));
        
        return jsonResponse({ success: true, bookingId: body.bookingId });
    } catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}
function jsonResponse(data, status=200) {
    return new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json'} });
}
