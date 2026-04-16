import { useState, useEffect, useCallback, useRef } from 'react'
import { GameSDK, SDKConfig, SDKUser, GameSDKError } from '../sdk/GameSDK'

interface UseGameSDKReturn {
  sdk: GameSDK | null
  isReady: boolean
  error: GameSDKError | null
  user: SDKUser | null
  getUser: () => Promise<SDKUser>
  generateText: (
    prompt: string,
    options?: { maxTokens?: number; temperature?: number }
  ) => Promise<string>
  generateImage: (prompt: string, options?: { size?: string; quality?: string }) => Promise<string>
  saveData: (key: string, value: any) => Promise<void>
  loadData: <T>(key: string) => Promise<T | null>
  clearData: () => Promise<void>
  trackEvent: (event: string, data?: Record<string, any>) => Promise<void>
}

export function useGameSDK(config: SDKConfig): UseGameSDKReturn {
  const [sdk, setSdk] = useState<GameSDK | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<GameSDKError | null>(null)
  const [user, setUser] = useState<SDKUser | null>(null)
  const sdkRef = useRef<GameSDK | null>(null)

  useEffect(() => {
    const gameSDK = new GameSDK(config)
    sdkRef.current = gameSDK
    setSdk(gameSDK)

    gameSDK.onReady(() => {
      setIsReady(true)
      gameSDK
        .getUser()
        .then((userData) => setUser(userData))
        .catch((err) => setError(err))
    })

    return () => {
      gameSDK.destroy()
      sdkRef.current = null
    }
  }, [config.gameId])

  const getUser = useCallback(async (): Promise<SDKUser> => {
    if (!sdk) throw new GameSDKError('SDK_NOT_READY', 'SDK not initialized')
    const userData = await sdk.getUser()
    setUser(userData)
    return userData
  }, [sdk])

  const generateText = useCallback(
    async (
      prompt: string,
      options?: { maxTokens?: number; temperature?: number }
    ): Promise<string> => {
      if (!sdk) throw new GameSDKError('SDK_NOT_READY', 'SDK not initialized')
      return sdk.ai.generateText(prompt, options)
    },
    [sdk]
  )

  const generateImage = useCallback(
    async (prompt: string, options?: { size?: string; quality?: string }): Promise<string> => {
      if (!sdk) throw new GameSDKError('SDK_NOT_READY', 'SDK not initialized')
      return sdk.ai.generateImage(prompt, options)
    },
    [sdk]
  )

  const saveData = useCallback(
    async (key: string, value: any): Promise<void> => {
      if (!sdk) throw new GameSDKError('SDK_NOT_READY', 'SDK not initialized')
      return sdk.storage.save(key, value)
    },
    [sdk]
  )

  function loadData<T>(key: string): Promise<T | null> {
    if (!sdk) throw new GameSDKError('SDK_NOT_READY', 'SDK not initialized')
    return sdk.storage.load<T>(key)
  }

  const clearData = useCallback(async (): Promise<void> => {
    if (!sdk) throw new GameSDKError('SDK_NOT_READY', 'SDK not initialized')
    return sdk.storage.clear()
  }, [sdk])

  const trackEvent = useCallback(
    async (event: string, data?: Record<string, any>): Promise<void> => {
      if (!sdk) throw new GameSDKError('SDK_NOT_READY', 'SDK not initialized')
      return sdk.analytics.track(event, data)
    },
    [sdk]
  )

  return {
    sdk,
    isReady,
    error,
    user,
    getUser,
    generateText,
    generateImage,
    saveData,
    loadData,
    clearData,
    trackEvent,
  }
}

export default useGameSDK
