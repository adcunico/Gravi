import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SCORE_LABEL } from '@/types'

interface Props {
  score: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  animate?: boolean
  className?: string
}

export default function ScoreGauge({
  score,
  size = 140,
  strokeWidth = 8,
  showLabel = true,
  animate = true,
  className = '',
}: Props) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score)
  const [dashOffset, setDashOffset] = useState(0)
  const [showPulse, setShowPulse] = useState(false)
  const hasAnimated = useRef(false)

  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  // Arc covers 270 degrees (from 135° to 405°)
  const arcLength = circumference * 0.75

  useEffect(() => {
    if (!animate || hasAnimated.current) return
    hasAnimated.current = true

    // Animate number
    const duration = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayed(Math.round(eased * score))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    setTimeout(() => {
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 500)
    }, 1200)
  }, [score, animate])

  useEffect(() => {
    const fill = (displayed / 100) * arcLength
    setDashOffset(arcLength - fill)
  }, [displayed, arcLength])

  const center = size / 2
  const startAngle = 135
  const startRad = (startAngle * Math.PI) / 180
  const sx = center + r * Math.cos(startRad)
  const sy = center + r * Math.sin(startRad)

  const label = SCORE_LABEL(score)

  const scoreColor =
    score >= 80 ? '#D4A85A' : score >= 60 ? '#F2D28B' : '#9E9A92'

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} style={{ transform: 'rotate(0deg)' }}>
        {/* Glow pulse */}
        {showPulse && (
          <circle
            cx={center} cy={center} r={r + 3}
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth={3}
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(${startAngle}, ${center}, ${center})`}
            style={{ transformOrigin: `${center}px ${center}px`, opacity: 0.35, transition: 'opacity 500ms ease-out' }}
          />
        )}
        {/* Track */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="rgba(212,168,90,0.1)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${startAngle}, ${center}, ${center})`}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />
        {/* Fill */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(${startAngle}, ${center}, ${center})`}
          style={{
            transformOrigin: `${center}px ${center}px`,
            transition: animate ? 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none',
          }}
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A85A" />
            <stop offset="100%" stopColor="#F2D28B" />
          </linearGradient>
        </defs>
        {/* Score number */}
        <text
          x={center} y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={scoreColor}
          fontSize={size * 0.26}
          fontFamily="'Cormorant Garamond', serif"
          fontWeight="600"
        >
          {displayed}
        </text>
      </svg>
      {showLabel && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="font-display text-2xl text-ivory mt-2"
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}
