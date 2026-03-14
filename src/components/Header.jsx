import { supabase } from '../lib/supabase'

export default function Header({ profile, title }) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🥗</span>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">{title || 'Rescate Sabor'}</h1>
          {profile?.name && (
            <p className="text-xs text-gray-400 leading-tight">{profile.name}</p>
          )}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1"
      >
        Salir
      </button>
    </header>
  )
}
