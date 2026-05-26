import type { ReactNode } from 'react'

type Variant = 'gold' | 'subtle' | 'pro' | 'free' | 'success' | 'warn' | 'info'

const variants: Record<Variant, string> = {
  gold: 'bg-gold/10 text-gold border border-gold/30',
  subtle: 'bg-white/5 text-ivory-secondary border border-white/10',
  pro: 'bg-gold-gradient text-midnight font-semibold',
  free: 'bg-white/5 text-ivory-secondary border border-white/10',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  warn: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

interface Props {
  children: ReactNode
  variant?: Variant
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'subtle', size = 'sm', className = '' }: Props) {
  return (
    <span className={[
      'inline-flex items-center rounded-full font-sans font-medium',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variants[variant],
      className,
    ].join(' ')}>
      {children}
    </span>
  )
}
