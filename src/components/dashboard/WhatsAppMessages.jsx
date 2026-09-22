import { useState, useEffect, useRef, useMemo } from 'react'
import { MessageCircle, Send, ArrowLeft, Star, Image, Film, Mic, FileText, MapPin, Loader2, Search, Paperclip, Smile } from 'lucide-react'
import { apiFetch } from '../../utils/api'

export default function WhatsAppMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [search, setSearch] = useState('')
  const [activeChat, setActiveChat] = useState(null)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [filter, setFilter] = useState('all')
  const refreshRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    checkStatus()
    loadMessages()
    refreshRef.current = setInterval(() => { checkStatus(); loadMessages() }, 3000)
    return () => { if (refreshRef.current) clearInterval(refreshRef.current) }
  }, [])

  useEffect(() => {
    if (activeChat) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeChat, messages])

  const checkStatus = async () => {
    try {
      const data = await apiFetch('/api/whatsapp/status')
      setConnected(data.status === 'connected')
    } catch (err) { console.error(err) }
  }

  const loadMessages = async () => {
    try {
      const data = await apiFetch('/api/whatsapp/messages')
      setMessages(data.messages || [])
      setConnected(true)
    } catch (err) { setConnected(false) }
  }

  const handleSend = async () => {
    if (!activeChat || !replyBody.trim()) return
    setSending(true)
    const chatId = activeChat.chatId
    const body = replyBody.trim()
    setReplyBody('')
    try {
      await apiFetch('/api/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({ to: chatId, message: body }),
      })
      const newMsg = {
        id: 'sent-' + Date.now(),
        from: 'Moi',
        chatId,
        body,
        timestamp: new Date().toISOString(),
        fromMe: true,
        type: 'text',
      }
      setMessages(prev => [newMsg, ...prev])
      setActiveChat(prev => {
        if (!prev || prev.chatId !== chatId) return prev
        return { ...prev, messages: [...prev.messages, newMsg], lastMessage: newMsg }
      })
      setTimeout(() => loadMessages(), 1000)
    } catch (err) {
      setReplyBody(body)
    } finally { setSending(false) }
  }

  const handlePriority = async (chatId, priority, e) => {
    e.stopPropagation()
    try {
      await apiFetch('/api/whatsapp/priority', {
        method: 'POST',
        body: JSON.stringify({ chatId, priority }),
      })
      setMessages(prev => prev.map(m => m.chatId === chatId ? { ...m, priority } : m))
    } catch (err) {}
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 86400000) return "Aujourd'hui"
    if (diff < 172800000) return 'Hier'
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }

  const getMsgIcon = (type) => {
    const icons = { image: Image, video: Film, audio: Mic, document: FileText, location: MapPin }
    const I = icons[type]
    return I ? <I size={10} className="text-muted shrink-0" /> : null
  }

  const chats = useMemo(() => {
    const grouped = {}
    for (const msg of messages) {
      if (!msg.chatId) continue
      if (!grouped[msg.chatId]) grouped[msg.chatId] = { chatId: msg.chatId, messages: [], lastMessage: null, priority: msg.priority || 'none' }
      grouped[msg.chatId].messages.push(msg)
      if (msg.priority && msg.priority !== 'none') grouped[msg.chatId].priority = msg.priority
      if (!grouped[msg.chatId].lastMessage || new Date(msg.timestamp) > new Date(grouped[msg.chatId].lastMessage.timestamp)) {
        grouped[msg.chatId].lastMessage = msg
      }
    }
    let result = Object.values(grouped).filter(c => c.lastMessage)
    if (filter === 'important') result = result.filter(c => c.priority === 'important')
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c => c.lastMessage.from.toLowerCase().includes(q) || c.lastMessage.body?.toLowerCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp))
  }, [messages, filter, search])

  const activeMessages = useMemo(() => {
    if (!activeChat) return []
    return messages.filter(m => m.chatId === activeChat.chatId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [messages, activeChat])

  if (!connected) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--color-accent/10)' }}>
          <MessageCircle size={28} className="text-accent" />
        </div>
        <h3 className="text-sm font-display font-medium mb-2">WhatsApp non connecte</h3>
        <p className="text-xs text-muted max-w-xs mx-auto">Connecte ton WhatsApp dans "Services connectes" pour voir et envoyer des messages directement depuis l'app.</p>
      </div>
    )
  }

  const chatList = (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-display font-medium flex-1 flex items-center gap-2">
            <MessageCircle size={14} /> WhatsApp
          </h3>
          <div className="flex gap-0.5">
            {['all', 'important'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${filter === f ? 'bg-accent/20 text-accent' : 'text-muted hover:text-text'}`}>
                {f === 'all' ? 'Tous' : '★'}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Rechercher une conversation..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="text-xs text-muted text-center py-8">Aucune conversation</p>
        ) : chats.map(chat => {
          const last = chat.lastMessage
          const isActive = activeChat?.chatId === chat.chatId
          const isImportant = chat.priority === 'important'
          const preview = last.fromMe ? 'Toi: ' : ''
          const previewText = last.body || (last.type !== 'text' ? `[${last.type}]` : '')
          return (
            <div key={chat.chatId}
              onClick={() => setActiveChat(chat)}
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-all duration-150 border-b ${isActive ? 'bg-accent/10' : 'hover:bg-white/5'}`}
              style={{ borderColor: 'var(--color-border)' }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-accent/20), var(--color-accentSec/20))', color: 'var(--color-accent)' }}>
                {last.fromMe ? 'M' : last.from?.slice(0, 2)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{last.fromMe ? 'Moi' : last.from}</span>
                  <span className="text-[10px] text-muted shrink-0 ml-2">{formatDate(last.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {last.fromMe && <span className="text-[10px] text-muted">Toi: </span>}
                  {getMsgIcon(last.type)}
                  <p className="text-[11px] text-muted truncate flex-1">{previewText || '...'}</p>
                  {isImportant && <Star size={9} className="text-accentSec fill-accentSec shrink-0" />}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const chatView = activeChat ? (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 py-2.5 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={() => setActiveChat(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-muted md:hidden">
          <ArrowLeft size={16} />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-accent/20), var(--color-accentSec/20))', color: 'var(--color-accent)' }}>
          {activeChat.lastMessage.fromMe ? 'M' : activeChat.lastMessage.from?.slice(0, 2)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{activeChat.lastMessage.from}</p>
          <p className="text-[10px] text-muted">{activeChat.messages.length} message{activeChat.messages.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={(e) => handlePriority(activeChat.chatId, activeChat.priority === 'important' ? 'none' : 'important', e)}
          className={`p-2 rounded-lg transition-all ${activeChat.priority === 'important' ? 'text-accentSec' : 'text-muted hover:text-accentSec'}`}>
          <Star size={14} className={activeChat.priority === 'important' ? 'fill-accentSec' : ''} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ background: 'var(--color-bg)' }}>
        {activeMessages.map((msg, i) => {
          const showDate = i === 0 || formatDate(activeMessages[i - 1]?.timestamp) !== formatDate(msg.timestamp)
          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="text-[10px] px-3 py-1 rounded-full" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              )}
              <div className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 text-[13px] relative ${msg.fromMe
                  ? 'rounded-2xl rounded-br-md'
                  : 'rounded-2xl rounded-bl-md'
                }`}
                  style={msg.fromMe
                    ? { background: 'var(--color-accent/20)', color: 'var(--color-text)' }
                    : { background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }
                  }>
                  {msg.type === 'image' && (
                    <div className="w-48 h-32 rounded-lg mb-1 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                      <Image size={24} className="text-muted" />
                    </div>
                  )}
                  {msg.type === 'video' && (
                    <div className="w-48 h-32 rounded-lg mb-1 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
                      <Film size={24} className="text-muted" />
                    </div>
                  )}
                  {msg.type === 'audio' && (
                    <div className="flex items-center gap-2 mb-1 px-2 py-1.5 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                      <Mic size={12} className="text-accent" />
                      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--color-border)' }}>
                        <div className="h-full w-0 rounded-full bg-accent" />
                      </div>
                      <span className="text-[9px] text-muted">0:00</span>
                    </div>
                  )}
                  {msg.body ? (
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                  ) : msg.type !== 'text' ? (
                    <p className="italic text-muted text-[11px]">[{msg.type}]</p>
                  ) : null}
                  <div className={`flex items-center justify-end gap-1 mt-0.5 ${msg.fromMe ? '' : ''}`}>
                    <span className="text-[9px] opacity-60">{formatTime(msg.timestamp)}</span>
                    {msg.fromMe && (
                      <svg width="12" height="8" viewBox="0 0 16 10" className="opacity-60">
                        <path d="M1 5l3 3 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="px-3 py-2 border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-all">
            <Paperclip size={16} />
          </button>
          <div className="flex-1 relative">
            <input type="text" placeholder="Message..." value={replyBody} onChange={e => setReplyBody(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-text placeholder:text-muted focus:outline-none transition-colors" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
          </div>
          <button className="p-2 rounded-lg text-muted hover:text-text hover:bg-white/5 transition-all">
            <Smile size={16} />
          </button>
          <button onClick={handleSend} disabled={!replyBody.trim() || sending}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-30"
            style={{ background: replyBody.trim() ? 'var(--color-accent)' : 'var(--color-bg)', color: replyBody.trim() ? 'var(--color-bg)' : 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-accent/10)' }}>
        <MessageCircle size={32} className="text-accent" />
      </div>
      <h3 className="text-base font-display font-medium mb-1">WhatsApp Web</h3>
      <p className="text-xs text-muted max-w-xs">Envoie et recois des messages directement depuis ton navigateur. Selectionne une conversation.</p>
    </div>
  )

  return (
    <div className="rounded-2xl overflow-hidden flex" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)', height: '520px' }}>
      <div className={`w-full md:w-80 md:min-w-[320px] border-r flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`} style={{ borderColor: 'var(--color-border)' }}>
        {chatList}
      </div>
      <div className={`flex-1 flex flex-col ${activeChat ? 'flex' : 'hidden md:flex'}`}>
        {chatView}
      </div>
    </div>
  )
}
