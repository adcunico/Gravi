import { motion } from 'framer-motion'
import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  gold?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  as?: 'div' | 'article' | 'section'
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }

export default function GlassCard({
  children,
  hover = false,
  gold = false,
  padding = 'md',
  as: Tag = 'div',
  className = '',
  ...props
}: Props) {
  const base = [
    'glass rounded-card',
    paddings[padding],
    gold ? 'border-gold/30' : '',
    className,
  ].join(' ')

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 20px rgba(212,168,90,0.1)' }}
        transition={{ duration: 0.25 }}
        className={`${base} cursor-pointer`}
        onClick={(props as React.HTMLAttributes<HTMLDivElement>).onClick}
        style={(props as React.HTMLAttributes<HTMLDivElement>).style}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <Tag className={base} {...props}>
      {children}
    </Tag>
  )
}
