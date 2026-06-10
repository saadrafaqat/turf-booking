// Cloudflare Pages Function - Create Payment Intent
// Set STRIPE_SECRET_KEY in Cloudflare Pages environment variables

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
        const { amount, currency = 'pkr', slotId, date, userDetails } = body;

        if (!amount || !slotId || !date) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers }
            );
        }

        // Validate prices (in paisa - smallest PKR unit)
        const validPrices = {
            1: 100000,  // ₨1,000 = 100000 paisa
            2: 150000,  // ₨1,500 = 150000 paisa
            3: 200000,  // ₨2,000 = 200000 paisa
            4: 200000   // ₨2,000 = 200000 paisa
        };

        if (validPrices[slotId] !== amount) {
            return new Response(
                JSON.stringify({ error: 'Invalid price for selected slot' }),
                { status: 400, headers }
            );
        }

        // Check KV for already booked
        if (env.BOOKINGS) {
            const bookingKey = `booking:${date}:${slotId}`;
            const existingBooking = await env.BOOKINGS.get(bookingKey);
            if (existingBooking) {
                return new Response(
                    JSON.stringify({ error: 'This slot is already booked for this date' }),
                    { status: 409, headers }
                );
            }
        }

        // Create Stripe Payment Intent in PKR
        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                amount: amount.toString(),
                currency: 'pkr',
                'metadata[slotId]': slotId.toString(),
                'metadata[date]': date,
                'metadata[customerName]': userDetails?.fullName || '',
                'metadata[customerEmail]': userDetails?.email || '',
                'metadata[customerPhone]': userDetails?.phone || ''
            }).toString()
        });

        const paymentIntent = await stripeResponse.json();

        if (paymentIntent.error) {
            return new Response(
                JSON.stringify({ error: paymentIntent.error.message }),
                { status: 400, headers }
            );
        }

        return new Response(
            JSON.stringify({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }),
            { status: 200, headers }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal server error: ' + error.message }),
            { status: 500, headers }
        );
    }
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
