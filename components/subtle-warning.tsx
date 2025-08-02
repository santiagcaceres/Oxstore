"use client"

import { useEffect } from "react"
import { AlertCircle, X } from "lucide-react"

interface SubtleWarningProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export default function SubtleWarning({ message, isVisible, onClose }: SubtleWarningProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000) // Auto close after 4 seconds

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-800">{message}</p>
          </div>
          <button onClick={onClose} className="text-amber-600 hover:text-amber-800 flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
