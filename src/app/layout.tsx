import type { Metadata } from "next"
import { QueryProvider } from "@/components/providers/query-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "PharmaClear - Pharmacy Operations Intelligence",
  description: "Make your pharmacy smarter, faster, and more profitable with AI-powered rejection intelligence, compliance tracking, and margin analysis.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
