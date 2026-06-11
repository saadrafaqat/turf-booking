export async function onRequestPost(context) {
    try {
        const { password } = await context.request.json();
        const kv = context.env.BOOKINGS_KV;
        
        // Extra security: require password confirmation
        if (password !== 'cricturf2024') {
            return jsonResponse({ error: 'Invalid password' }, 401);
        }
        
        if (!kv) return jsonResponse({ error: 'KV not bound' }, 500);
        
        // Clear all bookings
        await kv.put('all_bookings', JSON.stringify([]));
        
        return jsonResponse({ success: true, message: 'All bookings deleted' });
    } catch (err) {
        return jsonResponse({ error: err.message }, 500);
    }
}

function jsonResponse(data, status=200) {
    return new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json'} });
}
