"use client"

import type React from "react"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export function Popup({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: PopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  )
}

export default Popup
