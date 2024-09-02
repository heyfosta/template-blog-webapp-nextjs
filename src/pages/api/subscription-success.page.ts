// src/pages/api/subscription-success.page.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { user_id, model_id, session_id } = req.query

    if (!user_id || !model_id || !session_id) {
      return res.status(400).json({ error: 'Missing user_id, model_id, or session_id' })
    }

    try {
      // Retrieve the session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id as string)

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: 'Payment not completed' })
      }

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

      // Determine the expected subscription type based on the product
      let expectedSubscriptionType = 'default'
      if (subscription.items.data[0].price.product === process.env.STRIPE_PREMIUM_PRODUCT_ID) {
        expectedSubscriptionType = 'premium'
      } else if (subscription.items.data[0].price.product === process.env.STRIPE_ULTRA_PRODUCT_ID) {
        expectedSubscriptionType = 'ultra'
      }

      // Instead of updating Supabase here, just return the expected subscription type
      res.status(200).json({ 
        message: 'Payment successful! Your subscription is being processed.',
        expectedSubscriptionType: expectedSubscriptionType
      })
    } catch (error) {
      console.error('Error processing success:', error)
      res.status(500).json({ error: 'Failed to process success' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}