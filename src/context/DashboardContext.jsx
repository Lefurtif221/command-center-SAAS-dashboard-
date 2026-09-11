import { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [services, setServices] = useState({
    gmail: { connected: false, name: 'Gmail', icon: '📧' },
    notion: { connected: false, name: 'Notion', icon: '📝' },
    whatsapp: { connected: false, name: 'WhatsApp', icon: '💬' },
    outlook: { connected: false, name: 'Outlook', icon: '📬' },
    slack: { connected: false, name: 'Slack', icon: '💼' },
    trello: { connected: false, name: 'Trello', icon: '📋' }
  })

  const [emails, setEmails] = useState([])
  const [emailError, setEmailError] = useState(null)
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [messages, setMessages] = useState([])
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterTime, setFilterTime] = useState('today')
  const [activeSection, setActiveSection] = useState('dashboard')

  useEffect(() => {
    fetchConnectedServices()
  }, [])

  const fetchConnectedServices = async () => {
    try {
      const token = localStorage.getItem('command_center_token')
      if (!token) return
      const res = await fetch(`${API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const connected = data.services || []
      setServices(prev => {
        const updated = { ...prev }
        for (const key of Object.keys(updated)) {
          updated[key] = { ...updated[key], connected: connected.includes(key) }
        }
        return updated
      })
      if (connected.includes('gmail')) fetchGmailEmails()
    } catch (err) {
      console.error('Failed to fetch services:', err)
    }
  }

  const fetchGmailEmails = async () => {
    try {
      setEmailError(null)
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/services/gmail/emails`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.emails) setEmails(data.emails)
      else if (data.error) setEmailError(data.error)
    } catch (err) {
      console.error('Failed to fetch Gmail emails:', err)
      setEmailError(err.message)
    }
  }

  const filteredEmails = emails.filter(email => {
    if (filterPriority !== 'all' && email.priority !== filterPriority) return false
    if (filterTime === 'today') {
      const today = new Date().toDateString()
      return today === new Date(email.date).toDateString()
    }
    if (filterTime === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(email.date) >= weekAgo
    }
    return true
  })

  const stats = {
    unreadEmails: emails.filter(e => e.unread).length,
    pendingTasks: tasks.filter(t => !t.completed).length,
    todayEvents: events.filter(e => e.date === new Date().toISOString().split('T')[0]).length,
    unreadMessages: messages.filter(m => m.unread).length
  }

  const connectService = async (serviceName) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    setServices(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], connected: true, lastSync: new Date().toISOString() }
    }))
    if (serviceName === 'gmail') fetchGmailEmails()
  }

  const disconnectService = (serviceName) => {
    setServices(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], connected: false, lastSync: undefined }
    }))
    if (serviceName === 'gmail') setEmails([])
  }

  const syncService = async (serviceName) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    setServices(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], lastSync: new Date().toISOString() }
    }))
    if (serviceName === 'gmail') fetchGmailEmails()
  }

  const markEmailRead = (emailId) => {
    setEmails(prev => prev.map(email => email.id === emailId ? { ...email, unread: false } : email))
  }

  const refreshEmails = () => {
    fetchGmailEmails()
  }

  const value = {
    services, emails, filteredEmails, tasks, events, messages, stats, emailError,
    filterPriority, filterTime, activeSection,
    setFilterPriority, setFilterTime, setActiveSection,
    connectService, disconnectService, syncService, markEmailRead, fetchConnectedServices, refreshEmails
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export default DashboardContext