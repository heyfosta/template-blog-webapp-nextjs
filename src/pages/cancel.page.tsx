// src\pages\cancel.page.tsx
import { useRouter } from "next/router"

export default function CancelPage() {
  const router = useRouter()

  return (
    <div>
      <h1>Subscription Canceled</h1>
      <p>Your subscription has been successfully canceled.</p>
      <p>You can continue using the bot with the Premium subscription until the end of your current billing period.</p>
      <p>If you change your mind, you can always resubscribe through the Telegram bot.</p>
    </div>
  )
}