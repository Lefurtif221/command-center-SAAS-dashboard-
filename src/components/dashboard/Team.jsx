import { useState, useEffect } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { apiFetch } from '../../utils/api'
import { Users, Plus, Mail, Copy, Trash2, ShieldCheck, UserPlus, X, Check, Link2 } from 'lucide-react'
import UpgradeButton from './UpgradeButton'
import ProPerks from './ProPerks'

const roleLabels = { owner: 'Proprietaire', admin: 'Admin', member: 'Membre' }

export default function Team() {
  const { teams, fetchTeams, fetchTasks, plan, planLimits } = useDashboard()
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [newTeamName, setNewTeamName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [lastInviteUrl, setLastInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => { if (!selectedId && teams.length > 0) setSelectedId(teams[0].id) }, [teams, selectedId])

  const loadDetail = async (id) => {
    if (!id) { setDetail(null); return }
    try {
      const data = await apiFetch(`/api/teams/${id}`)
      setDetail(data)
    } catch (err) {
      setError(err.message)
      setDetail(null)
    }
  }

  useEffect(() => { loadDetail(selectedId) }, [selectedId])

  const handleCreate = async () => {
    if (!newTeamName.trim()) return
    setLoading(true); setError(''); setNotice('')
    try {
      const data = await apiFetch('/api/teams', { method: 'POST', body: JSON.stringify({ name: newTeamName.trim() }) })
      setNewTeamName('')
      await fetchTeams()
      setSelectedId(data.team.id)
      setNotice('Equipe creee.')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleInvite = async () => {
    if (!inviteEmail.includes('@')) { setError('Email invalide'); return }
    setLoading(true); setError(''); setNotice('')
    try {
      const data = await apiFetch(`/api/teams/${selectedId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      setLastInviteUrl(data.inviteUrl)
      setInviteEmail('')
      await loadDetail(selectedId)
      setNotice(`Invitation envoyee a ${data.invitation.email}`)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const copyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* presse-papiers indisponible */ }
  }

  const revokeInvite = async (invId) => {
    setError(''); setNotice('')
    try {
      await apiFetch(`/api/teams/${selectedId}/invitations/${invId}`, { method: 'DELETE' })
      await loadDetail(selectedId)
    } catch (err) { setError(err.message) }
  }

  const changeRole = async (userId, role) => {
    setError(''); setNotice('')
    try {
      await apiFetch(`/api/teams/${selectedId}/members/${userId}`, { method: 'PUT', body: JSON.stringify({ role }) })
      await loadDetail(selectedId)
      await fetchTeams()
    } catch (err) { setError(err.message) }
  }

  const removeMember = async (userId) => {
    setError(''); setNotice('')
    try {
      await apiFetch(`/api/teams/${selectedId}/members/${userId}`, { method: 'DELETE' })
      await loadDetail(selectedId)
      await fetchTeams()
      await fetchTasks()
    } catch (err) { setError(err.message) }
  }

  const deleteTeam = async () => {
    if (!window.confirm('Supprimer cette equipe ? Les taches partagees redeviennent personnelles.')) return
    setError(''); setNotice('')
    try {
      await apiFetch(`/api/teams/${selectedId}`, { method: 'DELETE' })
      setSelectedId(null)
      setDetail(null)
      await fetchTeams()
      await fetchTasks()
      setNotice('Equipe supprimee.')
    } catch (err) { setError(err.message) }
  }

  const selected = teams.find(t => t.id === selectedId)
  const isOwner = detail?.role === 'owner' || selected?.role === 'owner'
  const canManage = ['owner', 'admin'].includes(detail?.role)
  const atTeamLimit = plan !== 'pro' && !!planLimits && teams.length >= planLimits.teams
  const atMemberLimit = plan !== 'pro' && !!planLimits && !!detail &&
    (detail.members.length + (detail.invitations?.length || 0)) >= planLimits.teamMembers

  const inputStyle = { background: 'var(--color-bg)', border: '1px solid var(--color-border)' }

  return (
    <div className="rounded-xl" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Users size={14} style={{ color: '#2563EB' }} />
        <h3 className="text-sm font-display font-medium">Equipe</h3>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={plan === 'pro'
          ? { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }
          : { background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          {plan === 'pro' ? 'Pro' : 'Gratuit'}
        </span>
        <span className="text-[11px] ml-auto" style={{ color: 'var(--color-muted)' }}>
          {teams.length}{planLimits ? `/${planLimits.teams}` : ''} {teams.length > 1 ? 'equipes' : 'equipe'}
          {plan !== 'pro' && planLimits ? ` · max ${planLimits.teamMembers} membres` : ''}
        </span>
      </div>

      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-2">
          <input type="text" placeholder="Nouvelle equipe..." value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-colors duration-150"
            style={inputStyle} />
          <button onClick={handleCreate} disabled={loading || !newTeamName.trim() || atTeamLimit}
            className="px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 flex items-center gap-1.5"
            style={{ background: '#2563EB', color: '#FFF' }}>
            <Plus size={15} /> Creer
          </button>
        </div>
        {atTeamLimit && (
          <p className="mt-2 text-[10px] leading-relaxed" style={{ color: '#F59E0B' }}>
            Quota gratuit atteint ({planLimits.teams} equipe). Passe en Pro pour en creer davantage.
          </p>
        )}
        {plan !== 'pro' && (
          <div className="mt-3 space-y-2.5">
            <ProPerks />
            <div className="flex items-center gap-3">
              <UpgradeButton size="sm" />
              <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>2000 le 1er mois, puis 2500 / mois</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 space-y-4">
        {error && <div className="p-2.5 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>{error}</div>}
        {notice && <div className="p-2.5 rounded-lg text-xs" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>{notice}</div>}

        {teams.length === 0 ? (
          <p className="text-sm text-center py-3" style={{ color: 'var(--color-muted)' }}>
            Creez une equipe pour partager vos taches.
          </p>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              {teams.map(t => (
                <button key={t.id} onClick={() => setSelectedId(t.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
                  style={t.id === selectedId
                    ? { background: 'rgba(37,99,235,0.15)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.3)' }
                    : { background: 'var(--color-bg)', color: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
                  {t.name}
                </button>
              ))}
            </div>

            {detail && (
              <div className="space-y-4">
                <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Membres ({detail.members.length})</p>
                    {isOwner && (
                      <button onClick={deleteTeam} className="flex items-center gap-1 text-[11px]" style={{ color: '#EF4444' }}>
                        <Trash2 size={12} /> Supprimer
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {detail.members.map(m => (
                      <div key={m.user_id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold shrink-0"
                          style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}>
                          {m.initials || m.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{m.name}</p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--color-muted)' }}>{m.email}</p>
                        </div>
                        {m.role === 'owner' ? (
                          <span className="flex items-center gap-1 text-[10px] shrink-0" style={{ color: '#2563EB' }}>
                            <ShieldCheck size={11} /> Prop.
                          </span>
                        ) : isOwner ? (
                          <select value={m.role} onChange={(e) => changeRole(m.user_id, e.target.value)}
                            className="text-[10px] px-1.5 py-1 rounded-md cursor-pointer shrink-0"
                            style={inputStyle}>
                            <option value="admin">Admin</option>
                            <option value="member">Membre</option>
                          </select>
                        ) : (
                          <span className="text-[10px] shrink-0" style={{ color: 'var(--color-muted)' }}>{roleLabels[m.role]}</span>
                        )}
                        {m.role !== 'owner' && canManage && (
                          <button onClick={() => removeMember(m.user_id)} className="shrink-0" style={{ color: 'var(--color-muted)' }} aria-label={`Retirer ${m.name}`}>
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {canManage && (
                  <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <p className="text-[11px] font-medium mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
                      <UserPlus size={12} /> Inviter un membre
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="email" placeholder="email@exemple.com" value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                        disabled={atMemberLimit}
                        className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none disabled:opacity-50"
                        style={inputStyle} />
                      <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                        disabled={atMemberLimit}
                        className="px-2 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-50" style={inputStyle}>
                        <option value="member">Membre</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={handleInvite} disabled={loading || !inviteEmail || atMemberLimit}
                        className="px-3 py-2 text-xs font-medium rounded-lg disabled:opacity-50 flex items-center gap-1.5"
                        style={{ background: '#2563EB', color: '#FFF' }}>
                        <Mail size={13} /> Inviter
                      </button>
                    </div>

                    {atMemberLimit && (
                      <p className="mt-2 text-[10px] leading-relaxed" style={{ color: '#F59E0B' }}>
                        Quota gratuit atteint ({planLimits.teamMembers} membres par equipe). Passe en Pro pour inviter plus de monde.
                      </p>
                    )}

                    {lastInviteUrl && (
                      <div className="mt-2 flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--color-surface-solid)', border: '1px solid var(--color-border)' }}>
                        <Link2 size={12} className="shrink-0" style={{ color: '#2563EB' }} />
                        <span className="flex-1 text-[10px] truncate" style={{ color: 'var(--color-muted)' }}>{lastInviteUrl}</span>
                        <button onClick={() => copyLink(lastInviteUrl)} className="shrink-0 flex items-center gap-1 text-[10px]" style={{ color: copied ? '#10B981' : '#2563EB' }}>
                          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copie' : 'Copier'}
                        </button>
                      </div>
                    )}

                    {detail.invitations.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {detail.invitations.map(inv => (
                          <div key={inv.id} className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--color-muted)' }}>
                            <Mail size={11} />
                            <span className="flex-1 truncate">{inv.email} ({roleLabels[inv.role]})</span>
                            <span>en attente</span>
                            <button onClick={() => revokeInvite(inv.id)} style={{ color: '#EF4444' }}>Annuler</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                  Partagez une tache depuis l'onglet Taches pour qu'elle apparaisse ici pour tous les membres.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
