import { Button, Heading } from "@medusajs/ui"
import Link from "next/link"

const Hero = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-ui-bg-subtle">
      {/* Imagen de fondo con overlay más oscuro */}
      <div className="absolute inset-0 bg-black/40 z-0">
        <img 
          src="/random.png"
          alt="Modelo con ropa de temporada"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
      </div>

      
      {/* Contenido con mejor contraste */}
      <div className="relative z-10 h-full flex flex-col justify-center items-start px-8 md:px-16 lg:px-32">
        <div className="max-w-2xl space-y-6 bg-black/30 backdrop-blur-sm p-8 rounded-lg">
          <Heading
            level="h1"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg"
          >
            Colección Velvet 2025
          </Heading>
          
          <Heading
            level="h2"
            className="text-xl md:text-2xl font-medium text-white/95 leading-snug drop-shadow-md"
          >
            Descubre piezas únicas diseñadas para destacar
          </Heading>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6">

            <Link href="/account" passHref>
              <Button
                variant="primary"
                className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
              >
                Comprar ahora
              </Button>
            </Link>

            <Link href="/store" passHref>
              <Button
                variant="transparent"
                className="border-2 border-white text-white hover:bg-white/20 px-8 py-4 text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
              >
                Ver colección
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Indicador de scroll con más contraste */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="rounded-full bg-black/50 p-2">
          <svg 
            className="w-6 h-6 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Hero