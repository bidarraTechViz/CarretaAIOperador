"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CameraPermissionCheck() {
  const [permissionStatus, setPermissionStatus] = useState<string>("checking")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkCameraPermission()
  }, [])

  const checkCameraPermission = async () => {
    try {
      setPermissionStatus("checking")
      setError(null)

      // Verificar se a API de mídia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionStatus("not-supported")
        setError("Seu navegador não suporta acesso à câmera")
        return
      }

      // Tentar acessar a câmera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })

      // Se chegou aqui, a permissão foi concedida
      setPermissionStatus("granted")

      // Liberar a câmera imediatamente
      stream.getTracks().forEach((track) => track.stop())
    } catch (err) {
      console.error("Erro ao verificar permissão da câmera:", err)

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermissionStatus("denied")
          setError("Permissão para acessar a câmera foi negada")
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setPermissionStatus("not-found")
          setError("Nenhuma câmera foi encontrada no dispositivo")
        } else {
          setPermissionStatus("error")
          setError(`Erro ao acessar a câmera: ${err.message}`)
        }
      } else {
        setPermissionStatus("error")
        setError("Erro desconhecido ao acessar a câmera")
      }
    }
  }

  return (
    <Card className="w-full max-w-[400px] bg-black text-[#F2BE13] border-0 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl text-center">Verificação de Câmera</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="mb-2">Status da permissão: {permissionStatus}</p>
          {error && <p className="text-red-500">{error}</p>}
          {permissionStatus === "granted" && (
            <p className="text-green-500">Câmera disponível e com permissão concedida!</p>
          )}
        </div>

        <Button
          onClick={checkCameraPermission}
          className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold"
        >
          Verificar Novamente
        </Button>
      </CardContent>
    </Card>
  )
}

