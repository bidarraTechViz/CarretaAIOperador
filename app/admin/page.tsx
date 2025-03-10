"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addPhotoBase64Column, addOperatorNameColumn } from "@/lib/db-scripts"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const router = useRouter()

  const handleAddPhotoColumn = async () => {
    setLoading(true)
    try {
      const response = await addPhotoBase64Column()
      if (response.success) {
        setResult({ success: true, message: "Coluna photo_base64 adicionada com sucesso!" })
      } else {
        setResult({
          success: false,
          message: `Erro ao adicionar coluna: ${response.error?.message || "Erro desconhecido"}`,
        })
      }
    } catch (error) {
      console.error("Erro ao executar script:", error)
      setResult({ success: false, message: "Ocorreu um erro ao executar o script." })
    } finally {
      setLoading(false)
    }
  }

  const handleAddOperatorNameColumn = async () => {
    setLoading(true)
    try {
      const response = await addOperatorNameColumn()
      if (response.success) {
        setResult({ success: true, message: "Coluna operator_name adicionada com sucesso!" })
      } else {
        setResult({
          success: false,
          message: `Erro ao adicionar coluna: ${response.error?.message || "Erro desconhecido"}`,
        })
      }
    } catch (error) {
      console.error("Erro ao executar script:", error)
      setResult({ success: false, message: "Ocorreu um erro ao executar o script." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F2BE13] flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px] bg-black text-[#F2BE13] border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center font-normal">Administração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-black/40 p-4 rounded-md border border-[#F2BE13]/20">
            <h3 className="text-lg font-semibold mb-2">Configuração do Banco de Dados</h3>
            <p className="text-sm mb-4">
              Clique nos botões abaixo para adicionar as colunas necessárias à tabela trips. Estas operações só precisam
              ser executadas uma vez.
            </p>
            <div className="space-y-2">
              <Button
                onClick={handleAddPhotoColumn}
                className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
                disabled={loading}
              >
                {loading ? "Executando..." : "Adicionar Coluna photo_base64"}
              </Button>

              <Button
                onClick={handleAddOperatorNameColumn}
                className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
                disabled={loading}
              >
                {loading ? "Executando..." : "Adicionar Coluna operator_name"}
              </Button>
            </div>

            {result && (
              <div
                className={`mt-4 p-3 rounded-md ${result.success ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"}`}
              >
                {result.message}
              </div>
            )}
          </div>

          <div className="bg-black/40 p-4 rounded-md border border-[#F2BE13]/20">
            <h3 className="text-lg font-semibold mb-2">Instruções</h3>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Certifique-se de criar as funções RPC no Supabase SQL Editor conforme indicado nos comentários.</li>
              <li>Após adicionar as colunas, o sistema estará pronto para uso.</li>
              <li>Os operadores podem fazer login usando suas credenciais da tabela operators.</li>
              <li>Cada operador só verá os caminhões associados ao seu ID.</li>
              <li>O nome do operador será registrado automaticamente nas entradas e saídas de caminhões.</li>
            </ul>
          </div>

          <Button
            onClick={() => router.push("/")}
            className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
          >
            Voltar para Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

