"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

export function PresenceHeartbeat() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return

    const sendPing = async () => {
      try {
        await fetch("/api/presence", {
          method: "POST",
        })
      } catch (error) {
        console.error("Erro no heartbeat de presença:", error)
      }
    }

    sendPing() // Envia logo ao carregar
    const interval = setInterval(sendPing, 30000) // Repete a cada 30 segundos

    return () => clearInterval(interval)
  }, [session])

  return null
}
