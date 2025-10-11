"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  currentImage?: string
  className?: string
}

export function ImageUpload({ onImageSelect, currentImage, className = "" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(currentImage || "")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onImageSelect(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemoveImage = () => {
    setPreview("")
    onImageSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {preview ? (
        <div className="relative">
          <Image
            src={preview || "/placeholder.svg"}
            alt="Preview"
            width={400}
            height={300}
            className="w-full h-48 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragging ? "Suelta la imagen aquí" : "Arrastra una imagen aquí"}
          </p>
          <p className="text-sm text-gray-500 mb-4">o haz clic para seleccionar</p>
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="w-4 h-4 mr-2" />
            Seleccionar Imagen
          </Button>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {preview && (
        <div className="text-center">
          <Button type="button" variant="outline" size="sm" onClick={handleClick}>
            <Upload className="w-4 h-4 mr-2" />
            Cambiar Imagen
          </Button>
        </div>
      )}
    </div>
  )
}
