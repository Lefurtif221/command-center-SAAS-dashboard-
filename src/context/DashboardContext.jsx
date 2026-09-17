import { createContext, useContext, useState, useEffect, useCallback } from 'react'

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
  const [activeSection, setActiveSection] = useState(() => localStorage.getItem('activeSection') || 'dashboard')

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection)
  }, [activeSection])

  useEffect(() => {
    fetchConnectedServices()
    fetchTasks()
    fetchEvents()
    const interval = setInterval(() => {
      const token = localStorage.getItem('command_center_token')
      if (token) {
        fetchGmailEmails()
        fetchTasks()
        fetchEvents()
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

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('command_center_token')
      if (!token) return
      const res = await fetch(`${API_URL}/api/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.events) setEvents(data.events)
    } catch (err) { console.error(err) }
  }

  const addTask = async (title, priority, due_date) => {
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, priority, due_date }),
      })
      const data = await res.json()
      if (data.task) setTasks(prev => [data.task, ...prev])
    } catch (err) { console.error(err) }
  }

  const toggleTask = async (id, completed) => {
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed: !completed }),
      })
      const data = await res.json()
      if (data.task) setTasks(prev => prev.map(t => t.id === id ? data.task : t))
    } catch (err) { console.error(err) }
  }

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err) { console.error(err) }
  }

  const addEvent = async (title, date, hour, color) => {
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, date, hour, color }),
      })
      const data = await res.json()
      if (data.event) setEvents(prev => [...prev, data.event])
    } catch (err) { console.error(err) }
  }

  const removeEvent = async (id) => {
    try {
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/calendar/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setEvents(prev => prev.filter(e => e.id !== id))
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
    services, emails, filteredEmails, tasks, events, messages, stats, emailError,
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
