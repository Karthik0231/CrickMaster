import React, { useEffect, useReducer, useState, useMemo } from 'react'
import { Team, AuctionPlayer, Role } from '../state/types'
import { auctionReducer, initialAuctionState, getNextBid } from '../state/auctionReducer'

interface Props {
  teams: Team[]
  pool: AuctionPlayer[]
  userTeamId: string
  onFinish: (updatedTeams: Team[]) => void
}

export function AuctionView({ teams, pool, userTeamId, onFinish }: Props) {
  const [state, dispatch] = useReducer(auctionReducer, initialAuctionState)
  const [timer, setTimer] = useState(3) // 3-second "heartbeat" for hammer logic

  // Initialize
  useEffect(() => {
    if (!state.isActive && !state.completed) {
      dispatch({ type: 'START_AUCTION', teams, pool })
    }
  }, [])

  // AI Evaluation Logic
  const getAIValuation = (team: Team, player: AuctionPlayer) => {
    const cr = 10000000
    // Specialist Aware: Use Peak Rating instead of average
    const peakRating = Math.max(player.battingRating, player.bowlingRating)

    // Skill Factor based on peak rating
    let skillFactor = 2.0
    if (peakRating > 90) skillFactor = 12.0
    else if (peakRating > 80) skillFactor = 8.0
    else if (peakRating > 75) skillFactor = 5.0
    else if (peakRating > 70) skillFactor = 3.0

    let valuation = player.basePrice * skillFactor

    // Team Need Multiplier
    const playersOfSameRole = team.players.filter(p => p.role === player.role).length
    let needMult = 1.0
    if (player.role === 'WK' && playersOfSameRole === 0) needMult = 2.5
    else if (player.role === 'BOWL' && playersOfSameRole < 5) needMult = 1.8
    else if (player.role === 'BAT' && playersOfSameRole < 5) needMult = 1.8
    else if (playersOfSameRole < 3) needMult = 1.5
    else if (playersOfSameRole > 6) needMult = 0.5

    // Overseas limit check
    const overseasCount = team.players.filter(p => p.id.includes('_int') || (p as any).isOverseas).length
    if (player.isOverseas && overseasCount >= 8) return 0

    // Human rivalry bonus (10%)
    if (state.currentBidderId === userTeamId) needMult *= 1.1

    // Budget conservation
    const budgetPct = (team.budget || 0) / 800000000
    if (budgetPct < 0.2) needMult *= 0.6

    return valuation * needMult
  }

  // Effect: Hammer Logic & No-Bid Progression
  useEffect(() => {
    if (!state.isActive || state.completed || state.status === 'Sold' || state.status === 'Unsold' || state.status === 'Waiting') return

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleHeartbeat()
          return 3
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.status, state.currentBid, state.activeBidderIds])

  const handleHeartbeat = () => {
    // If only one team left and they are the lead bidder -> Hammer logic
    const activeBidders = state.activeBidderIds

    if (state.currentBidderId) {
      if (activeBidders.length === 1 && activeBidders[0] === state.currentBidderId) {
        if (state.noBidCounter >= 2) {
          dispatch({ type: 'FINALIZE_SALE' })
        } else {
          dispatch({ type: 'INCREMENT_HAMMER' })
        }
      } else if (activeBidders.length === 0) {
        // Should not happen, but safety
        dispatch({ type: 'FINALIZE_SALE' })
      } else {
        // Multi-team active: AI Bidding round
        performAIRound()
      }
    } else {
      // No bids yet
      if (activeBidders.length > 0) {
        performAIRound()
      } else {
        dispatch({ type: 'MARK_UNSOLD' })
      }
    }
  }

  const performAIRound = () => {
    const nextBid = state.currentBidderId ? getNextBid(state.currentBid) : state.currentBid
    const currentPlayer = (state.isUnsoldRound ? state.unsoldPool : state.pool)[state.currentPlayerIndex]

    // AI teams check if they want to bid or pass
    state.activeBidderIds.forEach(teamId => {
      if (teamId === userTeamId) return

      const team = state.teams.find(t => t.id === teamId)!
      const maxVal = getAIValuation(team, currentPlayer)

      if (nextBid > maxVal || (team.budget || 0) < nextBid || team.players.length >= 25) {
        dispatch({ type: 'TEAM_PASS', teamId })
      } else {
        // Simple random chance for AI to bid this round if valuation allows
        if (Math.random() > 0.4) {
          dispatch({ type: 'PLACE_BID', teamId, amount: nextBid })
          setTimer(3)
        }
      }
    })
  }

  const handleUserBid = () => {
    const nextBid = state.currentBidderId ? getNextBid(state.currentBid) : state.currentBid
    const userTeam = state.teams.find(t => t.id === userTeamId)!

    if ((userTeam.budget || 0) < nextBid) {
      alert("Insufficient Budget!")
      return
    }
    if (userTeam.players.length >= 25) {
      alert("Squad size limit reached!")
      return
    }

    dispatch({ type: 'PLACE_BID', teamId: userTeamId, amount: nextBid })
    setTimer(3)
  }

  const handleUserPass = () => {
    // Fast simulation: Resolve bidding between AI teams instantly
    const currentPlayer = (state.isUnsoldRound ? state.unsoldPool : state.pool)[state.currentPlayerIndex]
    const aiTeamsIn = state.activeBidderIds
      .filter(id => id !== userTeamId)
      .map(id => ({
        id,
        team: state.teams.find(t => t.id === id)!,
      }))
      .map(t => ({
        ...t,
        valuation: getAIValuation(t.team, currentPlayer)
      }))
      .filter(t => t.valuation >= state.currentBid && t.team.budget! >= state.currentBid && t.team.players.length < 25)
      .sort((a, b) => b.valuation - a.valuation)

    if (aiTeamsIn.length === 0) {
      // No AI wants him or can afford him
      if (state.currentBidderId && state.currentBidderId !== userTeamId) {
        // AI already leading wins
        dispatch({ type: 'FINALIZE_SALE' })
      } else {
        // Nobody wins
        dispatch({ type: 'MARK_UNSOLD' })
      }
    } else {
      // Bidding war between AI
      const winner = aiTeamsIn[0]
      let finalPrice = state.currentBid

      if (aiTeamsIn.length > 1) {
        // Price goes up to slightly above the second highest bidder's max valuation
        const runnerUp = aiTeamsIn[1]
        finalPrice = getNextBid(runnerUp.valuation)
        // Ensure price doesn't exceed winner's valuation or budget
        finalPrice = Math.min(finalPrice, winner.valuation, winner.team.budget!)
      } else {
        // Only one AI interested, they take it at current bid or base price
        finalPrice = Math.max(state.currentBid, state.isUnsoldRound ? Math.floor(currentPlayer.basePrice * 0.8) : currentPlayer.basePrice)
      }

      // 1. Mark user as passed (for log/internal state)
      dispatch({ type: 'TEAM_PASS', teamId: userTeamId })

      // 2. Instant sale (with updated values)
      dispatch({ type: 'PLACE_BID', teamId: winner.id, amount: finalPrice })
      setTimeout(() => {
        dispatch({ type: 'FINALIZE_SALE' })
      }, 100)
    }
  }

  const handleNextPlayer = () => {
    dispatch({ type: 'NEXT_PLAYER' })
    setTimer(3)
  }

  const handleStartUnsold = () => {
    dispatch({ type: 'START_UNSOLD_ROUND' })
    setTimer(3)
  }

  if (state.completed) {
    return (
      <div className="auction-view card">
        <h1>Auction Completed</h1>
        <div className="squad-summary-grid">
          {state.teams.map(team => (
            <div key={team.id} className="team-squad-card card">
              <h4>{team.name}</h4>
              <div className="team-stats-mini">
                <span>{team.players.length} Players</span>
                <span>₹{((team.budget || 0) / 10000000).toFixed(2)} Cr</span>
              </div>
              <div className="squad-list-mini">
                {team.players.sort((a, b) => b.battingRating - a.battingRating).map(p => (
                  <div key={p.id} className="squad-item-mini">
                    <span className="name">{p.name}</span>
                    <span className="role">{p.role}</span>
                    <span className="rating">{Math.max(p.battingRating, p.bowlingRating)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="auction-summary-actions">
          <button className="primary-btn" onClick={() => onFinish(state.teams)}>START IPL TOURNAMENT</button>
        </div>
      </div>
    )
  }

  if (state.currentPlayerIndex === -1) return <div className="card">Initializing...</div>

  const currentPlayer = (state.isUnsoldRound ? state.unsoldPool : state.pool)[state.currentPlayerIndex]
  const userTeam = state.teams.find(t => t.id === userTeamId)

  // CRITICAL FIX: Guard against undefined userTeam to prevent crash
  if (!userTeam) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Loading Team Data...</h3>
        <p>Please wait while we fetch your franchise details.</p>
      </div>
    )
  }

  const isUserPassed = !state.activeBidderIds.includes(userTeamId)
  const nextBidAmount = state.currentBidderId ? getNextBid(state.currentBid) : state.currentBid

  return (
    <div className="auction-view">
      <div className="auction-header card">
        <div className="header-top">
          <h2>{state.isUnsoldRound ? 'UNSOLD ROUND' : 'IPL MEGA AUCTION'}</h2>
          <div className={`hammer-status ${state.status}`}>{state.status.toUpperCase()}</div>
        </div>
        <div className="auction-progress">
          Player {state.currentPlayerIndex + 1} of {(state.isUnsoldRound ? state.unsoldPool : state.pool).length}
        </div>
      </div>

      <div className="auction-main-grid">
        <div className="player-bidding-area card">
          <div className="player-spotlight">
            <div className="player-details">
              <h3>{currentPlayer.name}</h3>
              <p className="role">{currentPlayer.role} | {currentPlayer.country}</p>
              <div className="ratings">
                <span>BAT: {currentPlayer.battingRating}</span>
                <span>BOWL: {currentPlayer.bowlingRating}</span>
              </div>
            </div>
            <div className="bid-board">
              <div className="base-price">Base: ₹{(currentPlayer.basePrice / 10000000).toFixed(2)} Cr</div>
              <div className="current-bid">₹{(state.currentBid / 10000000).toFixed(2)} Cr</div>
              <div className="bidder-name">{state.teams.find(t => t.id === state.currentBidderId)?.name || 'NO BIDS'}</div>
            </div>
          </div>

          <div className="bidding-controls">
            {state.status === 'Sold' || state.status === 'Unsold' ? (
              <button className="primary" onClick={handleNextPlayer}>Next Player</button>
            ) : state.status === 'Waiting' ? (
              <button className="primary" onClick={handleStartUnsold}>Start Unsold Round</button>
            ) : (
              <>
                <button
                  className="bid-btn"
                  onClick={handleUserBid}
                  disabled={isUserPassed || state.currentBidderId === userTeamId || userTeam.budget! < nextBidAmount}
                >
                  BID ₹{(nextBidAmount / 10000000).toFixed(2)} Cr
                </button>
                <button
                  className="pass-btn"
                  onClick={handleUserPass}
                  disabled={isUserPassed || state.currentBidderId === userTeamId}
                >
                  PASS
                </button>
              </>
            )}
          </div>

          <div className="active-teams">
            <h4>Active Bidders ({state.activeBidderIds.length})</h4>
            <div className="active-pills">
              {state.activeBidderIds.map(id => (
                <span key={id} className={`pill ${id === state.currentBidderId ? 'leading' : ''}`}>
                  {state.teams.find(t => t.id === id)?.short}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="auction-sidebar card">
          <h3>My Squad ({userTeam.name})</h3>
          <div className="user-stats">
            <div className="pursue">₹{(userTeam.budget! / 10000000).toFixed(2)} Cr</div>
            <div className="players-count">{userTeam.players.length}/25 Players</div>
          </div>
          <div className="role-balance">
            <div className={`bal-item ${userTeam.players.filter(p => p.role === 'BAT').length < 5 ? 'need' : ''}`}>BAT: {userTeam.players.filter(p => p.role === 'BAT').length}</div>
            <div className={`bal-item ${userTeam.players.filter(p => p.role === 'BOWL').length < 5 ? 'need' : ''}`}>BOWL: {userTeam.players.filter(p => p.role === 'BOWL').length}</div>
            <div className={`bal-item ${userTeam.players.filter(p => p.role === 'ALL').length < 2 ? 'need' : ''}`}>AR: {userTeam.players.filter(p => p.role === 'ALL').length}</div>
            <div className={`bal-item ${userTeam.players.filter(p => p.role === 'WK').length < 1 ? 'need' : ''}`}>WK: {userTeam.players.filter(p => p.role === 'WK').length}</div>
          </div>

          <div className="auction-log-mini">
            <h4>Recent Activity</h4>
            <ul>
              {state.log.slice(0, 10).map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
