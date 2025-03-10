"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, type Truck } from "@/lib/supabase"
import { useAuth } from "@/lib/useAuth"
import { showSuccessAlert, showErrorAlert } from "@/styles/sweetalert-styles"
import { fetchOperatorTrucks } from "@/lib/truck-utils"

export default function EntryPage() {
  const [selectedTruck, setSelectedTruck] = useState("")
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const { operator, loading: authLoading } = useAuth()

  useEffect(() => {
    // Buscar caminhões associados ao operador
    const fetchTrucks = async () => {
      if (authLoading || !operator) return

      setLoading(true)
      try {
        // Usar a função fetchOperatorTrucks para buscar caminhões disponíveis
        const { trucks: availableTrucks, error: trucksError } = await fetchOperatorTrucks(operator.id, 0);

        if (trucksError) throw trucksError

        if (availableTrucks && availableTrucks.length > 0) {
          setTrucks(availableTrucks)
          console.log(`Encontrados ${availableTrucks.length} caminhões disponíveis para o operador ${operator.name}`)
        } else {
          setTrucks([])
          setError("Nenhum caminhão disponível para este operador.")
          console.log(`Nenhum caminhão disponível para o operador ${operator.name}`)
        }
      } catch (err) {
        console.error("Erro ao buscar caminhões:", err)
        setError("Não foi possível carregar os caminhões. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchTrucks()
  }, [operator, authLoading])

  const handleAddEntry = async () => {
    if (!selectedTruck || !operator) return

    try {
      setLoading(true)

      // Obter o ID do caminhão
      const truckId = Number.parseInt(selectedTruck)

      // 1. Atualizar o status do caminhão para 1 (em viagem)
      const { error: updateError } = await supabase.from("trucks").update({ truck_entry_status: 1 }).eq("id", truckId)

      if (updateError) throw updateError

      // 2. Criar nova viagem (trip) com status 'ongoing'
      const { data, error } = await supabase
        .from("trips")
        .insert([
          {
            truck_id: truckId,
            project_id: operator.project_id || 1, // Fallback para projeto 1 se não tiver
            material: "Não especificado", // Valor padrão
            volume: 0, // Será atualizado na saída
            start_time: new Date().toISOString(),
            status: "ongoing",
            operator_name: operator.name, // Adicionando o nome do operador
          },
        ])
        .select()

      if (error) {
        // Se houver erro ao criar a viagem, reverter o status do caminhão
        await supabase.from("trucks").update({ truck_entry_status: 0 }).eq("id", truckId)

        throw error
      }

      // Mostrar alerta de sucesso com o nome do operador
      showSuccessAlert(operator.name, "Entrada Registrada").then(() => {
        // Redirecionar após o usuário clicar em OK
        router.push("/main-menu")
      })
    } catch (err) {
      console.error("Erro ao registrar entrada:", err)
      setError("Não foi possível registrar a entrada. Tente novamente.")
      showErrorAlert("Não foi possível registrar a entrada. Tente novamente.")
      setLoading(false)
    }
  }

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
      <Card className="w-full max-w-[400px] bg-black text-[#F2BE13] border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center font-normal">Entrada de Caminhão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}

          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : (
            <>
              <Select onValueChange={setSelectedTruck}>
                <SelectTrigger className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13] h-12 sm:h-14 text-base sm:text-lg">
                  <SelectValue placeholder="Selecione um Caminhão" />
                </SelectTrigger>
                <SelectContent className="bg-black text-[#F2BE13]">
                  {trucks.length > 0 ? (
                    trucks.map((truck) => (
                      <SelectItem key={truck.id} value={truck.id.toString()}>
                        {truck.plate_number}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Nenhum caminhão disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {selectedTruck && (
                <Card className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13]">
                  <CardContent className="p-4">
                    {trucks.map((truck) => {
                      if (truck.id.toString() === selectedTruck) {
                        return (
                          <div key={truck.id}>
                            <p className="text-sm sm:text-base">Caminhão selecionado: {truck.plate_number}</p>
                          </div>
                        )
                      }
                      return null
                    })}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <Button
              onClick={() => router.push("/main-menu")}
              className="w-full sm:w-auto border-[#F2BE13] bg-[#F2BE13] text-black hover:bg-[#F2BE13]/90 h-12 sm:h-14 text-base sm:text-lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4 text-black" />
              Voltar
            </Button>
            <Button
              className="w-full sm:w-auto bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold h-12 sm:h-14 text-base sm:text-lg"
              onClick={handleAddEntry}
              disabled={!selectedTruck || loading}
            >
              Adicionar
              <Check className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

