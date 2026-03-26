import { useState, useEffect, useRef } from 'react'
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
