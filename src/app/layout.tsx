import "./globals.css"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}