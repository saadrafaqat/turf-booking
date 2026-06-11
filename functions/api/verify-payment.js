export async function onRequestPost(context) {
    // This is the same as confirm-booking.js (duplicate endpoint for compatibility)
    // Some setups call this instead of confirm-booking
    
    try {
        const { bookingId, action } = await context.request.json();
        const kv = context.env.BOOKINGS_KV;
        
        if (!bookingId || !['confirmed','rejected'].includes(action))
            return jsonResponse({ error:'Invalid' }, 400);
        if (!kv) return jsonResponse({ error:'KV not bound' }, 500);
        
        let all = JSON.parse(await kv.get('all_bookings') || '[]');
        const idx = all.findIndex(b => b.bookingId === bookingId);
        
        if (idx === -1) return jsonResponse({ error:'Not found' }, 404);
        
        all[idx].status = action;
        all[idx].verifiedAt = new Date().toISOString();
        
        await kv.put('all_bookings', JSON.stringify(all));
        
        return jsonResponse({ success:true, action });
    } catch (err) {
        return jsonResponse({ error:err.message }, 500);
    }
}
function JsonResponse(data, status=200) {
    return new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json'} });
}
