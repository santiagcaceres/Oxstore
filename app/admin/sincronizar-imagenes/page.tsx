"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ImageIcon, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function SyncImagesPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleSync = async (limit: number) => {
    setSyncing(true)
    setError(null)
    setResult(null)
    setProgress(0)

    try {
      const response = await fetch("/api/zureo/sync-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al sincronizar imágenes")
      }

      setResult(data)
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sincronizar Imágenes de Productos</h1>
          <p className="text-muted-foreground">
            Descarga las imágenes reales desde Zureo para los productos que actualmente tienen placeholders.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Sincronización de Imágenes
            </CardTitle>
            <CardDescription>
              Este proceso descargará las imágenes desde Zureo y las subirá a Supabase Storage. Puede tomar varios
              minutos dependiendo de la cantidad de productos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Este proceso solo sincroniza productos que actualmente tienen imágenes
                placeholder. Los productos que ya tienen imágenes reales no serán afectados.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => handleSync(10)} disabled={syncing} className="flex-1">
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Sincronizar 10 productos
                  </>
                )}
              </Button>

              <Button onClick={() => handleSync(50)} disabled={syncing} variant="secondary" className="flex-1">
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Sincronizar 50 productos
                  </>
                )}
              </Button>

              <Button onClick={() => handleSync(100)} disabled={syncing} variant="outline" className="flex-1">
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Sincronizar 100 productos
                  </>
                )}
              </Button>
            </div>

            {syncing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Procesando imágenes... Esto puede tomar varios minutos.
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-green-900 dark:text-green-100">¡Sincronización completada!</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Procesados</p>
                        <p className="text-2xl font-bold text-green-600">{result.processed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Exitosos</p>
                        <p className="text-2xl font-bold text-green-600">{result.successful}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fallidos</p>
                        <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                      </div>
                    </div>

                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-sm mb-2">Errores encontrados:</p>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {result.errors.map((err: any, idx: number) => (
                            <p key={idx} className="text-xs text-red-600">
                              Producto {err.productId}: {err.error}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Proceso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold mb-1">¿Qué hace este proceso?</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Busca productos con imágenes placeholder en la base de datos</li>
                <li>Descarga las imágenes reales desde la API de Zureo</li>
                <li>Convierte las imágenes de base64 a archivos</li>
                <li>Sube las imágenes a Supabase Storage</li>
                <li>Actualiza los registros de productos con las URLs reales</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Recomendaciones</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Comienza con 10 productos para probar el proceso</li>
                <li>El proceso toma aproximadamente 2 segundos por producto</li>
                <li>Puedes ejecutar el proceso múltiples veces sin problemas</li>
                <li>Si un producto falla, puedes intentar sincronizarlo nuevamente</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Limitaciones</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Solo sincroniza productos que tienen zureo_id válido</li>
                <li>Respeta los límites de tasa de la API de Zureo (2 segundos entre productos)</li>
                <li>El proceso tiene un timeout máximo de 5 minutos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
