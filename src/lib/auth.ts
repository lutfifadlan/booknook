import NextAuth, { Account, NextAuthOptions, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { AdapterUser } from "next-auth/adapters"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },  
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        })
        if (!user || !await bcrypt.compare(credentials.password, user.password as string)) {
          return null
        }
        return { id: user.id, username: user.username }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id as string;

      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = user?.id
      }
      return token
    },
    async signIn({ 
      user, 
      account 
    }: { 
      user: User | AdapterUser
      account: Account | null
    }): Promise<boolean> {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email ?? undefined },
          include: { accounts: true },
        })

        if (existingUser) {
          // If the user exists but doesn't have a linked Google account
          if (!existingUser.accounts.some((acc: { provider: string }) => acc.provider === 'google')) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            })
          }
          return true
        } else {
          // If the user doesn't exist, create a new user
          const baseUsername = user.email?.split('@')[0] ?? ''
          let username = baseUsername
          let count = 1

          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${count}`
            count++
          }

          await prisma.user.create({
            data: {
              name: user.name ?? undefined,
              email: user.email ?? undefined,
              image: user.image ?? undefined,
              username: username,
            },
          })
        }
      }
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);