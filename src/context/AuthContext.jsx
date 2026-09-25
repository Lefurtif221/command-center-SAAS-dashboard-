import { createContext, useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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