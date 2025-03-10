import { supabase, type Truck } from "./supabase"

/**
 * Busca todos os caminhões associados a um operador
 * @param operatorId ID do operador
 * @param entryStatus Status de entrada opcional (0 = disponível, 1 = em viagem, undefined = todos)
 * @returns Array de caminhões ou erro
 */
export async function fetchOperatorTrucks(
  operatorId: number,
  entryStatus?: number,
): Promise<{ trucks: Truck[]; error: Error | null }> {
  try {
    // Primeiro, buscar os IDs dos caminhões associados ao operador na tabela operator_trucks
    const { data: operatorTrucksData, error: operatorTrucksError } = await supabase
      .from("operator_trucks")
      .select("truck_id")
      .eq("operator_id", operatorId)

    if (operatorTrucksError) throw operatorTrucksError

    // Se não houver caminhões associados, retornar array vazio
    if (!operatorTrucksData || operatorTrucksData.length === 0) {
      return { trucks: [], error: null }
    }

    // Extrair os IDs dos caminhões
    const truckIds = operatorTrucksData.map(item => item.truck_id)

    // Agora buscar os detalhes dos caminhões usando os IDs obtidos
    let query = supabase
      .from("trucks")
      .select("id, plate_number, name, load_volume, truck_entry_status")
      .in("id", truckIds)
      .order("plate_number", { ascending: true })

    // Se um status específico foi solicitado, adicione à consulta
    if (entryStatus !== undefined) {
      query = query.eq("truck_entry_status", entryStatus)
    }

    const { data, error } = await query

    if (error) throw error

    return { trucks: data as Truck[], error: null }
  } catch (err) {
    console.error("Erro ao buscar caminhões do operador:", err)
    return {
      trucks: [],
      error: err instanceof Error ? err : new Error("Erro desconhecido ao buscar caminhões"),
    }
  }
}

/**
 * Verifica se um operador tem múltiplos caminhões
 * @param operatorId ID do operador
 * @returns Boolean indicando se o operador tem múltiplos caminhões
 */
export async function hasMultipleTrucks(operatorId: number): Promise<boolean> {
  const { trucks, error } = await fetchOperatorTrucks(operatorId)
  if (error || !trucks) return false
  return trucks.length > 1
}

/**
 * Conta o número de caminhões de um operador por status
 * @param operatorId ID do operador
 * @returns Objeto com contagens por status
 */
export async function countOperatorTrucksByStatus(
  operatorId: number,
): Promise<{ available: number; inTransit: number; total: number }> {
  const { trucks, error } = await fetchOperatorTrucks(operatorId)

  if (error || !trucks) {
    return { available: 0, inTransit: 0, total: 0 }
  }

  const available = trucks.filter((t) => t.truck_entry_status === 0).length
  const inTransit = trucks.filter((t) => t.truck_entry_status === 1).length

  return {
    available,
    inTransit,
    total: trucks.length,
  }
}

