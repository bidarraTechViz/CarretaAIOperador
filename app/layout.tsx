import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { configureSweet } from "@/styles/sweetalert-styles"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Carreta.AI",
  description: "Um aplicativo para gerenciar entradas e saídas de caminhões com cálculo de volume",
    generator: 'v0.dev'
}

// Configurar SweetAlert2 no lado do cliente
if (typeof window !== "undefined") {
  configureSweet()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}



import './globals.css'