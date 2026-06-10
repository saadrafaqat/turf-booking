export async function onRequestPost(context) {
    const { request, env } = context;
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

    try {
        const body = await request.json();
        const { bookingId, slotId, date, transactionId, userDetails } = body;

        if (env.BOOKINGS) {
            const key = `booking:${date}:${slotId}`;
            const data = { bookingId, slotId, date, transactionId, userDetails, confirmedAt: new Date().toISOString() };
            await env.BOOKINGS.put(key, JSON.stringify(data), { expirationTtl: 86400 * 30 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
