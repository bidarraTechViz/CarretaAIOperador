"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TruckIcon, LogOut, Plus, List } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { useAuth } from "@/lib/useAuth"
import { TruckRegisterModal } from "@/components/truck-register-modal"
import { countOperatorTrucksByStatus } from "@/lib/truck-utils"

export default function MainMenu() {
  const router = useRouter()
  const { operator, loading } = useAuth()
  const [showTruckModal, setShowTruckModal] = useState(false)
  const [truckCounts, setTruckCounts] = useState({ available: 0, inTransit: 0, total: 0 })
  const [loadingCounts, setLoadingCounts] = useState(true)

  useEffect(() => {
    const loadTruckCounts = async () => {
      if (!operator) return

      try {
        const counts = await countOperatorTrucksByStatus(operator.id)
        setTruckCounts(counts)
      } catch (err) {
        console.error("Erro ao carregar contagens de caminhões:", err)
      } finally {
        setLoadingCounts(false)
      }
    }

    loadTruckCounts()
  }, [operator])

  const handleLogout = () => {
    // Limpar dados da sessão
    sessionStorage.removeItem("operator")

    // Limpar cookies
    Cookies.remove("operator")

    // Redirecionar para a página de login
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F2BE13] flex items-center justify-center p-4">
        <Card className="w-full max-w-[400px] bg-black text-[#F2BE13] border-0 shadow-2xl">
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-lg">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#F2BE13] flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] bg-black text-[#F2BE13] border-0 shadow-2xl relative">
        <Button className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center font-normal">Menu Principal</CardTitle>
          {operator && <p className="text-center text-sm">Olá, {operator.name}</p>}

          {!loadingCounts && (
            <div className="mt-2 text-center text-sm">
              <p>Total de caminhões: {truckCounts.total}</p>
              <p>
                Disponíveis: {truckCounts.available} | Em viagem: {truckCounts.inTransit}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-16 sm:h-20 text-base sm:text-lg bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
            onClick={() => router.push("/entry")}
            disabled={truckCounts.available === 0}
          >
            <TruckIcon className="mr-2 h-6 w-6" />
            Entrada de Caminhão
          </Button>
          <Button
            className="w-full h-16 sm:h-20 text-base sm:text-lg bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
            onClick={() => router.push("/exit")}
            disabled={truckCounts.inTransit === 0}
          >
            <TruckIcon className="mr-2 h-6 w-6" />
            Saída de Caminhão
          </Button>
          <Button
            className="w-full h-16 sm:h-20 text-base sm:text-lg bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
            onClick={() => router.push("/trucks")}
          >
            <List className="mr-2 h-6 w-6" />
            Meus Caminhões
          </Button>
          <Button
            className="w-full h-16 sm:h-20 text-base sm:text-lg bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
            onClick={() => setShowTruckModal(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Cadastrar Caminhão
          </Button>
        </CardContent>
      </Card>

      {/* Modal de cadastro de caminhões */}
      <TruckRegisterModal open={showTruckModal} onOpenChange={setShowTruckModal} operatorId={operator?.id} />
    </div>
  )
}

