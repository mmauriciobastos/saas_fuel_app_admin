import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Infer your Symfony API base URL from env
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

export const authOptions: NextAuthOptions = {
  // Stabilize JWT encryption in dev to avoid JWE decryption errors when NEXTAUTH_SECRET is missing
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined),
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
          const res = await fetch(`${API_BASE_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!res.ok) return null
          const data = await res.json()

          // Symfony now returns: { token: string, user: { id, email, firstName, lastName, company: { id, name } } }
          const token = data?.token || data?.access_token
          if (!token) return null

          // Parse user and company from the API response
          const apiUser = data.user
          const user = apiUser
            ? {
                id: String(apiUser.id),
                email: apiUser.email,
                name: apiUser.firstName && apiUser.lastName
                  ? `${apiUser.firstName} ${apiUser.lastName}`
                  : apiUser.email,
                firstName: apiUser.firstName,
                lastName: apiUser.lastName,
                company: apiUser.company
                  ? {
                      id: apiUser.company.id,
                      name: apiUser.company.name,
                    }
                  : undefined,
              }
            : {
                id: String(credentials.email),
                name: credentials.email,
                email: credentials.email,
              }

          return {
            ...user,
            accessToken: token,
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
        token.accessToken = user.accessToken
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.company = user.company
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.accessToken = token.accessToken
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          firstName: token.firstName,
          lastName: token.lastName,
          company: token.company,
        }
      }
      return session
    },
  },
}
