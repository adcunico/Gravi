import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  rows?: number
}

export function Input({ label, error, hint, icon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-sans text-ivory-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory-muted">
            {icon}
          </span>
        )}
        <input
          className={[
            'input-gold',
            icon ? 'pl-10' : '',
            error ? 'border-red-500/50 focus:border-red-400' : '',
            className,
          ].join(' ')}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-ivory-muted">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, rows = 5, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-sans text-ivory-secondary">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={[
          'input-gold resize-none',
          error ? 'border-red-500/50' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-ivory-muted">{hint}</p>}
    </div>
  )
}
