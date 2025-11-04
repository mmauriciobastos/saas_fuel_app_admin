"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:8000/api"

type Client = {
  id: number | string
  name?: string
  email?: string
  "@id"?: string
}

const schema = z.object({
  client: z.string().min(1, "Client is required"),
  fuelAmount: z
    .string()
    .min(1, "Fuel amount is required")
    .refine((v) => !!v && !Number.isNaN(Number(v)), "Enter a valid number"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function NewOrderPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = (session as any)?.accessToken as string | undefined

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      client: "",
      fuelAmount: "",
      deliveryAddress: "",
      notes: "",
    },
  })

  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(false)

  useEffect(() => {
    if (!token) return
    let canceled = false
    const load = async () => {
      try {
        setLoadingClients(true)
        const url = `${API_BASE_URL.replace(/\/$/, "")}/clients?itemsPerPage=50`
        const res = await fetch(url, {
          headers: {
            Accept: "application/ld+json, application/json;q=0.9, */*;q=0.8",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`Failed to load clients (${res.status})`)
        const data = await res.json()
        const items: Client[] = (data?.member || data?.["hydra:member"] || []).map((c: any) => ({
          id: c.id ?? c["@id"]?.split("/").pop() ?? "",
          name: c.name ?? c.fullName ?? c.company ?? undefined,
          email: c.email ?? undefined,
          "@id": c["@id"] ?? (c.id ? `/api/clients/${c.id}` : undefined),
        }))
        if (!canceled) setClients(items)
      } catch (e: any) {
        if (!canceled) toast.error(e?.message || "Failed to load clients")
      } finally {
        if (!canceled) setLoadingClients(false)
      }
    }
    load()
    return () => {
      canceled = true
    }
  }, [token])

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      toast.error("You're not signed in")
      return
    }
    try {
      const payload = {
        client: values.client, // should be an IRI like /api/clients/{id}
        fuelAmount: String(values.fuelAmount),
        deliveryAddress: values.deliveryAddress,
        status: "scheduled",
        ...(values.notes ? { notes: values.notes } : {}),
      }
      const url = `${API_BASE_URL.replace(/\/$/, "")}/orders`
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/ld+json, application/json;q=0.9, */*;q=0.8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => "")
        throw new Error(errText || `Failed to create order (${res.status})`)
      }

      toast.success("Order created")
      router.push("/dashboard/orders")
      router.refresh()
    } catch (e: any) {
      toast.error(e?.message || "Failed to create order")
    }
  }

  const clientOptions = useMemo(() => {
    return clients.map((c) => ({
      iri: c["@id"] ?? `/api/clients/${c.id}`,
      label: c.name || (c.email ? `${c.email}` : `Client #${c.id}`),
    }))
  }, [clients])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New Order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new order. Required fields are marked.
        </p>
      </div>

      <div className="rounded-lg border border-[hsl(var(--border))] bg-card p-4 sm:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="mt-1 block w-full rounded-md border border-[hsl(var(--border))] bg-background px-3 py-2 text-sm shadow-sm focus:outline-none"
                      disabled={loadingClients || status === "loading"}
                    >
                      <option value="">Select a client…</option>
                      {clientOptions.map((opt) => (
                        <option key={opt.iri} value={opt.iri}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fuelAmount"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Fuel Amount (L)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="e.g., 40.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, City, State/Province, Zip/Postal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <textarea
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-[hsl(var(--border))] bg-background px-3 py-2 text-sm shadow-sm focus:outline-none"
                      placeholder="Any additional details..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating…" : "Create Order"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
