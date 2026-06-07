'use client'

interface GaugeProps {
  value: number      // 0-100
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: string
  showTick?: boolean
}

function getColor(value: number, custom?: string): string {
  if (custom) return custom
  if (value >= 75) return '#10b981'
  if (value >= 50) return '#3b82f6'
  if (value >= 25) return '#f59e0b'
  return '#ef4444'
}

export default function Gauge({ value, size = 100, strokeWidth = 8, label, sublabel, color, showTick }: GaugeProps) {
  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  // 270-degree arc (from 135° to 405°)
  const startAngle = -225
  const totalAngle = 270
  const angle = startAngle + (value / 100) * totalAngle
  const circumference = 2 * Math.PI * r
  const arcLength = (totalAngle / 360) * circumference
  const fillLength = (value / 100) * arcLength

  // Convert angle to radians for arc calculation
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const startRad = toRad(startAngle)
  const endRad = toRad(startAngle + totalAngle)

  const trackStart = {
    x: cx + r * Math.cos(startRad),
    y: cy + r * Math.sin(startRad),
  }
  const trackEnd = {
    x: cx + r * Math.cos(endRad),
    y: cy + r * Math.sin(endRad),
  }

  const fillEnd = {
    x: cx + r * Math.cos(toRad(angle)),
    y: cy + r * Math.sin(toRad(angle)),
  }

  const trackPath = `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`
  const fillPath  = value > 0
    ? `M ${trackStart.x} ${trackStart.y} A ${r} ${r} 0 ${(value / 100) * 270 > 180 ? 1 : 0} 1 ${fillEnd.x} ${fillEnd.y}`
    : ''

  const resolvedColor = getColor(value, color)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          <path d={trackPath} fill="none"
            stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} strokeLinecap="round" />
          {fillPath && (
            <path d={fillPath} fill="none"
              stroke={resolvedColor} strokeWidth={strokeWidth} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${resolvedColor}60)`, transition: 'all 1s cubic-bezier(0.4,0,0.2,1)' }} />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular" style={{ color: resolvedColor }}>{value}</span>
          {sublabel && <span className="text-[9px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-dim)' }}>{sublabel}</span>}
        </div>
      </div>
      {label && <div className="text-[10px] font-semibold mt-1 text-center" style={{ color: 'var(--text-muted)' }}>{label}</div>}
    </div>
  )
}
