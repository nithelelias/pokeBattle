import { useEffect, useState } from 'react'
import { usePlayerState } from './hooks/usePlayerState'
import { SetupScreen } from './components/SetupScreen'
import { LobbyScene } from './components/lobby/LobbyScene'
import { BattleScene } from './components/battle/BattleScene'
import { socket } from './socket'
import { EVENTS } from 'shared'
import type { Match } from 'shared'

function App() {
  const { playerState, updateState } = usePlayerState()
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
      setCurrentMatch(null)
    }

    function onMatchFound(match: Match) {
      setCurrentMatch(match)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on(EVENTS.MATCH_FOUND, onMatchFound)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off(EVENTS.MATCH_FOUND, onMatchFound)
    }
  }, [])

  useEffect(() => {
    if (playerState.isReady && !isConnected && !socket.connected) {
      socket.connect();
    }
  }, [playerState.isReady, isConnected]);

  useEffect(() => {
      if (isConnected && playerState.isReady) {
          socket.emit(EVENTS.JOIN_LOBBY, {
              nickname: playerState.nickname,
              photoBase64: playerState.photoBase64,
              stats: playerState.stats
          });
      }
  }, [isConnected, playerState.isReady]);

  const handleSetupComplete = (updates: any) => {
    updateState(updates);
  };

  const handleMatchEndClose = () => {
    setCurrentMatch(null);
  };

  if (!playerState.isReady) {
    return <SetupScreen playerState={playerState} onComplete={handleSetupComplete} />
  }

  if (currentMatch) {
    return <BattleScene match={currentMatch} onClose={handleMatchEndClose} />
  }

  return <LobbyScene playerState={playerState} />
}

export default App
