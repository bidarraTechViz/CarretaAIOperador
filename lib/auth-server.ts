"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Operator } from "./supabase"

export async function getServerSession() {
  const cookieStore = cookies()
  const operatorCookie = cookieStore.get("operator")

  if (!operatorCookie) {
    return null
  }

  try {
    return JSON.parse(operatorCookie.value) as Operator
  } catch (error) {
    console.error("Erro ao analisar cookie do operador:", error)
    return null
  }
}

export async function requireAuth() {
  const session = await getServerSession()

  if (!session) {
    redirect("/")
  }

  return session
}

