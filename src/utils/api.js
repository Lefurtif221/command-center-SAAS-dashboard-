import { API_URL } from '../config'

const NETWORK_MESSAGE = 'Serveur injoignable. Verifiez votre connexion puis reessayez.'

async function doFetch(path, options, token) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(`${API_URL}${path}`, { ...options, headers })
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('command_center_token')

  let res
  try {
    res = await doFetch(path, options, token)
  } catch {
    // Render free tier s'endort : on retente une fois avant d'abandonner
    await new Promise(r => setTimeout(r, 1200))
    try {
      res = await doFetch(path, options, token)
    } catch {
      const e = new Error(NETWORK_MESSAGE)
      e.code = 'NETWORK'
      throw e
    }
  }

  let data = null
  let text = ''
  try {
    text = await res.text()
  } catch {
    const e = new Error(NETWORK_MESSAGE)
    e.code = 'NETWORK'
    throw e
  }
  if (text) {
    try { data = JSON.parse(text) } catch { data = null }
  }

  if (!res.ok) {
    const e = new Error((data && data.error) || `Erreur serveur (${res.status})`)
    e.status = res.status
    e.apiCode = data && data.code
    throw e
  }
  if (data === null) throw new Error('Reponse invalide du serveur.')
  return data
}
