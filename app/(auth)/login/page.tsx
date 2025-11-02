"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })
      if (res?.ok) {
        toast.success("Signed in")
        router.replace("/dashboard")
      } else {
        toast.error("Invalid email or password")
      }
    } catch (err) {
      toast.error("Unable to sign in")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <Image
            src="/next.svg"
            alt="Company logo"
            width={24}
            height={24}
            className="dark:invert"
            priority
          />
        </div>
        <h1 className="mt-8 text-pretty text-center text-2xl/9 font-semibold tracking-tight text-foreground">
          Sign in to your account
        </h1>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-foreground">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-none ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/50 dark:ring-zinc-700 sm:text-sm/6"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-foreground">
                Password
              </label>
              <div className="text-sm">
                <Link href="#" className="font-semibold text-primary hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-none ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-primary/50 dark:ring-zinc-700 sm:text-sm/6"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-2 focus:ring-primary/50 dark:border-zinc-700"
            />
            <label htmlFor="remember-me" className="text-sm text-foreground">
              Remember me
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-zinc-900 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm/6 text-muted-foreground">
          Not a member?{' '}
          <Link href="#" className="font-semibold text-primary hover:text-primary/80">
            Start a 14-day free trial
          </Link>
        </p>
      </div>
    </div>
  )
}
