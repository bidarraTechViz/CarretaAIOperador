"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Truck, CircleDot } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/useAuth"
import { fetchOperatorTrucks } from "@/lib/truck-utils"
import type { Truck as TruckType } from "@/lib/supabase"

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { operator, loading: authLoading } = useAuth()

  useEffect(() => {
    const loadTrucks = async () => {
      if (authLoading || !operator) return

      setLoading(true)
      try {
        const { trucks: operatorTrucks, error: trucksError } = await fetchOperatorTrucks(operator.id)

        if (trucksError) throw trucksError

        setTrucks(operatorTrucks)
      } catch (err) {
        console.error("Erro ao carregar caminhões:", err)
        setError("Não foi possível carregar os caminhões. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    loadTrucks()
  }, [operator, authLoading])

  if (authLoading) {
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
      <Card className="w-full max-w-[500px] bg-black text-[#F2BE13] border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center font-normal">Meus Caminhões</CardTitle>
          {operator && <p className="text-center text-sm">Operador: {operator.name}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}

          {loading ? (
            <div className="text-center py-4">Carregando caminhões...</div>
          ) : trucks.length === 0 ? (
            <div className="text-center py-4">Nenhum caminhão encontrado para este operador.</div>
          ) : (
            <div className="space-y-3">
              {trucks.map((truck) => (
                <Card key={truck.id} className="bg-black/40 border-[#F2BE13]/20">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <Truck className="h-6 w-6 mr-3" />
                      <div>
                        <p className="font-medium text-[#F2BE13]/70">Placa: {truck.plate_number}</p>
                        <p className="text-sm text-[#F2BE13]/70">Nome: {truck.name}</p>
                        <p className="text-xs text-[#F2BE13]/70">Volume: {truck.load_volume} m³</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CircleDot
                        className={`h-4 w-4 ${truck.truck_entry_status === 0 ? "text-green-500" : "text-red-500"}`}
                      />
                      <span className="ml-2 text-sm">
                        {truck.truck_entry_status === 0 ? "Disponível" : "Em viagem"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button
            onClick={() => router.push("/main-menu")}
            className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

