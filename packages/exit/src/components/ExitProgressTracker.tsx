import type { ExitStage } from '../types.js'

const PIPELINE: { stage: Exclude<ExitStage, 'idle'>; title: string; hint: string }[] = [
  { stage: 'rootstock_tx', title: 'Rootstock tx', hint: 'Signed on Rootstock' },
  { stage: 'bridge', title: 'Bridge', hint: 'Flyover LP or PowPeg' },
  { stage: 'mempool', title: 'Bitcoin mempool', hint: 'BTC payment seen' },
  { stage: 'confirmed', title: 'Confirmed', hint: 'Final BTC settlement' },
]

export interface ExitProgressTrackerProps {
  stage: ExitStage
  className?: string
}

function stepIndex(stage: ExitStage): number {
  if (stage === 'idle') return -1
  return PIPELINE.findIndex((s) => s.stage === stage)
}

/**
 * Visual pipeline: Rootstock → Bridge → Bitcoin mempool → Confirmed.
 */
export function ExitProgressTracker({ stage, className }: ExitProgressTrackerProps) {
  const active = stepIndex(stage)

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gap: '0.75rem',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.875rem',
      }}
    >
      <div style={{ fontWeight: 600, color: '#0f172a' }}>Exit progress</div>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {PIPELINE.map((step, i) => {
          const done = active > i
          const current = active === i
          return (
            <li
              key={step.stage}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                padding: '0.5rem 0',
                borderBottom: i < PIPELINE.length - 1 ? '1px solid #e2e8f0' : undefined,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '999px',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: done ? '#16a34a' : current ? '#2563eb' : '#e2e8f0',
                  color: done || current ? '#fff' : '#64748b',
                }}
              >
                {done ? '✓' : i + 1}
              </span>
              <div>
                <div style={{ fontWeight: current ? 600 : 500, color: '#0f172a' }}>{step.title}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{step.hint}</div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
