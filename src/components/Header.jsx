import { supabase } from '../lib/supabase'

export default function Header({ profile, title }) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="" className="w-14 h-14" />
        <div>
          <h1 className="font-bold text-gray-900 leading-tight text-base">{title || 'Rescate Sabor'}</h1>
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
