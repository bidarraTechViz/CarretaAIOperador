"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" 
import type { Trip, Truck } from "@/lib/supabase"
import { fetchOperatorTrucks } from "@/lib/truck-utils"
import { useAuth } from "@/lib/useAuth"

const Page = () => {
  const { operator, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [ongoingTrips, setOngoingTrips] = useState<Trip[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [error, setError] = useState<string | null>(null)

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
          trucks:truck_id (id, plate_number, name, load_volume)
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

  return <div>{/* Your component's JSX goes here */}</div>
}

export default Page

