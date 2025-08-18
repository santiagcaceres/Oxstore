"use client"

import { useState, useEffect } from "react"
import { DollarSign, Package, TrendingUp, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminDashboard() {
  const [zureoStatus, setZureoStatus] = useState<"loading" | "connected" | "error">("loading")
  const [zureoError, setZureoError] = useState<string>("")
  const [productCount, setProductCount] = useState<number>(0)
  const [brandCount, setBrandCount] = useState<number>(0)

  const checkZureoConnection = async () => {
    setZureoStatus("loading")
    setZureoError("")

    try {
      // Test products endpoint
      const productsResponse = await fetch("/api/zureo/products")
      const productsData = await productsResponse.json()

      if (!productsResponse.ok) {
        throw new Error(productsData.error || "Error connecting to Zureo products API")
      }

      // Test brands endpoint
      const brandsResponse = await fetch("/api/zureo/brands")
      const brandsData = await brandsResponse.json()

      if (!brandsResponse.ok) {
        throw new Error(brandsData.error || "Error connecting to Zureo brands API")
      }

      setProductCount(productsData.length || 0)
      setBrandCount(brandsData.length || 0)
      setZureoStatus("connected")
    } catch (error) {
      console.error("Error checking Zureo connection:", error)
      setZureoError(error instanceof Error ? error.message : "Error desconocido")
      setZureoStatus("error")
    }
  }

  useEffect(() => {
    checkZureoConnection()
  }, [])

  if (zureoStatus === "loading") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Conectando con Zureo...</span>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Verificando conexión con Zureo API...</p>
          </div>
        </div>
      </div>
    )
  }

  if (zureoStatus === "error") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button onClick={checkZureoConnection} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error de conexión con Zureo:</strong> {zureoError}
            <br />
            <br />
            Verifica que las credenciales de Zureo estén configuradas correctamente en las variables de entorno:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>ZUREO_API_USER</li>
              <li>ZUREO_API_PASSWORD</li>
              <li>ZUREO_DOMAIN</li>
              <li>ZUREO_COMPANY_ID</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">Zureo conectado</span>
          </div>
          <Button onClick={checkZureoConnection} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards - Only real data from Zureo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos en Zureo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
            <p className="text-xs text-muted-foreground">Sincronizado desde Zureo API</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marcas Disponibles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brandCount}</div>
            <p className="text-xs text-muted-foreground">Marcas desde Zureo API</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado API</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">OK</div>
            <p className="text-xs text-muted-foreground">Zureo API funcionando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date().toLocaleTimeString()}</div>
            <p className="text-xs text-muted-foreground">Datos en tiempo real</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Datos en tiempo real:</strong> Toda la información mostrada proviene directamente de la API de Zureo.
          No se utilizan datos de demostración ni información hardcodeada.
        </AlertDescription>
      </Alert>
    </div>
  )
}
