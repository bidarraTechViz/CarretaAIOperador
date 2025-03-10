"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Operator } from "./supabase"
import Cookies from "js-cookie"

export function useAuth() {
  const [operator, setOperator] = useState<Operator | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Verificar primeiro no sessionStorage
        const operatorData = sessionStorage.getItem("operator")

        if (operatorData) {
          const parsedOperator = JSON.parse(operatorData) as Operator
          setOperator(parsedOperator)
          setLoading(false)
          return
        }

        // Se não encontrar no sessionStorage, verificar nos cookies
        const cookieData = Cookies.get("operator")

        if (cookieData) {
          const parsedOperator = JSON.parse(cookieData) as Operator
          // Sincronizar com sessionStorage
          sessionStorage.setItem("operator", cookieData)
          setOperator(parsedOperator)
          setLoading(false)
          return
        }

        // Se não encontrar em nenhum lugar, redirecionar para login
        router.push("/")
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        // Limpar dados possivelmente corrompidos
        sessionStorage.removeItem("operator")
        Cookies.remove("operator")
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  return { operator, loading }
}

