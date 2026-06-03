import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'gold' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  gold: 'bg-gold-gradient text-midnight font-semibold hover:opacity-90 shadow-gold',
  ghost: 'bg-transparent border border-gold/40 text-gold hover:border-gold/70 hover:bg-gold/5',
  danger: 'bg-transparent border border-red-500/40 text-red-400 hover:border-red-400 hover:bg-red-500/10',
  subtle: 'bg-midnight-graphite/60 text-ivory hover:bg-midnight-elevated border border-white/5',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-6 py-3 text-sm rounded-btn gap-2',
  lg: 'px-8 py-4 text-base rounded-btn gap-2',
}

export default function Button({
  variant = 'gold',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: Props) {
  const hoverAnimation =
    variant === 'gold'
      ? { boxShadow: '0 0 28px rgba(212,168,90,0.35)' }
      : variant === 'ghost'
      ? { backgroundColor: 'rgba(212,168,90,0.06)', borderColor: 'rgba(212,168,90,0.7)' }
      : { opacity: 0.85 }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={hoverAnimation}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-sans transition-all duration-300',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
      {!loading && iconRight}
    </motion.button>
  )
}
