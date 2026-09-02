import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function apiFetch(path, options = {}) {
  const token = localStorage.getItem('command_center_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(`${API_URL}${path}`, { ...options, headers }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur serveur')
    return data
  })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const callbackRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('command_center_token')
    if (!token) { setLoading(false); return }
    apiFetch('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('command_center_token'))
      .finally(() => setLoading(false))
  }, [])

  callbackRef.current = async (response) => {
    try {
      const { token, user } = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: response.credential }),
      })
      localStorage.setItem('command_center_token', token)
      setUser(user)
    } catch (err) {
      console.error('Google auth error:', err)
    }
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    function initGoogle() {
      if (!window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => callbackRef.current(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: document.getElementById('google-signin-btn')?.offsetWidth || 400,
        }
      )
    }

    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval)
          initGoogle()
        }
      }, 100)
      const timeout = setTimeout(() => clearInterval(checkInterval), 10000)
      return () => { clearInterval(checkInterval); clearTimeout(timeout) }
    }
  }, [GOOGLE_CLIENT_ID])

  const login = async (email, password) => {
    const { token, user } = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('command_center_token', token)
    setUser(user)
    return user
  }

  const signup = async (name, email, password) => {
    const { token, user } = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    localStorage.setItem('command_center_token', token)
    setUser(user)
    return user
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('command_center_token')
    if (window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
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
    logout,
    updateProfile,
    GOOGLE_CLIENT_ID,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext