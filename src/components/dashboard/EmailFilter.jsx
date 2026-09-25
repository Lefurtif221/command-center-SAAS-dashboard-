import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useDashboard } from '../../hooks/useDashboard'
import { Sparkles, Inbox, X, Loader2, FileText } from 'lucide-react'
import { apiFetch } from '../../utils/api'

export default function EmailFilter() {
  const { filteredEmails, filterPriority, filterTime, setFilterPriority, setFilterTime, markEmailRead, emailError, gmailReconnect, refreshEmails, updateEmailPriority } = useDashboard()
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
  const [pendingReadId, setPendingReadId] = useState(null)
  const [summaryModal, setSummaryModal] = useState(null)
  const [summaryText, setSummaryText] = useState('')
  const [summaryFullBody, setSummaryFullBody] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [showFullEmail, setShowFullEmail] = useState(false)
  const pColors = { high: '#1E40AF', low: '#10B981' }
  const pLabels = { high: 'Important', low: 'Non important' }

  useEffect(() => { fetchRules() }, [])

  useEffect(() => {
    if (pendingReadId) {
      markEmailRead(pendingReadId)
      setPendingReadId(null)
    }
  }, [pendingReadId])

  const fetchRules = async () => {
    try {
      const data = await apiFetch('/api/services/email-rules')
      setRules(data.rules || [])
    } catch (err) { console.error(err) }
  }

  const markImportant = async (senderEmail, e) => {
    e.stopPropagation(); setRuleLoading(senderEmail)
    try {
      await apiFetch('/api/services/email-rules', {
        method: 'POST',
        body: JSON.stringify({ sender: senderEmail, priority: 'high' }),
      })
      await fetchRules(); updateEmailPriority(senderEmail, 'high')
    } catch (err) { console.error(err) } finally { setRuleLoading(null) }
  }

  const markNotImportant = async (senderEmail, e) => {
    e.stopPropagation(); setRuleLoading(senderEmail)
    try {
      await apiFetch('/api/services/email-rules', {
        method: 'POST',
        body: JSON.stringify({ sender: senderEmail, priority: 'low' }),
      })
      await fetchRules(); updateEmailPriority(senderEmail, 'low')
    } catch (err) { console.error(err) } finally { setRuleLoading(null) }
  }

  const addKeywordRule = async () => {
    if (!keywordInput.trim()) return
    try {
      await apiFetch('/api/services/email-rules', {
        method: 'POST',
        body: JSON.stringify({ keyword: keywordInput.trim(), priority: keywordPriority }),
      })
      setKeywordInput(''); await fetchRules()
    } catch (err) { console.error(err) }
  }

  const deleteRule = async (id) => {
    try {
      await apiFetch(`/api/services/email-rules/${id}`, { method: 'DELETE' })
      setRules(prev => prev.filter(r => r.id !== id))
    } catch (err) { console.error(err) }
  }

  const openEmailFull = async (email) => {
    setEmailModal(email); setEmailBody(''); setEmailBodyLoading(true)
    if (email.unread) setPendingReadId(email.id)
    try {
      const data = await apiFetch(`/api/services/gmail/emails/${email.id}`)
      setEmailBody(data.body || email.preview || '')
    } catch { setEmailBody(email.preview || '') } finally { setEmailBodyLoading(false) }
  }

  const openSummary = async (email, e) => {
    e.stopPropagation()
    setSummaryModal(email); setSummaryText(''); setSummaryFullBody(''); setSummaryLoading(true); setShowFullEmail(false)
    if (email.unread) setPendingReadId(email.id)
    try {
      const data = await apiFetch(`/api/services/gmail/emails/${email.id}/summary`)
      setSummaryText(data.summary || 'Résumé non disponible.')
      setSummaryFullBody(data.body || '')
    } catch { setSummaryText('Erreur lors du chargement du résumé.') } finally { setSummaryLoading(false) }
  }

  const stripHtml = (html) => {
    if (!html) return ''
    const el = document.createElement('div')
    el.innerHTML = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n').replace(/<\/tr>/gi, '\n').replace(/<\/li>/gi, '\n')
    let text = el.textContent || el.innerText || ''
    return text.replace(/\n{3,}/g, '\n\n').trim()
  }

  const closeEmailModal = useCallback(() => setEmailModal(null), [])

  const emailModalOverlay = emailModal ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={closeEmailModal}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden rounded-2xl animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium">{emailModal.subject}</h4>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>De : {emailModal.sender} &lt;{emailModal.senderEmail}&gt;</p>
          </div>
          <button onClick={closeEmailModal} className="ml-2 flex-shrink-0 transition-colors p-1 rounded-lg " style={{ color: 'var(--color-muted)' }}><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {emailBodyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: '#2563EB' }} />
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{stripHtml(emailBody)}</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={() => { setEmailModal(null); setReplyModal(emailModal); setReplyBody('') }}
            className="px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-150 " style={{ background: '#2563EB', color: '#FFF' }}>Repondre</button>
          <button onClick={() => markImportant(emailModal.senderEmail, { stopPropagation: () => {} })} disabled={ruleLoading === emailModal.senderEmail}
            className="px-3 py-2 text-xs rounded-lg transition-colors duration-150  disabled:opacity-50" style={{ background: 'rgba(30,64,175,0.1)', border: '1px solid rgba(30,64,175,0.2)', color: '#1E40AF' }}>Important</button>
          <button onClick={() => markNotImportant(emailModal.senderEmail, { stopPropagation: () => {} })} disabled={ruleLoading === emailModal.senderEmail}
            className="px-3 py-2 text-xs rounded-lg transition-colors disabled:opacity-50" style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>Non important</button>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  const replyModalOverlay = replyModal ? createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => { setReplyModal(null); setSendResult(null) }}>
      <div className="rounded-2xl p-5 w-full max-w-lg shadow-2xl animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium">Repondre</h4>
          <button onClick={() => { setReplyModal(null); setSendResult(null) }} className="transition-colors p-1 rounded-lg " style={{ color: 'var(--color-muted)' }}><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div className="text-xs"><span style={{ color: 'var(--color-muted)' }}>A : </span><span>{replyModal.senderEmail}</span></div>
          <div className="text-xs"><span style={{ color: 'var(--color-muted)' }}>Sujet : </span><span>Re: {replyModal.subject.replace(/^Re:\s*/i, '')}</span></div>
          {sendResult ? (
            <div className="p-3 rounded-lg text-sm" style={{ background: sendResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: sendResult.success ? '#10B981' : '#F59E0B' }}>
              {sendResult.success ? 'Email envoye avec succes !' : sendResult.error}
            </div>
          ) : (
            <textarea placeholder="Votre reponse..." value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm placeholder:text-muted focus:outline-none h-32 resize-none transition-all duration-200" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} autoFocus />
          )}
          <div className="flex gap-2 justify-end">
            {sendResult ? (
              <button onClick={() => { setReplyModal(null); setSendResult(null) }} className="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 " style={{ background: '#2563EB', color: '#FFF' }}>Fermer</button>
            ) : (
              <>
                <button onClick={() => setReplyModal(null)} className="px-3 py-2 text-sm rounded-lg transition-colors" style={{ color: 'var(--color-muted)', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>Annuler</button>
                <button onClick={async () => {
                  if (!replyBody.trim()) return; setSending(true)
                  try {
                    const data = await apiFetch('/api/services/gmail/reply', {
                      method: 'POST',
                      body: JSON.stringify({ to: replyModal.senderEmail, subject: replyModal.subject, body: replyBody.trim() }),
                    })
                    setSendResult(data.success ? { success: true } : { success: false, error: data.error })
                  } catch (err) { setSendResult({ success: false, error: err.message }) } finally { setSending(false) }
                }} disabled={sending || !replyBody.trim()} className="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 "
                  style={{ background: '#2563EB', color: '#FFF' }}>
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  const summaryModalOverlay = summaryModal ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setSummaryModal(null)}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden rounded-2xl animate-scale-in" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={16} className="flex-shrink-0" style={{ color: '#2563EB' }} />
            <div className="min-w-0">
              <h4 className="text-sm font-medium truncate">{summaryModal.subject}</h4>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>De : {summaryModal.sender}</p>
            </div>
          </div>
          <button onClick={() => setSummaryModal(null)} className="ml-2 flex-shrink-0 transition-colors p-1 rounded-lg " style={{ color: 'var(--color-muted)' }}><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {summaryLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: '#2563EB' }} />
            </div>
          ) : showFullEmail ? (
            <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{stripHtml(summaryFullBody)}</div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>Resume IA</span>
              </div>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{summaryText}</div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 p-4 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={() => setShowFullEmail(!showFullEmail)}
            className="px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-150 "
            style={{ background: showFullEmail ? 'rgba(37,99,235,0.15)' : 'var(--color-bg)', border: '1px solid var(--color-border)', color: showFullEmail ? '#2563EB' : 'var(--color-text)' }}>
            {showFullEmail ? 'Voir le resume' : 'Voir le mail complet'}
          </button>
          <button onClick={() => { setSummaryModal(null); setReplyModal(summaryModal); setReplyBody('') }}
            className="px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-150 " style={{ background: '#2563EB', color: '#FFF' }}>Repondre</button>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div className="rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: '#2563EB' }} />
          <h3 className="text-sm font-medium">Filtre intelligent des emails</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="px-2 py-2 rounded-lg text-xs focus:outline-none cursor-pointer transition-all duration-200" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <option value="all">Tous</option>
            <option value="high">Importants</option>
            <option value="low">Non importants</option>
          </select>
          <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="px-2 py-2 rounded-lg text-xs focus:outline-none cursor-pointer transition-all duration-200" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="all">Tout</option>
          </select>
          <button onClick={() => setShowKeywordForm(!showKeywordForm)} className="px-2 py-2 rounded-lg text-xs transition-colors duration-150 " style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563EB' }}>
            Regles
          </button>
        </div>
      </div>

      {showKeywordForm && (
        <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>Ajouter un mot-cle (ex: linkedin, promo, facture...)</p>
          <div className="flex gap-2 mb-3">
            <input type="text" placeholder="Mot-cle..." value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeywordRule()}
              className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none transition-all duration-200" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }} />
            <select value={keywordPriority} onChange={(e) => setKeywordPriority(e.target.value)} className="px-2 py-2 rounded-lg text-xs focus:outline-none cursor-pointer transition-all duration-200" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <option value="high">Important</option>
              <option value="low">Non important</option>
            </select>
            <button onClick={addKeywordRule} disabled={!keywordInput.trim()} className="px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 " style={{ background: '#2563EB', color: '#FFF' }}>+</button>
          </div>
          {rules.length > 0 && (
            <div className="space-y-1">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs" style={{ background: 'var(--color-surface-solid)' }}>
                  <span>
                    {rule.keyword ? <><span style={{ color: '#2563EB' }}>Mot-cle:</span> {rule.keyword}</> : <><span style={{ color: '#2563EB' }}>Expediteur:</span> {rule.sender}</>}
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]" style={{ background: rule.priority === 'high' ? 'rgba(30,64,175,0.1)' : 'rgba(16,185,129,0.1)', color: rule.priority === 'high' ? '#1E40AF' : '#10B981' }}>
                      {rule.priority === 'high' ? 'Important' : 'Non important'}
                    </span>
                  </span>
                  <button onClick={() => deleteRule(rule.id)} className="transition-colors " style={{ color: 'var(--color-muted)' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {emailError && (
        <div className="px-4 py-3 text-xs flex items-center justify-between gap-3 flex-wrap" style={{ background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
          <span>{emailError}</span>
          {gmailReconnect && (
            <button onClick={() => {
              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
              const token = localStorage.getItem('command_center_token')
              fetch(`${API_URL}/api/services/gmail/authorize`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json()).then(d => { if (d.url) window.location.href = d.url })
            }} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150  whitespace-nowrap"
              style={{ background: '#2563EB', color: '#FFF' }}>
              Reconnecter Gmail
            </button>
          )}
        </div>
      )}
      <div>
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="mx-auto mb-2" size={32} style={{ color: 'var(--color-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Aucun email ne correspond aux filtres</p>
          </div>
        ) : filteredEmails.map((email) => (
          <div key={email.id} className="p-4 cursor-pointer transition-colors duration-150 group hover:translate-x-1" style={{ borderBottom: '1px solid var(--color-border)', background: email.unread ? 'rgba(37,99,235,0.05)' : 'transparent' }}
            onClick={() => openEmailFull(email)}>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0" style={{ background: pColors[email.priority] || 'var(--color-muted)' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {email.unread && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2563EB' }} />}
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: email.priority === 'high' ? 'rgba(30,64,175,0.1)' : 'rgba(16,185,129,0.1)', color: email.priority === 'high' ? '#1E40AF' : '#10B981' }}>{pLabels[email.priority] || email.priority}</span>
                </div>
                <p className={`text-sm ${email.unread ? 'font-medium' : ''}`} style={{ color: email.unread ? 'var(--color-text)' : 'var(--color-muted)' }}>{email.subject}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-muted)' }}>{email.preview}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={(e) => openSummary(email, e)} className="opacity-0 group-hover:opacity-100 px-2 py-1.5 text-[10px] font-medium rounded-lg transition-colors duration-150 " style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563EB' }}>
                  Resume
                </button>
                <div className="text-right max-w-[100px]">
                  <p className="text-[10px] truncate" style={{ color: 'var(--color-muted)' }}>{email.time}</p>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: '#2563EB' }}>{email.sender}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {emailModalOverlay}
      {replyModalOverlay}
      {summaryModalOverlay}
    </div>
  )
}
