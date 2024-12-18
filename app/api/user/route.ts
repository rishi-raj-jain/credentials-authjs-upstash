export const runtime = 'edge'

export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import redis from '@/lib/redis'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) return new Response(null, { status: 400 })
    const body = await request.json()
    const userKey = `user:email:${session.user.email}`
    const userData = await redis.get<{ name?: string; email: string; image?: string; }>(userKey)
    if (!userData) return new Response(null, { status: 404 })
    if (body.name) userData.name = body.name
    if (body.image) userData.image = body.image
    await redis.set(userKey, userData)
    return new Response()
  } catch (e: any) {
    const message = e.message || e.toString()
    console.log(message)
    return new Response(message, { status: 500 })
  }
}
