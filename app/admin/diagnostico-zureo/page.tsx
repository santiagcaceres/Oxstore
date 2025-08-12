"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface DiagnosticResult {
  success: boolean
  message?: string
  error?: string
  data?: {
    token_valid: boolean
    brands_count: number
    products_count: number
    sample_brand: string
    sample_product: string
  }
  details?: {
    name: string
    stack: string
  }
}

export default function DiagnosticoZureoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DiagnosticResult | null>(null)

  const runDiagnostic = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/zureo/test-connection")
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: `Error de conexión: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diagnóstico Zureo</h1>
          <p className="text-muted-foreground">Verifica la conexión y configuración con la API de Zureo</p>
        </div>
        <Button onClick={runDiagnostic} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Diagnosticando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Ejecutar Diagnóstico
            </>
          )}
        </Button>
      </div>

      {/* Variables de Entorno */}
      <Card>
        <CardHeader>
          <CardTitle>Variables de Entorno</CardTitle>
          <CardDescription>Configuración requerida para conectar con Zureo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {["ZUREO_API_USER", "ZUREO_API_PASSWORD", "ZUREO_DOMAIN", "ZUREO_COMPANY_ID"].map((varName) => (
              <div key={varName} className="flex items-center justify-between">
                <span className="font-mono text-sm">{varName}</span>
                <Badge variant="secondary">Configurada</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resultado del Diagnóstico */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Resultado del Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success ? (
              <>
                <div className="text-green-600 font-medium">✅ {result.message}</div>

                {result.data && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Estadísticas</h4>
                      <div className="text-sm space-y-1">
                        <div>Token válido: {result.data.token_valid ? "✅" : "❌"}</div>
                        <div>Marcas encontradas: {result.data.brands_count}</div>
                        <div>Productos encontrados: {result.data.products_count}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Ejemplos</h4>
                      <div className="text-sm space-y-1">
                        <div>Marca ejemplo: {result.data.sample_brand}</div>
                        <div>Producto ejemplo: {result.data.sample_product}</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-red-600 font-medium">❌ {result.error}</div>

                {result.details && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-800">Detalles del Error</h4>
                    <div className="text-sm text-red-700 mt-2">
                      <div>Tipo: {result.details.name}</div>
                      <div className="mt-2 font-mono text-xs">{result.details.stack}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guía de Solución */}
      <Card>
        <CardHeader>
          <CardTitle>Guía de Solución</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">Si el diagnóstico falla:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Verifica que las credenciales de Zureo sean correctas</li>
                <li>Confirma que el dominio de Zureo esté bien configurado</li>
                <li>Revisa que la API de Zureo esté disponible</li>
                <li>Verifica la conectividad de red</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Configuración en Vercel:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Ve a tu proyecto en Vercel → Settings → Environment Variables</li>
                <li>Asegúrate de que todas las variables estén configuradas</li>
                <li>Redeploy después de cambiar variables</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
