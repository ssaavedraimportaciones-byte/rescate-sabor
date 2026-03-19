import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import SplashScreen from './components/SplashScreen'
import LandingPage from './components/LandingPage'
import Auth from './components/Auth'
import BuyerDashboard from './components/BuyerDashboard'
import SellerDashboard from './components/SellerDashboard'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [showLanding, setShowLanding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2500)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setShowLanding(true)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      subscription.unsubscribe()
    }
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  if (showSplash || loading) return <SplashScreen />

  if (!user || !profile?.role) {
    if (showLanding) {
      return <LandingPage onStart={() => setShowLanding(false)} />
    }
    return <Auth onAuth={(p) => setProfile(p)} />
  }

  if (profile.role === 'seller') {
    return <SellerDashboard user={user} profile={profile} />
  }

  return <BuyerDashboard user={user} profile={profile} />
}
