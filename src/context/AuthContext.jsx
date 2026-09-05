import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get('token')
    const userFromUrl = params.get('user')
    const errorFromUrl = params.get('error')

    if (tokenFromUrl && userFromUrl) {
      localStorage.setItem('command_center_token', tokenFromUrl)
      setUser(JSON.parse(userFromUrl))
      window.history.replaceState({}, '', window.location.pathname)
    } else if (errorFromUrl) {
      console.error('Google OAuth error:', errorFromUrl)
      window.history.replaceState({}, '', window.location.pathname)
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

  const googleLogin = useCallback(() => {
    const width = 500, height = 600
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2
    window.open(
      `${API_URL}/api/auth/google`,
      'google-oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    )
  }, [])

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
    googleLogin,
    logout,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext