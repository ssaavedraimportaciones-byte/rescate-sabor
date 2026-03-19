import { supabase } from '../lib/supabase'

export default function Header({ profile, title }) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white px-4 py-2 flex items-center justify-between sticky top-0 z-10 shadow-sm" style={{ borderBottom: '2.5px solid #f57c00' }}>
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Rescate Sabor" className="w-16 h-14" />
        <div>
          <h1 className="font-black text-xl leading-tight tracking-tight">
            <span style={{ color: '#f57c00' }}>Rescate</span>
            <span style={{ color: '#1b7a30' }}> Sabor</span>
          </h1>
          {profile?.name && (
            <p className="text-xs text-gray-500 leading-tight">{profile.name}</p>
          )}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-gray-500 hover:text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Salir
      </button>
    </header>
  )
}
