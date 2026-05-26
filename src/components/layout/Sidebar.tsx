import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GraviLogo from '@/components/ui/GraviLogo'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/stores/useAuthStore'
import { signOut } from '@/lib/supabase'

const nav = [
  { to: '/dashboard', label: 'Home', icon: HomeIcon },
  { to: '/studio', label: 'Studio', icon: MicIcon },
  { to: '/debate', label: 'Debate Arena', icon: SwordsIcon },
  { to: '/prompts', label: 'Prompt Arena', icon: LibraryIcon },
  { to: '/analytics', label: 'Speech DNA', icon: DNAIcon },
  { to: '/sessions', label: 'Sessions', icon: HistoryIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
]

export default function Sidebar() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'G'

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen bg-midnight-charcoal border-r border-white/5 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <GraviLogo size={36} animated={false} />
        <span className="font-display text-xl tracking-widest text-ivory uppercase">GRAVI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans transition-all duration-200',
                isActive
                  ? 'bg-gold/10 text-gold border border-gold/20'
                  : 'text-ivory-secondary hover:text-ivory hover:bg-white/5',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-gold' : 'text-current'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 pb-6 pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-midnight font-semibold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-sans text-ivory truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-ivory-muted capitalize truncate">{profile?.role?.replace('_', ' ')}</p>
          </div>
          <Badge variant={profile?.subscription_status === 'pro' ? 'pro' : 'free'}>
            {profile?.subscription_status === 'pro' ? 'Pro' : 'Free'}
          </Badge>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full text-left text-xs text-ivory-muted hover:text-ivory transition-colors px-1 py-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

// ── Icons ────────────────────────────────────────────────────────
function HomeIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function MicIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
}
function SwordsIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="3" y2="21"/></svg>
}
function LibraryIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
function DNAIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 15C8 15 16 9 22 9"/><path d="M2 9c6 0 14 6 20 6"/><path d="M5 15c0 2 1.7 4 3.5 4S12 17 12 15"/><path d="M5 9c0-2 1.7-4 3.5-4S12 7 12 9"/><path d="M19 9c0-2-1.7-4-3.5-4S12 7 12 9"/><path d="M19 15c0 2-1.7 4-3.5 4S12 17 12 15"/></svg>
}
function HistoryIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function UserIcon({ size = 20, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
