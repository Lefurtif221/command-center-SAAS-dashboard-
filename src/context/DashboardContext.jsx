import { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [services, setServices] = useState({
    gmail: { connected: false, name: 'Gmail', icon: '📧' },
    whatsapp: { connected: false, name: 'WhatsApp', icon: '💬' },
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
    fetchTasks()
    const interval = setInterval(() => {
      const token = localStorage.getItem('command_center_token')
      if (token) {
        fetchGmailEmails()
        fetchTasks()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('command_center_token')
      if (!token) return
      const res = await fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.tasks) setTasks(data.tasks)
    } catch (err) { console.error(err) }
  }

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

  const filteredEmails = emails
    .filter(email => {
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
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1
      if (a.priority !== 'high' && b.priority === 'high') return 1
      if (a.unread && !b.unread) return -1
      if (!a.unread && b.unread) return 1
      return 0
    })

  const todayStr = new Date().toISOString().split('T')[0]

  const calendarActivity = (() => {
    try {
      const events = JSON.parse(localStorage.getItem('personalplace_calendar_events')) || []
      return events.filter(e => e.date === todayStr).length
    } catch { return 0 }
  })()

  const stats = {
    unreadEmails: emails.filter(e => e.priority === 'high').length,
    pendingTasks: tasks.filter(t => !t.completed).length,
    activity: calendarActivity,
    totalTasks: tasks.length,
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