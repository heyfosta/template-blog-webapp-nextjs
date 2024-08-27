//src\pages\api\subscription-success.page.ts
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

      // Update the subscription in Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user_id,
          model_id: model_id,
          subscription_type: 'premium',
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false
        }, {
          onConflict: 'user_id,model_id'
        })

      if (error) throw error

      res.status(200).json({ message: 'Subscription updated successfully', data })
    } catch (error) {
      console.error('Error updating subscription:', error)
      res.status(500).json({ error: 'Failed to update subscription' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}