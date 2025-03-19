"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" 
import type { Trip, Truck } from "@/lib/supabase"
import { fetchOperatorTrucks } from "@/lib/truck-utils"
import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TruckIcon, CircleDot } from "lucide-react"
import { showSuccessAlert, showErrorAlert } from "@/styles/sweetalert-styles"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const Page = () => {
  const router = useRouter()
  const { operator, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [ongoingTrips, setOngoingTrips] = useState<Trip[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedTrip, setSelectedTrip] = useState<string>("")
  const [volume, setVolume] = useState<string>("0")
  const [material, setMaterial] = useState<string>("Não especificado")

  useEffect(() => {
    // Buscar caminhões com viagens em andamento
    const fetchOngoingTrips = async () => {
      if (authLoading || !operator) return

      setLoading(true)
      try {
        console.log(`Buscando caminhões em viagem para o operador ${operator?.name} (ID: ${operator?.id})`)

        // Usar a função fetchOperatorTrucks para buscar caminhões em viagem
        const { trucks: trucksData, error: trucksError } = await fetchOperatorTrucks(operator.id, 1)

        if (trucksError) {
          console.error("Erro ao buscar caminhões:", trucksError)
          throw trucksError
        }

        console.log(`Caminhões em viagem encontrados: ${trucksData?.length || 0}`)

        if (!trucksData || trucksData.length === 0) {
          setOngoingTrips([])
          setTrucks([])
          setError("Nenhum caminhão em viagem para este operador.")
          setLoading(false)
          return
        }

        // Obter IDs dos caminhões
        const truckIds = trucksData.map((truck) => truck.id)
        console.log(`IDs dos caminhões em viagem: ${truckIds.join(", ")}`)

        // Buscar viagens em andamento para esses caminhões
        const { data: tripsData, error: tripsError } = await supabase
          .from("trips")
          .select(`
          id,
          truck_id,
          material,
          status,
          start_time,
          trucks:truck_id (id, plate_number, load_volume)
        `)
          .eq("status", "ongoing")
          .in("truck_id", truckIds)
          .order("start_time", { ascending: false })

        if (tripsError) {
          console.error("Erro ao buscar viagens:", tripsError)
          throw tripsError
        }

        console.log(`Viagens em andamento encontradas: ${tripsData?.length || 0}`)

        if (tripsData && tripsData.length > 0) {
          setOngoingTrips(tripsData as unknown as Trip[])
          setTrucks(trucksData as Truck[])
        } else {
          // Caso especial: caminhões estão marcados como em viagem, mas não há registros de viagem
          // Isso pode acontecer se houver inconsistência no banco de dados
          setOngoingTrips([])
          setTrucks([])
          setError(
            "Há caminhões marcados como em viagem, mas não foram encontrados registros de viagem correspondentes.",
          )

          console.warn("Inconsistência detectada: caminhões marcados como em viagem sem registros de viagem")
        }
      } catch (err) {
        console.error("Erro ao buscar viagens em andamento:", err)
        setError("Não foi possível carregar as viagens. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchOngoingTrips()
  }, [operator, authLoading])

  const handleExitRegistration = async () => {
    if (!selectedTrip || !operator) {
      showErrorAlert("Selecione um caminhão para registrar a saída")
      return
    }

    try {
      const tripId = parseInt(selectedTrip, 10)
      const selectedTripData = ongoingTrips.find(trip => trip.id === tripId)
      
      if (!selectedTripData) {
        throw new Error("Viagem não encontrada")
      }

      // Atualizar os dados da viagem com as informações adicionais
      const tripDataToSave = {
        ...selectedTripData,
        material: material,
        volume: parseFloat(volume) || 0
      }
      
      // Salvar os dados da viagem no sessionStorage para uso na página de fotos
      sessionStorage.setItem("currentTrip", JSON.stringify(tripDataToSave))
      
      // Redirecionar para a página de fotos para capturar a imagem
      router.push("/photo")
    } catch (err) {
      console.error("Erro ao preparar saída:", err)
      setError("Não foi possível preparar a saída. Tente novamente.")
      showErrorAlert("Não foi possível preparar a saída. Tente novamente.")
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
          <CardTitle className="text-2xl sm:text-3xl text-center font-normal">Saída de Caminhão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center font-medium">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-4">Carregando caminhões em viagem...</div>
          ) : ongoingTrips.length === 0 ? (
            <div className="text-center py-4">
              Nenhum caminhão em viagem encontrado
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="truck-select">Selecione o caminhão</Label>
                <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                  <SelectTrigger id="truck-select" className="w-full bg-black/40 border-[#F2BE13]/20 text-[#F2BE13]">
                    <SelectValue placeholder="Selecione um caminhão" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-[#F2BE13]/20 text-[#F2BE13]">
                    {ongoingTrips.map((trip) => {
                      // Garantir que start_time não é undefined
                      const startTime = trip.start_time || new Date().toISOString();
                      return (
                        <SelectItem key={trip.id} value={trip.id.toString()}>
                          {trip.trucks?.plate_number} - Início: {
                            format(new Date(startTime), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          }
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedTrip && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="material">Material transportado</Label>
                    <Input
                      id="material"
                      className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13]"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Ex: Areia, Pedra, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="volume">Volume (m³)</Label>
                    <Input
                      id="volume"
                      type="number"
                      className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13]"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </>
              )}

              <Button
                className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
                onClick={handleExitRegistration}
                disabled={!selectedTrip || loading}
              >
                {loading ? "Processando..." : "Continuar para Captura de Foto"}
              </Button>
            </div>
          )}

          <Button
            onClick={() => router.push("/main-menu")}
            className="w-full bg-[#F2BE13]/20 hover:bg-[#F2BE13]/30 text-[#F2BE13] font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page

