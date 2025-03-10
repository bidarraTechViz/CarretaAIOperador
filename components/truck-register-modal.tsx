"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import Swal from "sweetalert2"

// Definir o schema de validação
const truckFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  plate_number: z.string().min(6, { message: "Placa deve ter pelo menos 6 caracteres" }),
  load_volume: z.coerce.number().positive({ message: "Volume deve ser um número positivo" }),
  project_name: z.string().min(2, { message: "Nome do projeto é obrigatório e deve ter pelo menos 2 caracteres" }),
})

type TruckFormValues = z.infer<typeof truckFormSchema>

interface TruckRegisterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operatorId?: number
}

export function TruckRegisterModal({ open, onOpenChange, operatorId }: TruckRegisterModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showingAlert, setShowingAlert] = useState(false)

  // Garantir que todos os campos tenham valores iniciais definidos
  const form = useForm<TruckFormValues>({
    resolver: zodResolver(truckFormSchema),
    defaultValues: {
      name: "",
      plate_number: "",
      load_volume: 0,
      project_name: "",
    },
  })

  const showConfirmationAlert = async (data: TruckFormValues) => {
    // Fechar temporariamente o modal de cadastro para evitar sobreposição
    onOpenChange(false)
    setShowingAlert(true)

    try {
      // Configurar o SweetAlert com z-index alto
      const result = await Swal.fire({
        title: "Atenção!",
        html: "O cadastro de caminhões é uma responsabilidade do administrador, lembre-se que esse recurso é para emergências. Deseja prosseguir com o cadastro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        confirmButtonColor: "#F2BE13",
        cancelButtonColor: "#d33",
        background: "#000",
        color: "#F2BE13",
        // Garantir que o SweetAlert fique acima de tudo
        backdrop: `rgba(0,0,0,0.4)`,
        allowOutsideClick: false,
        // Aumentar o z-index para garantir que fique acima do modal
        customClass: {
          container: "swal-container-higher-z",
          popup: "swal-popup-higher-z",
        },
      })

      if (result.isConfirmed) {
        // Reabrir o modal e prosseguir com o cadastro
        onOpenChange(true)
        await submitTruckData(data)
      } else {
        // Se cancelou, apenas reabrir o modal
        onOpenChange(true)
      }
    } finally {
      setShowingAlert(false)
    }
  }

  const submitTruckData = async (data: TruckFormValues) => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // 1. Primeiro, inserir o caminhão sem o operator_id
      const { data: truckData, error: truckError } = await supabase
        .from("trucks")
        .insert([
          {
            name: data.name,
            plate_number: data.plate_number,
            load_volume: data.load_volume,
            current_project: data.project_name, // Usando o nome do projeto
            truck_entry_status: 0, // Valor padrão
          },
        ])
        .select()

      if (truckError) throw truckError

      // 2. Se o operatorId estiver definido, criar a relação na tabela operator_trucks
      if (operatorId && truckData && truckData.length > 0) {
        const truckId = truckData[0].id
        
        const { error: relationError } = await supabase
          .from("operator_trucks")
          .insert([
            {
              operator_id: operatorId,
              truck_id: truckId,
            },
          ])

        if (relationError) throw relationError
      }

      setSuccess(true)
      form.reset({
        name: "",
        plate_number: "",
        load_volume: 0,
        project_name: "",
      })

      // Fechar o modal após 2 segundos
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error("Erro ao cadastrar caminhão:", err)
      setError("Não foi possível cadastrar o caminhão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(data: TruckFormValues) {
    if (showingAlert) return // Evitar múltiplos alertas
    // Mostrar alerta de confirmação antes de prosseguir
    await showConfirmationAlert(data)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Não permitir fechar o modal enquanto estiver mostrando o alerta
        if (showingAlert) return
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px] bg-black text-[#F2BE13] border-[#F2BE13]/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Cadastrar Novo Caminhão</DialogTitle>
          <DialogDescription className="text-[#F2BE13]/70">
            Preencha os dados abaixo para cadastrar um novo caminhão.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Caminhão</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Caminhão Basculante 01"
                      {...field}
                      className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="plate_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: ABC1234"
                      {...field}
                      className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="load_volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume de Carga (m³)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 12.5"
                      {...field}
                      value={field.value || 0} // Garantir que nunca seja undefined
                      className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13]"
                    />
                  </FormControl>
                  <FormDescription className="text-[#F2BE13]/70">
                    Volume máximo de carga em metros cúbicos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Construção Sede"
                      {...field}
                      className="bg-black/40 border-[#F2BE13]/20 text-[#F2BE13]"
                    />
                  </FormControl>
                  <FormDescription className="text-[#F2BE13]/70">
                    Nome do projeto onde o caminhão será utilizado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            {success && <div className="text-green-500 text-sm font-medium">Caminhão cadastrado com sucesso!</div>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#F2BE13] text-[#F2BE13] hover:bg-[#F2BE13]/10"
                disabled={loading || showingAlert}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#F2BE13] text-black hover:bg-[#F2BE13]/90"
                disabled={loading || showingAlert}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Cadastrar Caminhão"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

