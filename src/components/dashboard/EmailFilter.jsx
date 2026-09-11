import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function EmailFilter() {
  const { filteredEmails, filterPriority, filterTime, setFilterPriority, setFilterTime, markEmailRead, emailError } = useDashboard()
  const [expanded, setExpanded] = useState(null)
  const [ruleLoading, setRuleLoading] = useState(null)
  const pColors = { high: 'bg-accentSec', medium: 'bg-warning', low: 'bg-success' }
  const pLabels = { high: 'Important', medium: 'Moyen', low: 'Non important' }

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
      window.location.reload()
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
      window.location.reload()
    } catch (err) { console.error(err) }
    finally { setRuleLoading(null) }
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
        </div>
      </div>
      {emailError && <div className="px-4 py-2 bg-accentSec/10 border-b border-accentSec/30 text-accentSec text-xs">{emailError}</div>}
      <div className="divide-y divide-border">
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center">
            <span className="iconify text-muted mx-auto mb-2 block" data-icon="lucide:inbox" data-width="32"></span>
            <p className="text-sm text-muted">Aucun email ne correspond aux filtres</p>
          </div>
        ) : filteredEmails.map((email) => (
          <div key={email.id} className={`p-4 transition-colors cursor-pointer ${email.unread ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-bg/50'}`}
            onClick={() => { setExpanded(expanded === email.id ? null : email.id); if (email.unread) markEmailRead(email.id) }}>
            <div className="flex items-start gap-3">
              <div className={`w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0 ${pColors[email.priority]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {email.unread && <span className="w-1.5 h-1.5 bg-accent rounded-full" />}
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${email.priority === 'high' ? 'bg-accentSec/10 text-accentSec' : 'bg-success/10 text-success'}`}>{pLabels[email.priority]}</span>
                </div>
                <p className={`text-sm ${email.unread ? 'font-medium text-text' : 'text-muted'}`}>{email.subject}</p>
                <p className="text-xs text-muted/70 truncate mt-0.5">{email.preview}</p>
                {expanded === email.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted mb-3">{email.preview}</p>
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-3 py-1.5 bg-accent text-bg text-xs font-medium rounded hover:bg-[#33c2ff] transition-colors">Répondre</button>
                      <button className="px-3 py-1.5 bg-bg border border-border text-xs text-muted rounded hover:text-text transition-colors">Transférer</button>
                      <button onClick={(e) => markImportant(email.senderEmail, e)} disabled={ruleLoading === email.senderEmail}
                        className="px-3 py-1.5 bg-accentSec/10 border border-accentSec/30 text-xs text-accentSec rounded hover:bg-accentSec/20 transition-colors disabled:opacity-50">
                        {ruleLoading === email.senderEmail ? '...' : 'Important'}
                      </button>
                      <button onClick={(e) => markNotImportant(email.senderEmail, e)} disabled={ruleLoading === email.senderEmail}
                        className="px-3 py-1.5 bg-bg border border-border text-xs text-muted rounded hover:text-text transition-colors disabled:opacity-50">
                        {ruleLoading === email.senderEmail ? '...' : 'Non important'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-muted">{email.time}</p>
                <p className="text-[10px] text-accent mt-0.5">{email.sender}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}