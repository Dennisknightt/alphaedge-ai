import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals)
}

export function fmtPct(n: number, decimals = 1, showSign = true): string {
  const s = `${Math.abs(n).toFixed(decimals)}%`
  if (!showSign) return s
  return n >= 0 ? `+${s}` : `-${s}`
}

export function fmtCurrency(n: number, compact = false): string {
  if (compact) {
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return String(n)
}

export function fmtTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function daysUntil(iso: string): number {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 86400000))
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (d > 30) return `${Math.floor(d / 30)}mo`
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function riskColor(tier: string): string {
  if (tier === 'LOW') return 'text-emerald-400'
  if (tier === 'MEDIUM') return 'text-amber-400'
  if (tier === 'HIGH') return 'text-red-400'
  return 'text-red-600'
}

export function riskBadge(tier: string): string {
  if (tier === 'LOW') return 'badge-green'
  if (tier === 'MEDIUM') return 'badge-yellow'
  return 'badge-red'
}

export function edgeColor(edge: number): string {
  const abs = Math.abs(edge)
  if (abs >= 20) return 'text-emerald-400'
  if (abs >= 10) return 'text-blue-400'
  if (abs >= 5) return 'text-amber-400'
  return 'text-slate-500'
}

export function confidenceColor(c: number): string {
  if (c >= 8.5) return 'text-emerald-400'
  if (c >= 7) return 'text-blue-400'
  if (c >= 5) return 'text-amber-400'
  return 'text-red-400'
}

export function pnlColor(n: number): string {
  if (n > 0) return 'text-emerald-400'
  if (n < 0) return 'text-red-400'
  return 'text-slate-400'
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-blue-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

export function kellyFraction(prob: number, odds: number): number {
  const q = 1 - prob
  const kelly = (prob * odds - q) / odds
  return clamp(kelly * 0.25, 0, 0.05)
}

export function calcSharpe(returns: number[], riskFree = 0.05): number {
  if (returns.length < 2) return 0
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const std = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length)
  return std === 0 ? 0 : (mean * 252 - riskFree) / (std * Math.sqrt(252))
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
