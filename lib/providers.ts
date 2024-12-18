import redis from './redis'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { comparePassword, generateRandomString, hashPassword } from './credentials'

export default [
  Google,
  Credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials, request) => {
      let type
      try {
        const tmp = new URL(request.url).searchParams.get('kind')
        if (tmp && typeof tmp === 'string') type = tmp
      } catch (e) { }
      if (!type || !credentials.email || typeof credentials.email !== 'string' || !credentials.password || typeof credentials.password !== 'string') return null
      const randomizedPassword = await generateRandomString(credentials.password)
      const userByEmail = await redis.get<string | null | undefined>(`user:email:${credentials.email}`)
      if (userByEmail) {
        if (type !== 'in') {
          console.log(`can not sign in in a non sign-in mode.`)
          throw new Error(`can not sign in in a non sign-in mode.`)
        }
        const user = JSON.parse(userByEmail)
        if (user.password) {
          const hashedPassword = await hashPassword(randomizedPassword)
          const isPasswordCorrect = await comparePassword(user.password, hashedPassword)
          if (isPasswordCorrect) {
            delete user['password']
            return user
          }
          throw new Error(`incorrect password for credentials.`)
        }
        throw new Error(`you are using some other authentication method already, but not credentials.`)
      } else {
        if (type !== 'up') {
          console.log(`can not sign up in a non sign-up mode.`)
          throw new Error(`can not sign up in a non sign-up mode.`)
        }
        const newUser = {
          name: null,
          email: credentials.email,
          image: null,
          password: randomizedPassword,
        }
        await redis.set(`user:email:${credentials.email}`, newUser)
        return newUser
      }
    },
  }),
]
