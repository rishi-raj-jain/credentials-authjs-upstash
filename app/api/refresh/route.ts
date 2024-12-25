export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { auth } from '@/lib/auth'
import redis from '@/lib/redis'
import { UserType } from '@/lib/types'
import { encode } from '@auth/core/jwt'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const useSecureCookie = request.url.startsWith('https:')
  const salt = useSecureCookie ? '__Secure-authjs.session-token' : 'authjs.session-token'
  if (!process.env.AUTH_SECRET) return new NextResponse(null, { status: 500 })
  const [session, cookieStore] = await Promise.all([auth(), cookies()])
  if (!session?.user?.email) return new NextResponse(null, { status: 400 })
  const userByEmail = await redis.get(`user:email:${session.user.email}`)
  const userData = await redis.get<UserType>(`user:${userByEmail}`)
  if (!userData?.email) cookieStore.set(salt, toString(), { secure: useSecureCookie, path: '/', httpOnly: true, sameSite: 'lax', maxAge: 0 })
  else {
    const { image, password, ...rest } = userData
    const saltVal = await encode({ salt, secret: process.env.AUTH_SECRET, token: { ...rest, picture: image } })
    cookieStore.set(salt, saltVal, { secure: useSecureCookie, path: '/', httpOnly: true, sameSite: 'lax' })
  }
  return new NextResponse()
}
