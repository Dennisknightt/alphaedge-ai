'use client'

import { ShieldCheck, Zap, Eye } from 'lucide-react'
import { cn, fmt } from '@/lib/utils'
import type { PortfolioMetrics, SystemState, TradeSignal } from '@/types'

interface AnswerCardsProps {
  portfolio: PortfolioMetrics
  system: SystemState
  topSignal: TradeSignal | null
  approvedCount: number
}

const TONE = {
  safe:    { surface: 'answer-safe',    text: 'text-emerald-400', icon: 'text-emerald-400' },
  caution: { surface: 'answer-caution', text: 'text-amber-400',   icon: 'text-amber-400' },
  danger:  { surface: 'answer-danger',  text: 'text-red-400',     icon: 'text-red-400' },
}

function Verdict({ icon: Icon, question, verdict, detail, tone, delay }: {
  icon: React.ElementType
  question: string
  verdict: string
  detail: string
  tone: keyof typeof TONE
  delay: string
}) {
  const t = TONE[tone]
  return (
    <div className={cn('rounded-xl p-5 fade-in', t.surface, delay)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={t.icon} />
        <span className="label" style={{ color: 'var(--text-secondary)' }}>{question}</span>
      </div>
      <div className={cn('text-2xl font-extrabold tracking-tight mb-1.5', t.text)}>{verdict}</div>
      <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
    </div>
  )
}

export default function AnswerCards({ portfolio, system, topSignal, approvedCount }: AnswerCardsProps) {
  const isSafe = portfolio.currentDrawdown < 5 && system.status === 'ACTIVE'
  const canTrade = approvedCount > 0 && topSignal !== null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Verdict
        icon={ShieldCheck}
        question="Am I safe?"
        verdict={isSafe ? 'Protected' : 'Caution'}
        detail={`Drawdown ${fmt(portfolio.currentDrawdown, 1)}% of the 10% limit. Health ${portfolio.portfolioHealthScore}/100.`}
        tone={isSafe ? 'safe' : 'danger'}
        delay="stagger-1"
      />
      <Verdict
        icon={Zap}
        question="Should I trade?"
        verdict={canTrade ? `${approvedCount} setup${approvedCount === 1 ? '' : 's'} ready` : 'No trade today'}
        detail={canTrade && topSignal
          ? `Top pick ${topSignal.asset} with ${topSignal.agentConsensus.approvalPct.toFixed(0)}% agent consensus.`
          : 'No setup meets every institutional criterion. Capital is preserved.'}
        tone={canTrade ? 'safe' : 'caution'}
        delay="stagger-2"
      />
      <Verdict
        icon={Eye}
        question="What to watch"
        verdict={portfolio.currentDrawdown > 3 ? 'Drawdown rising' : 'Nothing urgent'}
        detail="Upcoming: CPI Jun 11 · ECB Jun 12 · FOMC Jun 18."
        tone="caution"
        delay="stagger-3"
      />
    </div>
  )
}
