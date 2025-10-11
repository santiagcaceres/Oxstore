"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface Popup {
  id: number
  title: string
  content?: string
  image_url?: string
  link_url?: string
  is_active: boolean
  show_delay: number
}

interface PopupModalProps {
  isOpen: boolean
  onClose: () => void
  popup: Popup
}

export function PopupModal({ isOpen, onClose, popup }: PopupModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        {popup.image_url && (
          <div className="aspect-[4/3] overflow-hidden">
            <img src={popup.image_url || "/placeholder.svg"} alt={popup.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-4">{popup.title}</h3>
          {popup.content && <p className="text-gray-600 mb-6 leading-relaxed">{popup.content}</p>}

          {/* Action Button */}
          {popup.link_url && (
            <a
              href={popup.link_url}
              className="inline-block w-full bg-black text-white text-center py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              onClick={onClose}
            >
              Ver Más
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
