//
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { user_id, model_id } = req.body

    if (!user_id || !model_id) {
      return res.status(400).json({ error: 'Missing user_id or model_id' })
    }

    try {
      // First, check the current subscription status
      const { data: currentSub, error: fetchError } = await supabase
        .from('subscriptions')
        .select('subscription_type, stripe_subscription_id')
        .eq('user_id', user_id)
        .eq('model_id', model_id)
        .single()

      if (fetchError) throw fetchError

      if (currentSub?.subscription_type !== 'premium' && currentSub?.subscription_type !== 'ultra') {
        return res.status(400).json({ error: 'No active premium or ultra subscription found' })
      }

      // Cancel the subscription in Stripe
      if (currentSub.stripe_subscription_id) {
        await stripe.subscriptions.update(currentSub.stripe_subscription_id, {
          cancel_at_period_end: true
        })
      }

      // Update the subscription status in Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          subscription_type: 'cancelling',
          cancel_at_period_end: true
        })
        .eq('user_id', user_id)
        .eq('model_id', model_id)

      if (error) throw error

      res.status(200).json({ message: 'Subscription cancellation initiated successfully', data })
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      res.status(500).json({ error: 'Failed to cancel subscription' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}