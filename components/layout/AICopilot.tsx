'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Bot, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/context'

interface Message { role: 'user' | 'assistant'; content: string }

const CANNED = [
  { q: 'Why was this trade rejected?',  a: 'The last signal was rejected because agent consensus reached only 71% — below the 80% threshold. The Quant Agent voted REJECT due to insufficient R:R ratio of 1.8:1 (minimum 2:1 required), and the Risk Agent flagged excessive sector concentration.' },
  { q: 'Why is confidence low?',        a: 'Confidence is lower than usual today because information quality on the top prediction market is 6.2/10 — resolution criteria has some ambiguity around timing. Additionally, only 4 supporting evidence signals were found versus the typical 8+.' },
  { q: "What's the best opportunity?",  a: 'The highest-conviction opportunity right now is the Fed Rate Cut Q3 market on Polymarket. AI probability: 59%, market probability: 41%, giving an 18 percentage point edge. Confidence: 8.6/10. All 7 agents approved. Recommended position: YES at 0.41.' },
  { q: 'Am I safe right now?',          a: 'Yes — your capital is well-protected. Portfolio health score is 91/100. Current drawdown is 0.4% versus the 10% monthly limit. Risk utilization is 6.8% of maximum. All kill switch conditions are clear. No action required.' },
  { q: 'What changed today?',           a: "Three things changed since yesterday: (1) Fed Rate Cut market probability dropped from 0.44 to 0.41 — increasing our edge to 18%. (2) BTC funding rate elevated above 0.02% — crypto signals deprioritized. (3) Starship Orbital market saw +$180K new liquidity, improving signal quality." },
]

const SUGGESTIONS = ['Why was this trade rejected?', "What's the best opportunity?", 'Am I safe right now?', 'What changed today?']

export default function AICopilot() {
  const { copilotOpen, setCopilotOpen } = useApp()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello. I'm your AlphaEdge AI Copilot. I can explain opportunities, analyze risk, summarize research, or answer any question about your portfolio and the markets. How can I help?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)

    await new Promise(r => setTimeout(r, 800 + Math.random() * 400))

    const canned = CANNED.find(c => c.q.toLowerCase().includes(userMsg.toLowerCase().slice(0, 15)) ||
      userMsg.toLowerCase().includes(c.q.toLowerCase().slice(0, 15)))

    const reply = canned?.a ??
      `Based on current platform data: I've analyzed your query about "${userMsg}". The platform currently shows 2 approved signals with an average edge of 17.5% and system confidence at 8.4/10. Capital protection engine is active with all limits clear. Would you like me to elaborate on any specific aspect?`

    setMessages(m => [...m, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  if (!copilotOpen) {
    return (
      <button
        onClick={() => setCopilotOpen(true)}
        className="copilot-bubble w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>
        <Sparkles size={20} className="text-white" />
      </button>
    )
  }

  return (
    <>
      {/* Floating button (always visible when panel open) */}
      <button
        onClick={() => setCopilotOpen(false)}
        className="copilot-bubble w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>
        <X size={18} className="text-white" />
      </button>

      {/* Panel */}
      <div className="copilot-panel card-glass flex flex-col overflow-hidden scale-in">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">AI Copilot</div>
            <div className="text-[10px]" style={{ color: 'var(--emerald)' }}>● Online</div>
          </div>
          <button onClick={() => setCopilotOpen(false)}
            className="ml-auto p-1 rounded hover:bg-white/5 transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <X size={13} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: 320 }}>
          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}>
              {msg.role === 'assistant' && (
                <div className="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                  <Bot size={10} className="text-white" />
                </div>
              )}
              <div className={cn('max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed',
                msg.role === 'assistant'
                  ? 'text-white/90'
                  : 'text-white ml-auto')}
                style={{
                  background: msg.role === 'assistant'
                    ? 'rgba(255,255,255,0.06)'
                    : 'var(--accent-soft)',
                  border: '1px solid var(--border)',
                }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                <Bot size={10} className="text-white" />
              </div>
              <div className="px-3 py-2 rounded-xl flex items-center gap-1"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}>
                <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent)' }} />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Analyzing…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="text-[10px] px-2 py-1 rounded-md transition-all hover:bg-white/8"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 pt-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
            <input
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none"
              placeholder="Ask anything about your portfolio…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
            />
            <button onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="p-1 rounded-lg transition-all disabled:opacity-40"
              style={{ background: 'var(--accent)' }}>
              <Send size={11} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
