import { Badge } from "@/components/ui/badge"
import { BadgeCheck } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

type Order = {
  "@id": string
  id: number
  fuelAmount: string
  deliveryAddress: string
  status: string
  notes?: string
  createdAt: string
  deliveredAt?: string
}

type OrdersResponse = {
  member: Order[]
  totalItems: number
  view?: {
    "@id": string
    first?: string
    last?: string
    next?: string
    previous?: string
  }
}

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

function formatDate(value?: string) {
  if (!value) return "—"
  try {
    const d = new Date(value)
    return d.toLocaleDateString()
  } catch {
    return value
  }
}

function getPageFromUrl(url?: string): number | undefined {
  if (!url) return undefined
  try {
    const u = new URL(url, "http://dummy")
    const p = u.searchParams.get("page")
    return p ? Number(p) : undefined
  } catch {
    // If API returns relative like /api/orders?page=2
    try {
      const qIndex = url.indexOf("?")
      if (qIndex !== -1) {
        const params = new URLSearchParams(url.slice(qIndex))
        const p = params.get("page")
        return p ? Number(p) : undefined
      }
    } catch {}
    return undefined
  }
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)
  const token = (session as any)?.accessToken as string | undefined
  if (!token) {
    redirect("/login")
  }

  const sp = await searchParams
  const pageParam = sp?.page
  const page = Array.isArray(pageParam) ? Number(pageParam[0]) : Number(pageParam || 1)

  const qs = new URLSearchParams()
  if (!Number.isNaN(page) && page > 1) qs.set("page", String(page))
  const url = `${API_BASE_URL}/api/orders${qs.toString() ? `?${qs.toString()}` : ""}`

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/ld+json, application/json;q=0.9, */*;q=0.8",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load orders ({res.status}).</p>
      </div>
    )
  }

  const data = (await res.json()) as OrdersResponse
  const items = data.member ?? []

  const firstPage = getPageFromUrl(data.view?.first) ?? 1
  const lastPage = getPageFromUrl(data.view?.last) ?? firstPage
  const prevPage = getPageFromUrl(data.view?.previous) ?? (page > firstPage ? page - 1 : undefined)
  const nextPage = getPageFromUrl(data.view?.next) ?? (page < lastPage ? page + 1 : undefined)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Total: {data.totalItems}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))] bg-card">
        <table className="min-w-full divide-y divide-[hsl(var(--border))]">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Order</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Address</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Fuel</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Created</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Delivered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))] bg-background">
            {items.map((o) => (
              <tr key={o["@id"] ?? o.id} className="hover:bg-muted/50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground sm:px-6">#{o.id}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground sm:px-6">{o.deliveryAddress}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm sm:px-6">{o.fuelAmount}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm sm:px-6"><StatusBadge status={o.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-6">{formatDate(o.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground sm:px-6">{formatDate(o.deliveredAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <PaginationButton href={prevPage ? `/dashboard/orders?page=${prevPage}` : undefined} disabled={!prevPage}>
          Previous
        </PaginationButton>
        <span className="text-sm text-muted-foreground">Page {page} of {lastPage}</span>
        <PaginationButton href={nextPage ? `/dashboard/orders?page=${nextPage}` : undefined} disabled={!nextPage}>
          Next
        </PaginationButton>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === "delivered") {
    return (
      <Badge variant={"success" as any}>
        <BadgeCheck className="mr-1 size-3.5" />
        {status}
      </Badge>
    )
  }
  if (s === "pending") {
    return <Badge variant={"warning" as any}>{status}</Badge>
  }
  if (s === "scheduled") {
    return <Badge variant={"outline" as any}>{status}</Badge>
  }
  if (s === "cancelled" || s === "canceled") {
    return <Badge variant={"destructive" as any}>{status}</Badge>
  }
  return <Badge variant={"outline" as any}>{status}</Badge>
}

function PaginationButton({ href, disabled, children }: { href?: string; disabled?: boolean; children: React.ReactNode }) {
  const base = "rounded-md border px-3 py-1.5 text-sm text-foreground/90 hover:bg-muted"
  if (disabled || !href) {
    return (
      <button className={`${base} opacity-50`} disabled>
        {children}
      </button>
    )
  }
  return (
    <Link href={href} className={base} prefetch={false}>
      {children}
    </Link>
  )
}
