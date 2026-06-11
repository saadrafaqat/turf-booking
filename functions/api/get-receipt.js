export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get('id');
        const kv = context.env.BOOKINGS_KV;
        
        if (!id) return jsonResponse({ success:false, error:'No ID' }, 400);
        if (!kv) return jsonResponse({ success:false, error:'KV not bound' }, 500);
        
        const all = JSON.parse(await kv.get('all_bookings') || '[]');
        const found = all.find(b => b.bookingId === id);
        
        if (!found) return jsonResponse({ success:false, error:'Not found' }, 404);
        
        return jsonResponse({ success:true, booking:found });
    } catch (err) {
        return jsonResponse({ success:false, error:err.message }, 500);
    }
}
function jsonResponse(data, status=200) {
    return new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json'} });
}
