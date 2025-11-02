"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardHeader() {
  return (
    <div className="mb-6 flex items-center justify-end gap-2 border-b border-[hsl(var(--border))] pb-4">
      <ThemeToggle />
      <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
        Sign out
      </Button>
    </div>
  )
}
