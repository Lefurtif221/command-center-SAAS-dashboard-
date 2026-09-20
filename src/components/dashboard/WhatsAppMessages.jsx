import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MessageCircle, Send, X, Loader2, Star, Image, Film, Mic, FileText, MapPin } from 'lucide-react'
import { apiFetch } from '../../utils/api'

const typeIcons = { image: Image, video: Film, audio: Mic, document: FileText, location: MapPin }

export default function WhatsAppMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [filter, setFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [replyModal, setReplyModal] = useState(null)
  const [replyTo, setReplyTo] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const refreshRef = useRef(null)

  useEffect(() => {
    checkStatus()
    loadMessages()
    refreshRef.current = setInterval(() => {
      checkStatus()
      loadMessages()
    }, 5000)
    return () => { if (refreshRef.current) clearInterval(refreshRef.current) }
  }, [])

  const checkStatus = async () => {
    try {
      const data = await apiFetch('/api/whatsapp/status')
      setConnected(data.status === 'connected')
    } catch (err) { console.error(err) }
  }

  const loadMessages = async () => {
    setLoading(true)
    try {
      const data = await apiFetch('/api/whatsapp/messages')
      setMessages(data.messages || [])
      setConnected(true)
    } catch (err) {
      console.error('Load WhatsApp messages error:', err)
      setConnected(false)
    } finally { setLoading(false) }
  }

  const handleSend = async () => {
    if (!replyTo || !replyBody.trim()) return
    setSending(true); setSendResult(null)
    try {
      await apiFetch('/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({ to: replyTo, message: replyBody.trim() }),
      })
      setSendResult({ ok: true, text: 'Envoye !' })
      setReplyBody('')
      setTimeout(() => { setReplyModal(null); setSendResult(null) }, 1500)
      loadMessages()
    } catch (err) {
      setSendResult({ ok: false, text: err.message || 'Erreur' })
    } finally { setSending(false) }
  }

  const handlePriority = async (chatId, priority, e) => {
    e.stopPropagation()
    try {
      await apiFetch('/api/whatsapp/priority', {
        method: 'POST',
        body: JSON.stringify({ chatId, priority }),
      })
      setMessages(prev => prev.map(m =>
        m.chatId === chatId ? { ...m, priority } : m
      ))
    } catch (err) { console.error(err) }
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diff = now - d
    if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (diff < 604800000) return d.toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const filteredMessages = messages.filter(msg => {
    if (search) {
      const q = search.toLowerCase()
      if (!msg.body.toLowerCase().includes(q) && !msg.from.toLowerCase().includes(q)) return false
    }
    if (filter === 'received') return !msg.fromMe
    if (filter === 'sent') return msg.fromMe
    return true
  })

  const groupedByChat = filteredMessages.reduce((acc, msg) => {
    const key = msg.chatId
    if (!acc[key]) acc[key] = { chatId: key, messages: [], lastMessage: null, priority: 'none' }
    acc[key].messages.push(msg)
    if (msg.priority && msg.priority !== 'none') acc[key].priority = msg.priority
    if (!acc[key].lastMessage || new Date(msg.timestamp) > new Date(acc[key].lastMessage.timestamp)) {
      acc[key].lastMessage = msg
    }
    return acc
  }, {})

  let chats = Object.values(groupedByChat)
    .filter(c => c.lastMessage)
    .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp))

  if (priorityFilter === 'important') chats = chats.filter(c => c.priority === 'important')
  else if (priorityFilter === 'normal') chats = chats.filter(c => c.priority !== 'important')

  if (!connected) {
    return (
      <div className="glass rounded-xl p-6 text-center" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
        <MessageCircle size={24} className="mx-auto mb-2 text-muted" />
        <p className="text-xs text-muted">Connecte WhatsApp dans "Services connectes" pour voir tes messages</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl flex flex-col" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', height: '500px' }}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-sm font-display font-medium flex items-center gap-2">
          <MessageCircle size={14} /> WhatsApp
        </h3>
        <div className="flex gap-1">
          {['all', 'received', 'sent'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${filter === f ? 'bg-accent/20 text-accent' : 'text-muted hover:text-text'}`}>
              {f === 'all' ? 'Tout' : f === 'received' ? 'Recus' : 'Envoyes'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 pt-2">
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-lg text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
        <div className="flex gap-1">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'important', label: 'Important' },
            { key: 'normal', label: 'Normal' },
          ].map(f => (
            <button key={f.key} onClick={() => setPriorityFilter(f.key)}
              className={`px-2 py-1.5 rounded-lg text-[10px] font-mono transition-all whitespace-nowrap ${priorityFilter === f.key ? 'bg-accentSec/20 text-accentSec' : 'text-muted hover:text-text'}`}
              style={priorityFilter === f.key ? { border: '1px solid var(--color-accentSec)' } : { border: '1px solid transparent' }}>
              {f.key === 'important' ? '* ' : ''}{f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={16} className="animate-spin text-accent" /></div>
        ) : chats.length === 0 ? (
          <p className="text-xs text-muted text-center py-8">Aucun message</p>
        ) : chats.map(chat => {
          const lastMsg = chat.lastMessage
          const preview = !lastMsg.body ? '[' + (lastMsg.type || 'message') + ']' : lastMsg.body.length > 50 ? lastMsg.body.slice(0, 50) + '...' : lastMsg.body
          const isImportant = chat.priority === 'important'
          const Icon = typeIcons[lastMsg.type]
          return (
            <div key={chat.chatId} onClick={() => { setReplyModal(chat); setReplyTo(chat.chatId) }}
              className={`p-2.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent/5 ${isImportant ? 'ring-1 ring-accentSec/30' : ''}`}>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0" style={{ background: lastMsg.fromMe ? 'var(--color-accent/15)' : 'var(--color-accentSec/15)', color: lastMsg.fromMe ? 'var(--color-accent)' : 'var(--color-accentSec)' }}>
                  {lastMsg.fromMe ? 'M' : lastMsg.from.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate">{lastMsg.fromMe ? 'Moi' : lastMsg.from}</span>
                      {isImportant && <Star size={10} className="text-accentSec fill-accentSec shrink-0" />}
                    </div>
                    <span className="text-[9px] text-muted font-mono shrink-0 ml-2">{formatTime(lastMsg.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Icon && <Icon size={10} className="text-muted shrink-0" />}
                    <p className="text-[11px] text-muted truncate">{preview}</p>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] font-mono text-muted">{chat.messages.length} message{chat.messages.length > 1 ? 's' : ''}</span>
                    <button onClick={(e) => handlePriority(chat.chatId, isImportant ? 'none' : 'important', e)}
                      className="text-[9px] text-muted hover:text-accentSec transition-colors">
                      {isImportant ? '* Retirer' : '* Important'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {replyModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => { setReplyModal(null); setSendResult(null) }}>
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl max-h-[80vh] flex flex-col" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">{replyModal.lastMessage.fromMe ? 'Moi' : replyModal.lastMessage.from}</h4>
              <button onClick={() => { setReplyModal(null); setSendResult(null) }} className="p-1 rounded-lg hover:bg-muted/10"><X size={14} className="text-muted" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[40vh] pr-1">
              {replyModal.messages.slice().reverse().map(msg => (
                <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${msg.fromMe ? 'bg-accent/15 text-text rounded-br-sm' : 'rounded-bl-sm'}`} style={!msg.fromMe ? { background: 'var(--color-bg)', border: '1px solid var(--color-border)' } : {}}>
                    {msg.body ? (
                      <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    ) : (
                      <p className="whitespace-pre-wrap break-words italic text-muted">[{msg.type || 'message'}]</p>
                    )}
                    <p className="text-[9px] text-muted mt-1 text-right">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Ton message..." value={replyBody} onChange={e => setReplyBody(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-2 rounded-xl text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
              <button onClick={handleSend} disabled={!replyBody.trim() || sending}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50">
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
            {sendResult && (
              <p className={`text-xs mt-2 text-center ${sendResult.ok ? 'text-success' : 'text-accentSec'}`}>{sendResult.text}</p>
            )}
          </div>
        </div>, document.body
      )}
    </div>
  )
}
