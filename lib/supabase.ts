import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Operator = {
  id: number
  name: string
  login: string
  password: string
  // truck_id foi removido
  project_id: number | null
  created_at: string
  phone: string | null
}

export type Truck = {
  id: number
  plate_number: string
  truck_entry_status?: number // 0 = disponível, 1 = em viagem
  load_volume?: number // Volume de carga em m³
  operator_id?: number | null // Referência ao operador que possui o caminhão
}

export type Trip = {
  id: number
  truck_id: number
  project_id?: number
  material: string
  volume?: number
  start_time?: string
  end_time?: string | null
  status: "ongoing" | "completed"
  photo_url?: string | null
  coordinates?: string | null
  created_at?: string
  photo_base64?: string | null
  operator_name?: string | null
  trucks?: Truck
}

// Novo tipo para representar a relação entre operadores e caminhões
export type OperatorTruck = {
  id: number
  operator_id: number
  truck_id: number
}

