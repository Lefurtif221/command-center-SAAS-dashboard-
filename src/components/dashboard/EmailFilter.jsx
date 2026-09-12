import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function EmailFilter() {
  const { filteredEmails, filterPriority, filterTime, setFilterPriority, setFilterTime, markEmailRead, emailError, refreshEmails, updateEmailPriority } = useDashboard()
  const [expanded, setExpanded] = useState(null)
  const [ruleLoading, setRuleLoading] = useState(null)
  const [keywordInput, setKeywordInput] = useState('')
  const [keywordPriority, setKeywordPriority] = useState('high')
  const [showKeywordForm, setShowKeywordForm] = useState(false)
  const [rules, setRules] = useState([])
  const [replyModal, setReplyModal] = useState(null)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [emailModal, setEmailModal] = useState(null)
  const [emailBody, setEmailBody] = useState('')
  const [emailBodyLoading, setEmailBodyLoading] = useState(false)
  const pColors = { high: 'bg-accentSec', low: 'bg-success' }
  const pLabels = { high: 'Important', low: 'Non important' }

  useEffect(() => { fetchRules() }, [])

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/services/email-rules`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setRules(data.rules || [])
    } catch (err) { console.error(err) }
  }

  const markImportant = async (senderEmail, e) => {
    e.stopPropagation()
    setRuleLoading(senderEmail)
    try {
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/services/email-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sender: senderEmail, priority: 'high' }),
      })
      await fetchRules()
      updateEmailPriority(senderEmail, 'high')
    } catch (err) { console.error(err) }
    finally { setRuleLoading(null) }
  }

  const markNotImportant = async (senderEmail, e) => {
    e.stopPropagation()
    setRuleLoading(senderEmail)
    try {
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/services/email-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sender: senderEmail, priority: 'low' }),
      })
      await fetchRules()
      updateEmailPriority(senderEmail, 'low')
    } catch (err) { console.error(err) }
    finally { setRuleLoading(null) }
  }

  const addKeywordRule = async () => {
    if (!keywordInput.trim()) return
    try {
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/services/email-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ keyword: keywordInput.trim(), priority: keywordPriority }),
      })
      setKeywordInput('')
      await fetchRules()
    } catch (err) { console.error(err) }
  }

  const deleteRule = async (id) => {
    try {
      const token = localStorage.getItem('command_center_token')
      await fetch(`${API_URL}/api/services/email-rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setRules(prev => prev.filter(r => r.id !== id))
    } catch (err) { console.error(err) }
  }

  const openEmailFull = async (email) => {
    setEmailModal(email)
    setEmailBody('')
    setEmailBodyLoading(true)
    try {
      const token = localStorage.getItem('command_center_token')
      const res = await fetch(`${API_URL}/api/services/gmail/emails/${email.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('not ok')
      const data = await res.json()
      setEmailBody(data.body || email.preview || '')
    } catch { setEmailBody(email.preview || '') }
    finally { setEmailBodyLoading(false) }
  }

  const stripHtml = (html) => {
    if (!html) return ''
    const el = document.createElement('div')
    el.innerHTML = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
    let text = el.textContent || el.innerText || ''
    return text.replace(/\n{3,}/g, '\n\n').trim()
  }

  return (
    <div className="bg-surface border border-border rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="iconify text-accent" data-icon="lucide:zap" data-width="14"></span>
          <h3 className="text-sm font-medium">Filtre intelligent des emails</h3>
        </div>
        <div className="flex items-center gap-2">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-2 py-1 bg-bg border border-border rounded text-xs text-text focus:outline-none focus:border-accent cursor-pointer">
            <option value="all">Tous</option>
            <option value="high">Importants</option>
            <option value="low">Non importants</option>
          </select>
          <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="px-2 py-1 bg-bg border border-border rounded text-xs text-text focus:outline-none focus:border-accent cursor-pointer">
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="all">Tout</option>
          </select>
          <button onClick={() => setShowKeywordForm(!showKeywordForm)} className="px-2 py-1 bg-accent/10 border border-accent/30 text-accent rounded text-xs hover:bg-accent/20 transition-colors">
            Règles
          </button>
        </div>
      </div>

      {showKeywordForm && (
        <div className="p-4 border-b border-border bg-bg/50">
          <p className="text-xs text-muted mb-2">Ajouter un mot-clé (ex: linkedin, promo, facture...)</p>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="Mot-clé..." value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeywordRule()}
              className="flex-1 px-3 py-1.5 bg-bg border border-border rounded text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors" />
            <select value={keywordPriority} onChange={(e) => setKeywordPriority(e.target.value)} className="px-2 py-1.5 bg-bg border border-border rounded text-xs text-text focus:outline-none focus:border-accent cursor-pointer">
              <option value="high">Important</option>
              <option value="low">Non important</option>
            </select>
            <button onClick={addKeywordRule} disabled={!keywordInput.trim()} className="px-3 py-1.5 bg-accent text-bg text-xs font-medium rounded hover:bg-[#33c2ff] transition-colors disabled:opacity-50">+</button>
          </div>
          {rules.length > 0 && (
            <div className="space-y-1">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between px-2 py-1.5 bg-bg rounded text-xs">
                  <span className="text-text">
                    {rule.keyword ? <><span className="text-accent">Mot-clé:</span> {rule.keyword}</> : <><span className="text-accent">Expéditeur:</span> {rule.sender}</>}
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${rule.priority === 'high' ? 'bg-accentSec/10 text-accentSec' : 'bg-success/10 text-success'}`}>
                      {rule.priority === 'high' ? 'Important' : 'Non important'}
                    </span>
                  </span>
                  <button onClick={() => deleteRule(rule.id)} className="text-muted hover:text-accentSec transition-colors">
                    <span className="iconify" data-icon="lucide:x" data-width="12"></span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {emailError && <div className="px-4 py-2 bg-accentSec/10 border-b border-accentSec/30 text-accentSec text-xs">{emailError}</div>}
      <div className="divide-y divide-border">
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center">
            <span className="iconify text-muted mx-auto mb-2 block" data-icon="lucide:inbox" data-width="32"></span>
            <p className="text-sm text-muted">Aucun email ne correspond aux filtres</p>
          </div>
        ) : filteredEmails.map((email) => (
          <div key={email.id} className={`p-4 transition-colors cursor-pointer ${email.unread ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-bg/50'}`}
            onClick={() => { openEmailFull(email); if (email.unread) markEmailRead(email.id) }}>
            <div className="flex items-start gap-3">
              <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${pColors[email.priority] || 'bg-muted'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {email.unread && <span className="w-1.5 h-1.5 bg-accent rounded-full" />}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${email.priority === 'high' ? 'bg-accentSec/10 text-accentSec' : 'bg-success/10 text-success'}`}>{pLabels[email.priority] || email.priority}</span>
                </div>
                <p className={`text-sm ${email.unread ? 'font-medium text-text' : 'text-muted'}`}>{email.subject}</p>
                <p className="text-xs text-muted/70 truncate mt-0.5">{email.preview}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-muted">{email.time}</p>
                <p className="text-[10px] text-accent mt-0.5">{email.sender}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEmailModal(null)}>
          <div className="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{emailModal.subject}</h4>
                <p className="text-[10px] text-muted mt-0.5">De : {emailModal.sender} &lt;{emailModal.senderEmail}&gt;</p>
              </div>
              <button onClick={() => setEmailModal(null)} className="text-muted hover:text-text ml-2 flex-shrink-0"><span className="iconify" data-icon="lucide:x" data-width="16"></span></button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              {emailBodyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <span className="iconify text-accent animate-spin" data-icon="lucide:loader-2" data-width="24"></span>
                </div>
              ) : (
                <div className="text-sm text-text whitespace-pre-wrap font-sans leading-relaxed break-words overflow-hidden" style={{ wordBreak: 'break-all', maxWidth: '100%' }}>{stripHtml(emailBody)}</div>
              )}
            </div>
            <div className="flex gap-2 p-4 border-t border-border flex-shrink-0">
              <button onClick={() => { setEmailModal(null); setReplyModal(emailModal); setReplyBody('') }}
                className="px-3 py-1.5 bg-accent text-bg text-xs font-medium rounded hover:bg-[#33c2ff] transition-colors">Répondre</button>
              <button onClick={() => markImportant(emailModal.senderEmail, { stopPropagation: () => {} })} disabled={ruleLoading === emailModal.senderEmail}
                className="px-3 py-1.5 bg-accentSec/10 border border-accentSec/30 text-xs text-accentSec rounded hover:bg-accentSec/20 transition-colors disabled:opacity-50">Important</button>
              <button onClick={() => markNotImportant(emailModal.senderEmail, { stopPropagation: () => {} })} disabled={ruleLoading === emailModal.senderEmail}
                className="px-3 py-1.5 bg-bg border border-border text-xs text-muted rounded hover:text-text transition-colors disabled:opacity-50">Non important</button>
            </div>
          </div>
        </div>
      )}

      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setReplyModal(null); setSendResult(null) }}>
          <div className="bg-surface border border-border rounded-lg p-5 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Répondre</h4>
              <button onClick={() => { setReplyModal(null); setSendResult(null) }} className="text-muted hover:text-text"><span className="iconify" data-icon="lucide:x" data-width="16"></span></button>
            </div>
            <div className="space-y-3">
              <div className="text-xs">
                <span className="text-muted">À : </span><span className="text-text">{replyModal.senderEmail}</span>
              </div>
              <div className="text-xs">
                <span className="text-muted">Sujet : </span><span className="text-text">Re: {replyModal.subject.replace(/^Re:\s*/i, '')}</span>
              </div>
              {sendResult ? (
                <div className={`p-3 rounded-lg text-sm ${sendResult.success ? 'bg-success/10 text-success' : 'bg-accentSec/10 text-accentSec'}`}>
                  {sendResult.success ? 'Email envoyé avec succès !' : sendResult.error}
                </div>
              ) : (
                <textarea placeholder="Votre réponse..." value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors h-32 resize-none" autoFocus />
              )}
              <div className="flex gap-2 justify-end">
                {sendResult ? (
                  <button onClick={() => { setReplyModal(null); setSendResult(null) }} className="px-3 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors">Fermer</button>
                ) : (
                  <>
                    <button onClick={() => setReplyModal(null)} className="px-3 py-2 bg-bg border border-border text-sm text-muted rounded-lg hover:text-text transition-colors">Annuler</button>
                    <button onClick={async () => {
                      if (!replyBody.trim()) return
                      setSending(true)
                      try {
                        const token = localStorage.getItem('command_center_token')
                        const res = await fetch(`${API_URL}/api/services/gmail/reply`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ to: replyModal.senderEmail, subject: replyModal.subject, body: replyBody.trim() }),
                        })
                        const data = await res.json()
                        setSendResult(data.success ? { success: true } : { success: false, error: data.error })
                      } catch (err) { setSendResult({ success: false, error: err.message }) }
                      finally { setSending(false) }
                    }} disabled={sending || !replyBody.trim()} className="px-3 py-2 bg-accent text-bg text-sm font-medium rounded-lg hover:bg-[#33c2ff] transition-colors disabled:opacity-50">
                      {sending ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
