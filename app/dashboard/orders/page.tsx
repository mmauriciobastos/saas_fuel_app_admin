import { getServerSession } from "next-auth"
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

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const color =
    s === "delivered"
      ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/30 dark:text-green-300 dark:ring-green-900"
      : s === "pending"
      ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900"
      : s === "cancelled" || s === "canceled"
      ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900"
      : "bg-zinc-100 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-800"
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${color}`}>
      {status}
    </span>
  )
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  const token = (session as any)?.accessToken as string | undefined

  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    headers: {
      "Content-Type": "application/json",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">Total: {data.totalItems}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Order</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Address</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Fuel</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Created</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:px-6">Delivered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-black">
            {items.map((o) => (
              <tr key={o["@id"] ?? o.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/50">
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

      {/* Simple pager placeholder based on provided view - add real controls later */}
      <div className="flex items-center justify-end gap-2">
        <button className="rounded-md border px-3 py-1.5 text-sm text-foreground/90 hover:bg-zinc-50 dark:hover:bg-zinc-900" disabled>
          Previous
        </button>
        <button className="rounded-md border px-3 py-1.5 text-sm text-foreground/90 hover:bg-zinc-50 dark:hover:bg-zinc-900" disabled>
          Next
        </button>
      </div>
    </div>
  )
}
