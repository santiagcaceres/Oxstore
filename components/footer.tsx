import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-white text-black w-full">
      <div className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20blanco-mgk8KH7WTOfPYoTgnV5LV8bGLF26Gk.png"
                alt="LaunchByte"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-white font-semibold">LaunchByte</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-1">© 2025 LaunchByte. Todos los derechos reservados.</p>
              <p className="text-gray-500 text-xs">Desarrollo web profesional</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
