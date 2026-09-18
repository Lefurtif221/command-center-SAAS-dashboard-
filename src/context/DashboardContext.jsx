import { createContext, useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [services, setServices] = useState({
    gmail: { connected: false, name: 'Gmail', icon: '📧' },
    whatsapp: { connected: false, name: 'WhatsApp', icon: '💬' },
  })

  const [emails, setEmails] = useState([])
  const [emailError, setEmailError] = useState(null)
  const [gmailReconnect, setGmailReconnect] = useState(false)
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterTime, setFilterTime] = useState('today')
  const [activeSection, setActiveSection] = useState(() => localStorage.getItem('activeSection') || 'dashboard')

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection)
  }, [activeSection])

  useEffect(() => {
    fetchConnectedServices()
    fetchTasks()
    fetchEvents()
    const interval = setInterval(() => {
      if (localStorage.getItem('command_center_token')) {
        fetchGmailEmails()
        fetchTasks()
        fetchEvents()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const data = await apiFetch('/api/tasks')
      if (data.tasks) setTasks(data.tasks)
    } catch (err) { console.error(err) }
  }

  const fetchEvents = async () => {
    try {
      const data = await apiFetch('/api/calendar')
      if (data.events) setEvents(data.events)
    } catch (err) { console.error(err) }
  }

  const addTask = async (title, priority, due_date) => {
    try {
      const data = await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, priority, due_date }),
      })
      if (data.task) setTasks(prev => [data.task, ...prev])
    } catch (err) { console.error(err) }
  }

  const toggleTask = async (id, completed) => {
    try {
      const data = await apiFetch(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: !completed }),
      })
      if (data.task) setTasks(prev => prev.map(t => t.id === id ? data.task : t))
    } catch (err) { console.error(err) }
  }

  const deleteTask = async (id) => {
    try {
      await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) { console.error(err) }
  }

  const addEvent = async (title, date, hour, color) => {
    try {
      const data = await apiFetch('/api/calendar', {
        method: 'POST',
        body: JSON.stringify({ title, date, hour, color }),
      })
      if (data.event) setEvents(prev => [...prev, data.event])
    } catch (err) { console.error(err) }
  }

  const removeEvent = async (id) => {
    try {
      await apiFetch(`/api/calendar/${id}`, { method: 'DELETE' })
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch (err) { console.error(err) }
  }

  const fetchConnectedServices = async () => {
    try {
      const data = await apiFetch('/api/services')
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
      setGmailReconnect(false)
      const data = await apiFetch('/api/services/gmail/emails')
      if (data.emails) setEmails(data.emails)
      else if (data.error) {
        setEmailError(data.error)
        if (data.reconnect) setGmailReconnect(true)
      }
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

  const todayStr = new Date().toLocaleDateString('sv-SE')

  const stats = {
    unreadEmails: emails.filter(e => e.priority === 'high').length,
    pendingTasks: tasks.filter(t => !t.completed).length,
    activity: events.filter(e => e.date === todayStr).length,
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

  const updateEmailPriority = (senderEmail, priority) => {
    setEmails(prev => prev.map(email =>
      email.senderEmail === senderEmail ? { ...email, priority } : email
    ))
  }

  const value = {
    services, emails, filteredEmails, tasks, events, stats, emailError, gmailReconnect,
    filterPriority, filterTime, activeSection,
    setFilterPriority, setFilterTime, setActiveSection,
    fetchTasks, fetchEvents, addTask, toggleTask, deleteTask, addEvent, removeEvent,
    connectService, disconnectService, syncService, markEmailRead, fetchConnectedServices, refreshEmails, updateEmailPriority
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export default DashboardContext
