import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Infer your Symfony API base URL from env
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null
          const data = await res.json()

          // Expecting shape: { token: string, user: { id, name, email, ... } }
          if (!data?.token || !data?.user) return null

          return {
            id: String(data.user.id ?? data.user.email),
            name: data.user.name ?? data.user.fullName ?? data.user.email,
            email: data.user.email,
            // attach raw fields for jwt callback
            accessToken: data.token,
            user: data.user,
          } as any
        } catch (e) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.user = (user as any).user ?? user
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        ;(session as any).accessToken = (token as any).accessToken
        session.user = (token as any).user ?? session.user
      }
      return session
    },
  },
}
