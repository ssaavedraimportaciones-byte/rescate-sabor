export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-orange-500 flex flex-col items-center justify-center">
      <div className="text-white text-center">
        <div className="text-8xl mb-4">🥗</div>
        <h1 className="text-4xl font-bold mb-2">Rescate Sabor</h1>
        <p className="text-orange-100 text-lg">Rescatando comida, creando sabor</p>
        <div className="mt-8 flex space-x-2 justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
