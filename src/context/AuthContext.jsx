import { createContext, useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

const AuthContext = createContext(null)

function safeParse(raw) {
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Attribution : on capture d ou le visiteur arrive (une seule fois, au premier chargement)
    const sp = new URLSearchParams(window.location.search)
    const ref = sp.get('ref')
    if (!localStorage.getItem('pp_src')) {
      const referrer = document.referrer
      const src = {
        ref: ref && /^[A-Za-z0-9]{4,20}$/.test(ref) ? ref.toUpperCase() : null,
        utm_source: sp.get('utm_source'),
        utm_medium: sp.get('utm_medium'),
        utm_campaign: sp.get('utm_campaign'),
        utm_content: sp.get('utm_content'),
        referrer: referrer && !referrer.startsWith(window.location.origin) ? referrer : null,
        landed_at: new Date().toISOString(),
      }
      localStorage.setItem('pp_src', JSON.stringify(src))
    }
    // Lien de parrainage ouvert (?ref=XXX) : on le garde pour l'attribuer apres l'inscription
    if (ref && /^[A-Za-z0-9]{4,20}$/.test(ref)) localStorage.setItem('pp_ref', ref.toUpperCase())
  }, [])

  useEffect(() => {
    if (!user) return
    const ref = localStorage.getItem('pp_ref')
    const source = safeParse(localStorage.getItem('pp_src'))
    if (!ref && !source) return
    apiFetch('/api/me/referral/attach', { method: 'POST', body: JSON.stringify({ ref: ref || '', source }) })
      .then(() => { if (ref) localStorage.removeItem('pp_ref') })
      .catch(() => { /* on reessera au prochain chargement */ })
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get('token')
    const userFromUrl = params.get('user')
    const errorFromUrl = params.get('error')

    if (tokenFromUrl && userFromUrl) {
      localStorage.setItem('command_center_token', tokenFromUrl)
      try { setUser(JSON.parse(userFromUrl)) }
      catch { localStorage.removeItem('command_center_token') }
      window.history.replaceState({}, '', window.location.pathname)
      setLoading(false)
    } else if (errorFromUrl) {
      console.error('Google OAuth error:', errorFromUrl)
      window.history.replaceState({}, '', window.location.pathname)
      setLoading(false)
    } else {
      const token = localStorage.getItem('command_center_token')
      if (!token) { setLoading(false); return }
      apiFetch('/api/auth/me')
        .then(({ user }) => setUser(user))
        .catch(() => localStorage.removeItem('command_center_token'))
        .finally(() => setLoading(false))
    }
  }, [])

  const login = async (email, password) => {
    const { token, user } = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('command_center_token', token)
    setUser(user)
    localStorage.setItem('pp_promo_gmail', String(Date.now()))
    return user
  }

  const signup = async (name, email, password) => {
    const data = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, source: safeParse(localStorage.getItem('pp_src')) }),
    })
    if (data.needsVerification) return { needsVerification: true, email: data.email }
    localStorage.setItem('command_center_token', data.token)
    setUser(data.user)
    return data.user
  }

  const verifyCode = async (email, code) => {
    const data = await apiFetch('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
    localStorage.setItem('command_center_token', data.token)
    setUser(data.user)
    return data.user
  }

  const resendCode = async (email) => {
    return apiFetch('/api/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  const refreshUser = async () => {
    const { user } = await apiFetch('/api/auth/me')
    setUser(user)
    return user
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('command_center_token')
  }

  const updateProfile = async (updates) => {
    const { user } = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    setUser(user)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    verifyCode,
    resendCode,
    logout,
    updateProfile,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext