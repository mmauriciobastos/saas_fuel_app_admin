"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardHeader() {
  const { data: session } = useSession()
  const companyName = (session?.user as any)?.company?.name

  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
      <div className="flex-1">
        {companyName && (
          <h2 className="text-lg font-semibold text-foreground">{companyName}</h2>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </Button>
      </div>
    </div>
  )
}
