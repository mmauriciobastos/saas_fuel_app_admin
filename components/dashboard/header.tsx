"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <div className="mb-6 flex items-center justify-end border-b border-[hsl(var(--border))] pb-4">
      <Button
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </Button>
    </div>
  )
}
