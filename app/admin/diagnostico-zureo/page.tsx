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

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Credenciales</CardTitle>
          <CardDescription>Credenciales requeridas para conectar con Zureo API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Proceso de Autenticación Zureo</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>1. POST a https://api.zureo.com/sdk/v1/security/login</div>
                  <div>2. Authorization: Basic {btoa("patricia_saura@hotmail.com:ps1106:020128150011")}</div>
                  <div>3. Usar token Bearer recibido para endpoints de productos/marcas</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">ZUREO_API_USER</span>
                <Badge variant="secondary">patricia_saura@hotmail.com</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">ZUREO_API_PASSWORD</span>
                <Badge variant="secondary">ps1106</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">ZUREO_DOMAIN</span>
                <Badge variant="secondary">020128150011</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">ZUREO_COMPANY_ID</span>
                <Badge variant="secondary">1</Badge>
              </div>
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Guía de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">Configurar Variables de Entorno en Vercel:</h4>
              <div className="mt-2 p-3 bg-gray-50 rounded font-mono text-xs space-y-1">
                <div>ZUREO_API_USER=patricia_saura@hotmail.com</div>
                <div>ZUREO_API_PASSWORD=ps1106</div>
                <div>ZUREO_DOMAIN=020128150011</div>
                <div>ZUREO_COMPANY_ID=1</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold">Pasos para configurar:</h4>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Ve a tu proyecto en Vercel → Settings → Environment Variables</li>
                <li>Agrega cada variable con su valor correspondiente</li>
                <li>Asegúrate de que estén disponibles en todos los entornos</li>
                <li>Redeploy el proyecto después de agregar las variables</li>
                <li>Ejecuta este diagnóstico para verificar la conexión</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold">Si el diagnóstico sigue fallando:</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>Verifica que las credenciales sean exactamente las proporcionadas</li>
                <li>Confirma que la API de Zureo esté disponible</li>
                <li>Revisa los logs de Vercel para errores específicos</li>
                <li>Contacta soporte de Zureo si persisten los problemas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
