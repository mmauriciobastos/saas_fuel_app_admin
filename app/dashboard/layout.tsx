import Link from "next/link"
import {
  Home,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Settings,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid w-full grid-cols-1 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden border-r lg:block">
          <div className="sticky top-0 flex h-screen flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-100 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
                <span className="text-sm font-semibold">MP</span>
              </div>
              <span className="text-sm font-medium opacity-80">ManagePetro</span>
            </div>

            <nav className="mt-4 flex flex-1 flex-col gap-1 text-sm">
              <SidebarLink href="/dashboard" label="Overview">
                <Home className="size-4" />
              </SidebarLink>
              <SidebarLink href="/dashboard/orders" label="Orders">
                <ShoppingCart className="size-4" />
              </SidebarLink>
              <SidebarLink href="#" label="Clients">
                <Users className="size-4" />
              </SidebarLink>
              <SidebarLink href="#" label="Products">
                <Package className="size-4" />
              </SidebarLink>
              <SidebarLink href="#" label="Reports">
                <BarChart3 className="size-4" />
              </SidebarLink>

              <div className="mt-auto pt-4">
                <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Settings
                </div>
                <SidebarLink href="#" label="Settings">
                  <Settings className="size-4" />
                </SidebarLink>
              </div>
            </nav>
          </div>
        </aside>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-2 py-2 text-foreground/90 hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-900"
    >
      {children}
      <span>{label}</span>
    </Link>
  )
}
