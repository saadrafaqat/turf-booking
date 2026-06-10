// Cloudflare Pages Function - Confirm Booking

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
        const { paymentIntentId, slotId, date, userDetails } = body;

        if (!paymentIntentId || !slotId || !date) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers }
            );
        }

        if (env.STRIPE_SECRET_KEY) {
            const stripeResponse = await fetch(
                `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
                { headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` } }
            );

            const paymentIntent = await stripeResponse.json();

            if (paymentIntent.status !== 'succeeded') {
                return new Response(
                    JSON.stringify({ error: 'Payment not confirmed' }),
                    { status: 400, headers }
                );
            }
        }

        if (env.BOOKINGS) {
            const bookingKey = `booking:${date}:${slotId}`;
            const bookingData = {
                slotId,
                date,
                paymentIntentId,
                userDetails,
                bookedAt: new Date().toISOString(),
                bookingId: generateBookingId(),
                currency: 'PKR'
            };

            await env.BOOKINGS.put(bookingKey, JSON.stringify(bookingData), {
                expirationTtl: 86400 * 30
            });
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Booking confirmed' }),
            { status: 200, headers }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error: ' + error.message }),
            { status: 500, headers }
        );
    }
}

function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'TB-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
