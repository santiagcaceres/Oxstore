"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader, AlertTriangle, Copy } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  data?: any
}

export default function DiagnosticoPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Variables de Entorno", status: "pending", message: "No ejecutado" },
    { name: "Autenticación con Zureo", status: "pending", message: "No ejecutado" },
    { name: "Obtener lista de empresas", status: "pending", message: "No ejecutado" },
    { name: "Obtener productos", status: "pending", message: "No ejecutado" },
  ])
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, status: TestResult["status"], message: string, data?: any) => {
    setTests((prev) => prev.map((test, i) => (i === index ? { ...test, status, message, data } : test)))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const runDiagnostics = async () => {
    setIsRunning(true)

    // Test 0: Variables de entorno
    try {
      updateTest(0, "pending", "Verificando variables de entorno...")
      const envResponse = await fetch("/api/test-env-vars")
      const envData = await envResponse.json()

      if (envResponse.ok && envData.allConfigured) {
        updateTest(0, "success", "✅ Todas las variables están configuradas", envData)
      } else {
        updateTest(0, "error", `❌ Variables faltantes: ${envData.missing?.join(", ") || "Error desconocido"}`, envData)
        setIsRunning(false)
        return // No continuar si faltan variables
      }
    } catch (error) {
      updateTest(0, "error", `❌ Error verificando variables: ${error}`)
      setIsRunning(false)
      return
    }

    // Test 1: Autenticación
    try {
      updateTest(1, "pending", "Probando autenticación...")
      const authResponse = await fetch("/api/test-zureo-auth")
      const authData = await authResponse.json()

      if (authResponse.ok && authData.success) {
        updateTest(1, "success", "✅ Autenticación exitosa", authData)
      } else {
        updateTest(1, "error", `❌ Error: ${authData.error}`, authData)
      }
    } catch (error) {
      updateTest(1, "error", `❌ Error de conexión: ${error}`)
    }

    // Test 2: Lista de empresas
    try {
      updateTest(2, "pending", "Obteniendo empresas...")
      const companiesResponse = await fetch("/api/test-zureo-companies")
      const companiesData = await companiesResponse.json()

      if (companiesResponse.ok && companiesData.success) {
        updateTest(2, "success", `✅ ${companiesData.count || 0} empresas encontradas`, companiesData)
      } else {
        updateTest(2, "error", `❌ Error: ${companiesData.error}`, companiesData)
      }
    } catch (error) {
      updateTest(2, "error", `❌ Error: ${error}`)
    }

    // Test 3: Productos
    try {
      updateTest(3, "pending", "Obteniendo productos...")
      const productsResponse = await fetch("/api/test-zureo-products")
      const productsData = await productsResponse.json()

      if (productsResponse.ok && productsData.success) {
        updateTest(3, "success", `✅ ${productsData.count || 0} productos encontrados`, productsData)
      } else {
        updateTest(3, "error", `❌ Error: ${productsData.error}`, productsData)
      }
    } catch (error) {
      updateTest(3, "error", `❌ Error: ${error}`)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "pending":
        return isRunning ? (
          <Loader className="h-5 w-5 animate-spin text-blue-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-gray-400" />
        )
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Exitoso</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800">Pendiente</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnóstico de Conexión con Zureo</h1>
          <p className="text-gray-600">
            Esta página verifica que la conexión con la API de Zureo esté funcionando correctamente.
          </p>
        </div>

        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ Instrucciones para Configurar Variables de Entorno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-yellow-700">
              Si ves errores, necesitas configurar las variables de entorno en Vercel. Sigue estos pasos:
            </p>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-semibold mb-2">1. Ve a tu proyecto en Vercel:</h4>
              <p className="text-sm text-gray-600 mb-2">Dashboard → Tu Proyecto → Settings → Environment Variables</p>

              <h4 className="font-semibold mb-2">2. Agrega estas variables:</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>ZUREO_API_USER = patricia_saura@hotmail.com</span>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard("patricia_saura@hotmail.com")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>ZUREO_API_PASSWORD = ps1106</span>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard("ps1106")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>ZUREO_DOMAIN = 020128150011</span>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard("020128150011")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>ZUREO_COMPANY_ID = 1</span>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard("1")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <h4 className="font-semibold mb-2 mt-4">3. Después de agregar las variables:</h4>
              <p className="text-sm text-gray-600">
                Haz clic en "Redeploy" en Vercel para que los cambios tomen efecto, luego vuelve aquí y ejecuta el
                diagnóstico.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pruebas de Conectividad</CardTitle>
            <Button onClick={runDiagnostics} disabled={isRunning} className="bg-blue-950 hover:bg-blue-900">
              {isRunning ? "Ejecutando..." : "Ejecutar Diagnóstico"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {tests.some((test) => test.data) && (
          <Card>
            <CardHeader>
              <CardTitle>Datos Obtenidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests.map((test, index) => {
                  if (!test.data) return null
                  return (
                    <div key={index}>
                      <h4 className="font-medium mb-2">{test.name}:</h4>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
