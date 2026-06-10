export async function onRequestGet(context) {
    const { request, env } = context;
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

    try {
        const url = new URL(request.url);
        const date = url.searchParams.get('date');
        if (!date) return new Response(JSON.stringify({ error: 'Date required' }), { status: 400, headers });

        const slots = [
            { id: 1, name: 'Morning Session', time: '6:00 AM - 8:00 AM', price: 1000, available: true },
            { id: 2, name: 'Afternoon Session', time: '2:00 PM - 4:00 PM', price: 1500, available: true },
            { id: 3, name: 'Evening Session', time: '6:00 PM - 8:00 PM', price: 2000, available: true },
            { id: 4, name: 'Night Session', time: '8:00 PM - 10:00 PM', price: 2000, available: true }
        ];

        if (env.BOOKINGS) {
            for (const slot of slots) {
                const existing = await env.BOOKINGS.get(`booking:${date}:${slot.id}`);
                if (existing) slot.available = false;
            }
        }

        return new Response(JSON.stringify({ slots, date, currency: 'PKR' }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
