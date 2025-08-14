export default function CategoryLoadingScreen({ category }: { category: string }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header placeholder */}
      <div className="h-16 bg-gray-50 border-b animate-pulse" />

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Back button placeholder */}
        <div className="h-10 w-32 bg-gray-200 rounded mb-4 animate-pulse" />

        {/* Title placeholder */}
        <div className="h-12 w-64 bg-gray-200 rounded mb-8 mx-auto animate-pulse" />

        {/* Filter bar placeholder */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Products grid placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square w-full bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-8 right-8">
        <div className="bg-black text-white px-4 py-2 rounded-full flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando {category}...</span>
        </div>
      </div>
    </div>
  )
}
