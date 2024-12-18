export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import redis from '@/lib/redis'
import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { encode } from '@auth/core/jwt'

export async function GET(request: Request) {
  const useSecureCookie = request.url.startsWith('https:')
  if (!process.env.AUTH_SECRET) return new Response(null, { status: 500 })
  const [session, cookieStore] = await Promise.all([auth(), cookies()])
  if (!session?.user?.email) return new Response(null, { status: 400 })
  const userKey = `user:email:${session.user.email}`
  const user = await redis.get<{ name?: string; image?: string; email: string; }>(userKey)
  if (!user) return new Response(null, { status: 404 })
  const { name, email, image } = user
  const salt = useSecureCookie ? '__Secure-authjs.session-token' : 'authjs.session-token'
  const saltVal = await encode({ salt, secret: process.env.AUTH_SECRET, token: { name, email, picture: image } })
  cookieStore.set(salt, saltVal, { secure: useSecureCookie, path: '/', httpOnly: true, sameSite: 'lax' })
  return new Response()
}
