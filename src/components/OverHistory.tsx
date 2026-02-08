import React from 'react'
import { MatchState } from '../state/types'

export function OverHistory({ state }: { state: MatchState }) {
  const inn = state.currentInnings === 1 ? state.innings1 : state.innings2
  const outcomes = inn?.overOutcomes ?? []
  return (
    <div className="card">
      <h3>Over History</h3>
      <div className="over-grid">
        {outcomes.map((over, idx) => (
          <div key={idx} className="over-row">
            <span className="over-label">{idx + 1}</span>
            <div className="balls">
              {over.map((o, i) => (
                <span key={i} className={`ball b-${o}`}>{o}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
