export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const paramDate = url.searchParams.get('date');
        const kv = context.env.BOOKINGS_KV;
        
        const states = {};
        let bookings = [];
        
        if (kv) {
            bookings = JSON.parse(await kv.get('all_bookings') || '[]');
        }
        
        if (paramDate && paramDate !== 'all') {
            bookings = bookings.filter(b => b.date === paramDate);
        }
        
        bookings.forEach(b => {
            const key = `${b.turfNumber}-${b.slotNumber}`;
            if (b.status === 'confirmed') states[key] = 'confirmed';
            else if (b.status === 'pending' && !states[key]) states[key] = 'pending';
        });
        
        return jsonResponse({ states, count: bookings.length, bookings: paramDate==='all'?bookings:void 0 });
    } catch (err) {
        return jsonResponse({ states:{}, error:err.message }, 200);
    }
}
function jsonResponse(data, status=200) {
    return new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json'} });
}
