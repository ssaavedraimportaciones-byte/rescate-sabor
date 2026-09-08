import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import SplashScreen from './components/SplashScreen'
import LandingPage from './components/LandingPage'
import Auth from './components/Auth'
import ResetPassword from './components/ResetPassword'
import BuyerDashboard from './components/BuyerDashboard'
import SellerDashboard from './components/SellerDashboard'
import AdminDashboard from './components/AdminDashboard'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [showLanding, setShowLanding] = useState(false)
  const [authIntent, setAuthIntent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [recovering, setRecovering] = useState(false)
  const initialSessionHandled = useRef(false)

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2500)

    const sessionTimeout = setTimeout(() => {
      if (!initialSessionHandled.current) {
        initialSessionHandled.current = true
        setShowLanding(true)
        setLoading(false)
      }
    }, 5000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(sessionTimeout)
      initialSessionHandled.current = true
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setShowLanding(true)
        setLoading(false)
      }
    }).catch(() => {
      clearTimeout(sessionTimeout)
      initialSessionHandled.current = true
      setShowLanding(true)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecovering(true)
        setLoading(false)
        return
      }
      // Skip the initial INITIAL_SESSION event — already handled above
      if (!initialSessionHandled.current) return
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setShowLanding(true)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(splashTimer)
      clearTimeout(sessionTimeout)
      subscription.unsubscribe()
    }
  }, [])

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error || !data) {
      // Profile not yet created (trigger may be delayed) — retry once
      await new Promise(r => setTimeout(r, 500))
      const retry = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(retry.data)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  if (showSplash || loading) return <SplashScreen />

  if (recovering) {
    return <ResetPassword onDone={() => {
      setRecovering(false)
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) loadProfile(session.user.id)
      })
    }} />
  }

  if (!user || !profile?.role) {
    if (showLanding) {
      // El botón de la landing dice para qué viene la persona (comprar o
      // vender): eso decide si abre login o registro, y con qué rol elegido.
      return <LandingPage onStart={(intent) => {
        setAuthIntent(intent || null)
        setShowLanding(false)
      }} />
    }
    return (
      <Auth
        onAuth={(p) => setProfile(p)}
        initialMode={authIntent ? 'register' : 'login'}
        initialRole={authIntent === 'seller' ? 'seller' : authIntent === 'buyer' ? 'buyer' : ''}
      />
    )
  }

  if (profile.role === 'admin') {
    return <AdminDashboard user={user} profile={profile} />
  }

  if (profile.role === 'seller') {
    return <SellerDashboard user={user} profile={profile} />
  }

  return <BuyerDashboard user={user} profile={profile} />
}
