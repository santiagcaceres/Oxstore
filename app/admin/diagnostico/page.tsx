"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Database,
  Cloud,
  CreditCard,
  ImageIcon,
} from "lucide-react"

interface DiagnosticTest {
  name: string
  status: "idle" | "loading" | "success" | "error" | "warning"
  message: string
  details?: any
  icon?: React.ReactNode
}

export default function DiagnosticoPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([
    {
      name: "API Zureo",
      status: "idle",
      message: "No ejecutado",
      icon: <Database className="h-4 w-4" />,
    },
    {
      name: "Supabase",
      status: "idle",
      message: "No ejecutado",
      icon: <Database className="h-4 w-4" />,
    },
    {
      name: "Vercel Blob",
      status: "idle",
      message: "No ejecutado",
      icon: <ImageIcon className="h-4 w-4" />,
    },
    {
      name: "MercadoPago",
      status: "idle",
      message: "No ejecutado",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ])

  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, status: DiagnosticTest["status"], message: string, details?: any) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, status, message, details } : test)))
  }

  const runSingleTest = async (index: number) => {
    const testEndpoints = ["/api/zureo/test", "/api/supabase/test", "/api/blob/test", "/api/mercadopago/test"]

    updateTest(index, "loading", "Ejecutando...")

    try {
      const response = await fetch(testEndpoints[index])
      const data = await response.json()

      if (data.success) {
        updateTest(index, "success", data.message, data)
      } else {
        updateTest(index, "error", data.error || "Error desconocido", data)
      }
    } catch (error) {
      updateTest(index, "error", `Error de conexión: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)

    try {
      const envResponse = await fetch("/api/system/info")
      const envData = await envResponse.json()
      setSystemInfo(envData)
    } catch (error) {
      console.error("Error getting system info:", error)
    }

    for (let i = 0; i < tests.length; i++) {
      await runSingleTest(i)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: DiagnosticTest["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />
    }
  }

  const getStatusColor = (status: DiagnosticTest["status"]) => {
    switch (status) {
      case "loading":
        return "bg-blue-100 text-blue-800"
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Diagnóstico del Sistema</h1>
        <p className="text-gray-600 mt-2">Verificación completa de todas las integraciones</p>
      </div>

      <div className="flex gap-4">
        <Button onClick={runAllTests} disabled={isRunning} className="bg-black hover:bg-gray-800">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ejecutando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Ejecutar Diagnóstico Completo
            </>
          )}
        </Button>
      </div>

      {systemInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Variables de Entorno</h4>
                <div className="space-y-1 text-sm">
                  {systemInfo.envVars?.map((env: any) => (
                    <div key={env.name} className="flex justify-between">
                      <span>{env.name}:</span>
                      <Badge variant={env.configured ? "default" : "destructive"}>{env.configured ? "✓" : "✗"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Estado General</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Timestamp:</span>
                    <span>{new Date(systemInfo.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entorno:</span>
                    <span>{systemInfo.environment}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  {test.icon}
                  {test.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(test.status)}>
                    {test.status === "idle" ? "Pendiente" : test.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleTest(index)}
                    disabled={test.status === "loading"}
                  >
                    Ejecutar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{test.message}</p>
              {test.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Ver detalles técnicos
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guía de Configuración</CardTitle>
          <CardDescription>Pasos para configurar las integraciones faltantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600">✅ Zureo API - Configurado</h4>
              <p className="text-sm text-gray-600">Productos y marcas sincronizados correctamente</p>
            </div>

            <div>
              <h4 className="font-semibold text-yellow-600">⚠️ Supabase - Opcional</h4>
              <p className="text-sm text-gray-600">Para usuarios registrados y pedidos persistentes</p>
              <p className="text-xs text-gray-500">Configurar en Project Settings → Integrations</p>
            </div>

            <div>
              <h4 className="font-semibold text-green-600">✅ Vercel Blob - Configurado</h4>
              <p className="text-sm text-gray-600">Para subir imágenes de productos y marcas</p>
            </div>

            <div>
              <h4 className="font-semibold text-yellow-600">⚠️ MercadoPago - Pendiente</h4>
              <p className="text-sm text-gray-600">Para procesar pagos en Uruguay</p>
              <p className="text-xs text-gray-500">Agregar MERCADOPAGO_ACCESS_TOKEN en variables de entorno</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
