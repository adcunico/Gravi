import { motion } from 'framer-motion'

interface Props {
  size?: number
  showWordmark?: boolean
  showTagline?: boolean
  className?: string
  animated?: boolean
}

export default function GraviLogo({
  size = 72,
  showWordmark = false,
  showTagline = false,
  className = '',
  animated = true,
}: Props) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * 360,
    distance: size * 0.7 + Math.random() * size * 0.2,
    delay: i * 0.1,
    r: 2 + Math.random() * 2,
  }))

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Gold sparkle particles */}
        {animated && particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gold"
            style={{
              width: p.r,
              height: p.r,
              left: '50%',
              top: '50%',
              marginLeft: -p.r / 2,
              marginTop: -p.r / 2,
            }}
            animate={{
              x: Math.cos((p.angle * Math.PI) / 180) * p.distance * 0.5,
              y: Math.sin((p.angle * Math.PI) / 180) * p.distance * 0.5,
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2.5,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-gold/20"
          animate={animated ? { scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 30px rgba(212,168,90,0.15)' }}
        />

        {/* Inner circle */}
        <div
          className="absolute inset-0 rounded-full border border-gold/40 flex items-center justify-center"
          style={{ background: 'radial-gradient(circle, rgba(212,168,90,0.08) 0%, transparent 70%)' }}
        >
          {/* G monogram */}
          <span
            className="text-gold-gradient font-display select-none"
            style={{ fontSize: size * 0.48, lineHeight: 1, fontWeight: 600, fontStyle: 'italic' }}
          >
            G
          </span>
        </div>
      </div>

      {showWordmark && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col items-center gap-1"
        >
          <span
            className="font-display tracking-[0.25em] text-ivory font-medium uppercase"
            style={{ fontSize: size * 0.25 }}
          >
            GRAVI
          </span>
          {showTagline && (
            <span
              className="font-sans text-gold tracking-[0.2em] uppercase"
              style={{ fontSize: size * 0.11 }}
            >
              Speak with Impact
            </span>
          )}
        </motion.div>
      )}
    </div>
  )
}
