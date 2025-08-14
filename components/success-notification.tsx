"use client"

import { useState, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessNotificationProps {
  message: string
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export default function SuccessNotification({
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000,
}: SuccessNotificationProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)

      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose()
        }, duration)

        return () => clearTimeout(timer)
      }
    }
  }, [isVisible, autoClose, duration])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onClose()
    }, 300) // Esperar a que termine la animación
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          bg-white border border-green-200 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md
          transform transition-all duration-300 ease-in-out
          ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        `}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">¡Éxito!</p>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {autoClose && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-green-500 h-1 rounded-full transition-all duration-300 ease-linear"
                style={{
                  animation: `shrink ${duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
