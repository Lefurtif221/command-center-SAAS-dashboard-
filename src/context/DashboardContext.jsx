import { createContext, useContext, useState, useEffect } from 'react'

const DashboardContext = createContext(null)

export function DashboardProvider({ children }) {
  const [services, setServices] = useState({
    gmail: { connected: true, name: 'Gmail', icon: '📧', lastSync: '2024-01-15T10:30:00Z' },
    notion: { connected: true, name: 'Notion', icon: '📝', lastSync: '2024-01-15T09:15:00Z' },
    whatsapp: { connected: true, name: 'WhatsApp', icon: '💬', lastSync: '2024-01-15T11:45:00Z' },
    outlook: { connected: false, name: 'Outlook', icon: '📬' },
    slack: { connected: false, name: 'Slack', icon: '💼' },
    trello: { connected: false, name: 'Trello', icon: '📋' }
  })

  const [emails, setEmails] = useState([
    {
      id: '1',
      subject: 'Réunion client demain - Préparation requise',
      preview: 'Bonjour, je vous confirme notre réunion de demain à 14h. Merci de préparer les maquettes finales pour la présentation.',
      sender: 'Sophie Martin',
      senderEmail: 'sophie@entreprise.com',
      time: 'Il y a 2 heures',
      date: '2024-01-15T08:30:00Z',
      priority: 'high',
      unread: true,
      service: 'gmail'
    },
    {
      id: '2',
      subject: 'Facture #2024-089 - Paiement en attente',
      preview: 'Votre facture pour le mois de janvier est disponible. Montant total: 1 250€. Échéance: 31 janvier 2024.',
      sender: 'Comptabilité',
      senderEmail: 'compta@fournisseur.fr',
      time: 'Il y a 5 heures',
      date: '2024-01-15T05:30:00Z',
      priority: 'high',
      unread: true,
      service: 'gmail'
    },
    {
      id: '3',
      subject: 'Rapport hebdomadaire - Résultats positifs',
      preview: 'Chers collègues, voici le rapport de la semaine. Nos objectifs ont été atteints à 115%. Félicitations à toute l\'équipe.',
      sender: 'Direction',
      senderEmail: 'direction@entreprise.com',
      time: 'Hier',
      date: '2024-01-14T16:00:00Z',
      priority: 'medium',
      unread: false,
      service: 'gmail'
    },
    {
      id: '4',
      subject: 'Invitation: Webinar Intelligence Artificielle',
      preview: 'Vous êtes invité à notre webinar sur l\'IA dans les entreprises. Date: 15 février à 10h. Places limitées.',
      sender: 'Event Team',
      senderEmail: 'events@tech.fr',
      time: 'Il y a 2 jours',
      date: '2024-01-13T14:00:00Z',
      priority: 'low',
      unread: false,
      service: 'outlook'
    },
    {
      id: '5',
      subject: 'Confirmation de commande #4521',
      preview: 'Votre commande a été confirmée et sera livrée sous 3-5 jours ouvrés. Numéro de suivi: TR789012.',
      sender: 'Shop Elite',
      senderEmail: 'commandes@shopelite.com',
      time: 'Il y a 3 jours',
      date: '2024-01-12T10:00:00Z',
      priority: 'low',
      unread: false,
      service: 'gmail'
    }
  ])

  const [tasks, setTasks] = useState([
    { id: '1', title: 'Préparer la réunion client', priority: 'high', dueDate: '2024-01-16', completed: false },
    { id: '2', title: 'Envoyer le rapport hebdomadaire', priority: 'medium', dueDate: '2024-01-15', completed: false },
    { id: '3', title: 'Réviser les notes de réunion', priority: 'low', dueDate: '2024-01-17', completed: false },
    { id: '4', title: 'Répondre aux emails', priority: 'medium', dueDate: '2024-01-15', completed: true },
    { id: '5', title: 'Mettre à jour le projet', priority: 'high', dueDate: '2024-01-18', completed: false }
  ])

  const [events, setEvents] = useState([
    { id: '1', title: 'Réunion client', time: '14:00 - 15:30', date: '2024-01-16', type: 'meeting' },
    { id: '2', title: 'Point équipe', time: '09:00 - 09:30', date: '2024-01-15', type: 'standup' },
    { id: '3', title: 'Deadline projet', time: 'Toute la journée', date: '2024-01-18', type: 'deadline' },
    { id: '4', title: 'Webinar IA', time: '10:00 - 11:30', date: '2024-02-15', type: 'event' }
  ])

  const [messages, setMessages] = useState([
    { id: '1', sender: 'Ahmed', preview: 'Salut, tu es disponible demain ?', time: '10:30', unread: true, service: 'whatsapp' },
    { id: '2', sender: 'Team Design', preview: 'Les maquettes sont prêtes', time: '09:15', unread: true, service: 'slack' },
    { id: '3', sender: 'Marie', preview: 'Merci pour le retour !', time: 'Hier', unread: false, service: 'whatsapp' }
  ])

  const [filterPriority, setFilterPriority] = useState('all')
  const [filterTime, setFilterTime] = useState('today')
  const [activeSection, setActiveSection] = useState('dashboard')

  // Filter emails based on priority and time
  const filteredEmails = emails.filter(email => {
    if (filterPriority !== 'all' && email.priority !== filterPriority) return false
    
    if (filterTime === 'today') {
      const today = new Date().toDateString()
      const emailDate = new Date(email.date).toDateString()
      return today === emailDate
    }
    if (filterTime === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(email.date) >= weekAgo
    }
    return true
  })

  // Stats
  const stats = {
    unreadEmails: emails.filter(e => e.unread).length,
    pendingTasks: tasks.filter(t => !t.completed).length,
    todayEvents: events.filter(e => e.date === new Date().toISOString().split('T')[0]).length,
    unreadMessages: messages.filter(m => m.unread).length
  }

  const connectService = async (serviceName) => {
    // Simulate OAuth connection
    await new Promise(resolve => setTimeout(resolve, 1500))
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        connected: true,
        lastSync: new Date().toISOString()
      }
    }))
  }

  const disconnectService = (serviceName) => {
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        connected: false,
        lastSync: undefined
      }
    }))
  }

  const syncService = async (serviceName) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    setServices(prev => ({
      ...prev,
      [serviceName]: {
        ...prev[serviceName],
        lastSync: new Date().toISOString()
      }
    }))
  }

  const markEmailRead = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, unread: false } : email
    ))
  }

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const value = {
    services,
    emails,
    filteredEmails,
    tasks,
    events,
    messages,
    stats,
    filterPriority,
    filterTime,
    activeSection,
    setFilterPriority,
    setFilterTime,
    setActiveSection,
    connectService,
    disconnectService,
    syncService,
    markEmailRead,
    toggleTask
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export default DashboardContext