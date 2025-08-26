import stripe from '../config/stripe.js';

import asyncHandler from 'express-async-handler';

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { cartItems, phone } = req.body;

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: item.description,
      },
      unit_amount: Math.round(item.totalPrice * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: req.body.email, // اختياري
    metadata: {
      phone: phone,
    },
    success_url: `${process.env.CLIENT_URL}/success`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
  });

  res.status(200).json({ url: session.url });
});
