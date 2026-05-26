import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/dashboard', label: 'Home', icon: HomeIcon },
  { to: '/studio', label: 'Studio', icon: MicIcon },
  { to: '/debate', label: 'Debate', icon: SwordsIcon },
  { to: '/analytics', label: 'DNA', icon: DNAIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
]

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-midnight-charcoal/95 backdrop-blur border-t border-white/5 mobile-safe-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                isActive ? 'text-gold' : 'text-ivory-muted',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={isActive ? 'text-gold' : 'text-ivory-muted'} />
                <span className="text-[10px] font-sans font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function HomeIcon({ size = 22, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function MicIcon({ size = 22, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
}
function SwordsIcon({ size = 22, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/></svg>
}
function DNAIcon({ size = 22, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M2 15C8 15 16 9 22 9"/><path d="M2 9c6 0 14 6 20 6"/></svg>
}
function UserIcon({ size = 22, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
