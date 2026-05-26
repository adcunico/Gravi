import { useEffect, useRef, useState } from 'react'

interface Props {
  label: string
  score: number
  note?: string
  animate?: boolean
  delay?: number
}

export default function ScoreBar({ label, score, note, animate = true, delay = 0 }: Props) {
  const [width, setWidth] = useState(animate ? 0 : score)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!animate || hasAnimated.current) return
    hasAnimated.current = true
    const timer = setTimeout(() => setWidth(score), delay * 1000)
    return () => clearTimeout(timer)
  }, [score, animate, delay])

  const color =
    score >= 80 ? 'text-gold' : score >= 60 ? 'text-gold-light' : 'text-ivory-secondary'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-sans text-ivory-secondary">{label}</span>
        <span className={`text-sm font-semibold font-sans ${color}`}>{score}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #D4A85A, #F2D28B)',
            transition: animate ? `width 1s cubic-bezier(0.4,0,0.2,1) ${delay}s` : 'none',
          }}
        />
      </div>
      {note && <p className="text-xs text-ivory-muted leading-relaxed">{note}</p>}
    </div>
  )
}
