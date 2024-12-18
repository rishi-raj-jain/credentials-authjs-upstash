import './globals.css'
import NextAuthProvider from './NextAuthProvider'

export default function ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        <NextAuthProvider>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">{children}</div>
        </NextAuthProvider>
      </body>
    </html>
  )
}
