"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TruckIcon } from "lucide-react"
import "react-toastify/dist/ReactToastify.css"
import { supabase, type Operator } from "@/lib/supabase"
import Cookies from "js-cookie"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Verificar se já existe um operador logado
  useEffect(() => {
    const operatorData = sessionStorage.getItem("operator")
    if (operatorData) {
      router.push("/main-menu")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Buscar operador pelo login
      const { data, error } = await supabase.from("operators").select("*").eq("login", username).single()

      if (error || !data) {
        setError("Credenciais inválidas. Por favor, tente novamente.")
        setLoading(false)
        return
      }

      const operator = data as Operator

      // Verificar senha (em produção, deveria usar hash)
      if (operator.password !== password) {
        setError("Credenciais inválidas. Por favor, tente novamente.")
        setLoading(false)
        return
      }

      // Armazenar dados do operador na sessão e em cookies
      const operatorData = JSON.stringify(operator)

      // Armazenar no sessionStorage
      sessionStorage.setItem("operator", operatorData)

      // Armazenar em cookies para o middleware (expira em 1 dia)
      Cookies.set("operator", operatorData, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })

      // Adicionar um pequeno delay para garantir que os dados foram armazenados
      setTimeout(() => {
        // Redirecionar para o menu principal
        router.push("/main-menu")
      }, 100)
    } catch (err) {
      console.error("Erro ao fazer login:", err)
      setError("Ocorreu um erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F2BE13] flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] bg-black text-[#F2BE13] border-0 shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <TruckIcon className="h-12 w-12 sm:h-16 sm:w-16" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-normal">Carreta.AI</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm sm:text-base">Nome de Usuário</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Insira seu login"
                className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13] placeholder:text-[#F2BE13]/50 h-12 sm:h-14 text-base sm:text-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm sm:text-base">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira sua senha"
                className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13] placeholder:text-[#F2BE13]/50 h-12 sm:h-14 text-base sm:text-lg"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-[#F2BE13]/20 bg-black/40 text-[#F2BE13] focus:ring-[#F2BE13] w-5 h-5"
              />
              <label htmlFor="remember" className="text-sm sm:text-base">
                Lembrar-me
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold h-12 sm:h-14 text-base sm:text-lg"
              disabled={loading}
            >
              {loading ? "CARREGANDO..." : "ENTRAR"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

