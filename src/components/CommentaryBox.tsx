import React, { useEffect, useRef } from 'react'
import { MatchState } from '../state/types'

export function CommentaryBox({ state }: { state: MatchState }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [state.commentary.length])
  return (
    <div className="card">
      <h3>Commentary</h3>
      <div ref={ref} className="commentary">
        {state.commentary.map((c, i) => (
          <div key={i} className="line">{c}</div>
        ))}
      </div>
    </div>
  )
}
