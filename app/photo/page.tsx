"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Camera, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase, type Trip } from "@/lib/supabase"
import { useAuth } from "@/lib/useAuth"
import { showSuccessAlert, showErrorAlert } from "@/styles/sweetalert-styles"

export default function PhotoPage() {
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const [truckVolume, setTruckVolume] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const { operator, loading: authLoading } = useAuth()

  useEffect(() => {
    console.log("Página de fotos carregada")

    // Recuperar dados da viagem da sessão
    const tripData = sessionStorage.getItem("currentTrip")
    console.log("Dados da viagem recuperados:", tripData)

    if (!tripData) {
      console.error("Nenhum dado de viagem encontrado no sessionStorage")
      router.push("/exit")
      return
    }

    try {
      const parsedTrip = JSON.parse(tripData) as Trip
      console.log("Viagem parseada:", parsedTrip)
      setCurrentTrip(parsedTrip)

      // Buscar o volume do caminhão
      const fetchTruckVolume = async () => {
        if (parsedTrip.truck_id) {
          try {
            const { data, error } = await supabase
              .from("trucks")
              .select("load_volume")
              .eq("id", parsedTrip.truck_id)
              .single()

            if (error) {
              console.error("Erro ao buscar volume do caminhão:", error)
              return
            }

            if (data && data.load_volume) {
              console.log("Volume do caminhão:", data.load_volume)
              setTruckVolume(data.load_volume)
            }
          } catch (err) {
            console.error("Erro ao buscar volume do caminhão:", err)
          }
        }
      }

      fetchTruckVolume()

      // Inicializar a câmera
      const initCamera = async () => {
        try {
          console.log("Inicializando câmera...")
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          })
          console.log("Câmera inicializada com sucesso")

          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (err) {
          console.error("Erro ao acessar a câmera:", err)
          setError("Não foi possível acessar a câmera. Verifique as permissões.")
        }
      }

      initCamera()

      // Limpar stream da câmera ao desmontar
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    } catch (error) {
      console.error("Erro ao processar dados da viagem:", error)
      setError("Erro ao processar dados da viagem. Tente novamente.")
      router.push("/exit")
    }
  }, [router])

  const handlePhotoCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Definir dimensões do canvas para corresponder ao vídeo
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Desenhar o frame atual do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Converter para base64
    const base64Image = canvas.toDataURL("image/jpeg")
    setPhotoData(base64Image)
    setPhotoTaken(true)

    // Parar a câmera após capturar a foto
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const handleSubmit = async () => {
    if (!photoData || !currentTrip || !operator) return

    setLoading(true)
    try {
      // 1. Atualizar a viagem com a foto e marcar como concluída
      const { error: tripError } = await supabase
        .from("trips")
        .update({
          material: currentTrip.material,
          end_time: new Date().toISOString(),
          status: "completed",
          photo_base64: photoData,
          operator_name: operator.name,
          volume: truckVolume, // Atualizar o volume com a capacidade do caminhão
        })
        .eq("id", currentTrip.id)

      if (tripError) throw tripError

      // 2. Atualizar o status do caminhão para 0 (disponível)
      const { error: truckError } = await supabase
        .from("trucks")
        .update({ truck_entry_status: 0 })
        .eq("id", currentTrip.truck_id)

      if (truckError) throw truckError

      // Limpar dados da sessão
      sessionStorage.removeItem("currentTrip")

      // Mostrar alerta de sucesso com informações adicionais sobre o volume
      const volumeText = truckVolume ? `Saída Registrada - Volume: ${truckVolume} m³` : "Saída Registrada"

      showSuccessAlert(operator.name, volumeText).then(() => {
        // Redirecionar após o usuário clicar em OK
        router.push("/main-menu")
      })
    } catch (err) {
      console.error("Erro ao salvar foto:", err)
      setError("Não foi possível salvar a foto. Tente novamente.")
      showErrorAlert("Não foi possível registrar a saída. Tente novamente.")
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
          <CardTitle className="text-2xl sm:text-3xl text-center font-normal">Captura de Foto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}

          <div className="bg-black/40 h-48 sm:h-64 flex items-center justify-center border border-[#F2BE13]/20 rounded-md overflow-hidden relative">
            {!photoTaken ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={photoData || ""} alt="Foto capturada" className="w-full h-full object-cover" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Mostrar informação do volume do caminhão */}
          {truckVolume !== null && (
            <div className="bg-black/40 p-3 rounded-md border border-[#F2BE13]/20">
              <p className="text-center">
                Volume do caminhão: <strong>{truckVolume} m³</strong>
              </p>
            </div>
          )}

          {!photoTaken ? (
            <Button
              onClick={handlePhotoCapture}
              className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold h-12 sm:h-14 text-base sm:text-lg"
              disabled={loading}
            >
              <Camera className="mr-2 h-4 w-4" />
              Capturar Foto
            </Button>
          ) : (
            <Button
              className="w-full bg-[#F2BE13] hover:bg-[#F2BE13]/90 text-black font-semibold h-12 sm:h-14 text-base sm:text-lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Adicionar"}
              <Check className="ml-2 h-4 w-4" />
            </Button>
          )}

          <Button
            onClick={() => router.push("/exit")}
            className="w-full bg-[#F2BE13] text-black hover:bg-[#F2BE13]/90 border-[#F2BE13] h-12 sm:h-14 text-base sm:text-lg"
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4 text-black" />
            Voltar
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold h-12 sm:h-14 text-base sm:text-lg mt-4"
            disabled={loading}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

