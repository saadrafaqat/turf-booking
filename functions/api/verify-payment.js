export async function onRequestPost(context) {
    const { request, env } = context;
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    try {
        const body = await request.json();
        const { transactionId, senderNumber, amount, paymentMethod, slotId, date, userDetails } = body;

        if (!transactionId || !senderNumber || !slotId || !date) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers });
        }

        // Validate prices
        const validPrices = { 1: 1000, 2: 1500, 3: 2000, 4: 2000 };
        if (validPrices[slotId] !== amount) {
            return new Response(JSON.stringify({ error: 'Invalid price' }), { status: 400, headers });
        }

        // Check if already booked (KV)
        if (env.BOOKINGS) {
            const key = `booking:${date}:${slotId}`;
            const existing = await env.BOOKINGS.get(key);
            if (existing) {
                return new Response(JSON.stringify({ error: 'Slot already booked' }), { status: 409, headers });
            }

            // Save booking
            const bookingData = {
                slotId, date, transactionId, senderNumber,
                paymentMethod, amount, userDetails,
                bookedAt: new Date().toISOString(),
                bookingId: 'TB-' + Math.random().toString(36).substr(2, 8).toUpperCase()
            };
            await env.BOOKINGS.put(key, JSON.stringify(bookingData), { expirationTtl: 86400 * 30 });

            // Also save TXN for reference
            await env.BOOKINGS.put(`txn:${transactionId}`, JSON.stringify(bookingData), { expirationTtl: 86400 * 30 });
        }

        // TODO: Add actual Easypaisa/JazzCash API verification here
        // For Easypaisa: Use their merchant API to verify TXN
        // For JazzCash: Use their payment verification API

        return new Response(JSON.stringify({ success: true, message: 'Payment verified and booking confirmed' }), { status: 200, headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
    });
}
