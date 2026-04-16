import { useEffect, useRef, useCallback } from 'react'
import { SDKMessage, SDKUser } from '../sdk/types'
import { useUserStore } from '../stores/userStore'
import { aiService } from '../services/aiService'

interface GameContainerProps {
  gameUrl: string
  gameId: string
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

interface GameStorage {
  [gameId: string]: {
    [key: string]: any
  }
}

const STORAGE_KEY = 'game-storage'

function getGameStorage(): GameStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveGameStorage(storage: GameStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

export function GameContainer({ gameUrl, gameId, className, onLoad, onError }: GameContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { user } = useUserStore()

  const sendMessage = useCallback((message: SDKMessage) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*')
    }
  }, [])

  const handleGetUser = useCallback(
    (requestId: string) => {
      if (!user) {
        sendMessage({
          type: 'sdk:error',
          requestId,
          error: 'User not authenticated',
        })
        return
      }

      const sdkUser: SDKUser = {
        id: user.id,
        phone: user.phone,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        vipLevel: user.vipLevel,
        coins: user.coins,
      }

      sendMessage({
        type: 'sdk:getUser:response',
        requestId,
        payload: sdkUser,
      })
    },
    [user, sendMessage]
  )

  const handleGenerateText = useCallback(
    async (requestId: string, payload: any) => {
      try {
        const response = await aiService.generateText({
          prompt: payload.prompt,
          options: payload.options,
        })
        sendMessage({
          type: 'sdk:generateText:response',
          requestId,
          payload: { result: response.result },
        })
      } catch (error) {
        sendMessage({
          type: 'sdk:error',
          requestId,
          error: 'Failed to generate text',
          payload: error,
        })
      }
    },
    [sendMessage]
  )

  const handleGenerateImage = useCallback(
    async (requestId: string, payload: any) => {
      try {
        const response = await aiService.generateImage({
          prompt: payload.prompt,
          options: payload.options,
        })
        sendMessage({
          type: 'sdk:generateImage:response',
          requestId,
          payload: { url: response.url },
        })
      } catch (error) {
        sendMessage({
          type: 'sdk:error',
          requestId,
          error: 'Failed to generate image',
          payload: error,
        })
      }
    },
    [sendMessage]
  )

  const handleStorageSave = useCallback(
    (requestId: string, payload: { key: string; value: any }) => {
      try {
        const storage = getGameStorage()
        if (!storage[gameId]) {
          storage[gameId] = {}
        }
        storage[gameId][payload.key] = payload.value
        saveGameStorage(storage)
        sendMessage({
          type: 'sdk:storage:save:response',
          requestId,
          payload: { success: true },
        })
      } catch {
        sendMessage({
          type: 'sdk:error',
          requestId,
          error: 'Failed to save data',
        })
      }
    },
    [gameId, sendMessage]
  )

  const handleStorageLoad = useCallback(
    (requestId: string, payload: { key: string }) => {
      try {
        const storage = getGameStorage()
        const value = storage[gameId]?.[payload.key] ?? null
        sendMessage({
          type: 'sdk:storage:load:response',
          requestId,
          payload: { value },
        })
      } catch {
        sendMessage({
          type: 'sdk:error',
          requestId,
          error: 'Failed to load data',
        })
      }
    },
    [gameId, sendMessage]
  )

  const handleStorageClear = useCallback(
    (requestId: string) => {
      try {
        const storage = getGameStorage()
        delete storage[gameId]
        saveGameStorage(storage)
        sendMessage({
          type: 'sdk:storage:clear:response',
          requestId,
          payload: { success: true },
        })
      } catch {
        sendMessage({
          type: 'sdk:error',
          requestId,
          error: 'Failed to clear storage',
        })
      }
    },
    [gameId, sendMessage]
  )

  const handleAnalyticsTrack = useCallback(
    (requestId: string, payload: { event: string; data?: any }) => {
      console.log(`[GameSDK Analytics] Event: ${payload.event}`, payload.data)
      sendMessage({
        type: 'sdk:analytics:track:response',
        requestId,
        payload: { success: true },
      })
    },
    [sendMessage]
  )

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const message = event.data as SDKMessage
      if (!message || !message.type || !message.type.startsWith('sdk:')) {
        return
      }

      if (message.type.includes(':response')) {
        return
      }

      const { type, requestId, payload } = message

      switch (type) {
        case 'sdk:getUser':
          handleGetUser(requestId!)
          break
        case 'sdk:generateText':
          handleGenerateText(requestId!, payload)
          break
        case 'sdk:generateImage':
          handleGenerateImage(requestId!, payload)
          break
        case 'sdk:storage:save':
          handleStorageSave(requestId!, payload)
          break
        case 'sdk:storage:load':
          handleStorageLoad(requestId!, payload)
          break
        case 'sdk:storage:clear':
          handleStorageClear(requestId!)
          break
        case 'sdk:analytics:track':
          handleAnalyticsTrack(requestId!, payload)
          break
      }
    },
    [
      handleGetUser,
      handleGenerateText,
      handleGenerateImage,
      handleStorageSave,
      handleStorageLoad,
      handleStorageClear,
      handleAnalyticsTrack,
    ]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [handleMessage])

  const handleIframeLoad = useCallback(() => {
    sendMessage({ type: 'sdk:ready' })
    onLoad?.()
  }, [sendMessage, onLoad])

  const handleIframeError = useCallback(() => {
    onError?.(new Error('Failed to load game'))
  }, [onError])

  return (
    <iframe
      ref={iframeRef}
      src={gameUrl}
      className={className}
      onLoad={handleIframeLoad}
      onError={handleIframeError}
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      title={`Game: ${gameId}`}
    />
  )
}

export default GameContainer
