import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export default function Modal({ open, onClose, title, children, maxWidth = 'md' }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={`glass rounded-card w-full ${widths[maxWidth]} shadow-card`}
              role="dialog"
              aria-modal="true"
            >
              {title && (
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
                  <h2 className="font-display text-xl text-ivory">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-ivory-muted hover:text-ivory transition-colors p-1"
                    aria-label="Close"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
