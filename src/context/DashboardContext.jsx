import { createContext, useContext, useState } from 'react'

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
  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [messages, setMessages] = useState([])
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterTime, setFilterTime] = useState('today')
  const [activeSection, setActiveSection] = useState('dashboard')

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
  }

  const disconnectService = (serviceName) => {
    setServices(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], connected: false, lastSync: undefined }
    }))
  }

  const syncService = async (serviceName) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    setServices(prev => ({
      ...prev,
      [serviceName]: { ...prev[serviceName], lastSync: new Date().toISOString() }
    }))
  }

  const markEmailRead = (emailId) => {
    setEmails(prev => prev.map(email => email.id === emailId ? { ...email, unread: false } : email))
  }

  const value = {
    services, emails, filteredEmails, tasks, events, messages, stats,
    filterPriority, filterTime, activeSection,
    setFilterPriority, setFilterTime, setActiveSection,
    connectService, disconnectService, syncService, markEmailRead
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export default DashboardContext