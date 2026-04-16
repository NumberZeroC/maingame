import { api } from '../lib/api'
import {
  HostSDKConfig,
  GameResult,
  GameLifecycleStatus,
  HostMessage,
  HostMessageType,
  SDKMessage,
  GameSDKError,
} from './types'

type MessageHandler = (message: SDKMessage) => Promise<any> | any

export class HostSDK {
  private config: HostSDKConfig
  private iframe: HTMLIFrameElement | null
  private pendingRequests: Map<
    string,
    {
      resolve: (value: any) => void
      reject: (error: Error) => void
      timeout: ReturnType<typeof setTimeout>
    }
  > = new Map()
  private status: GameLifecycleStatus = 'loading'
  private handlers: Map<string, MessageHandler> = new Map()

  constructor(config: HostSDKConfig) {
    this.config = config
    this.iframe = config.iframeRef?.current || null
    this.registerDefaultHandlers()
  }

  private registerDefaultHandlers(): void {
    this.handlers.set('sdk:getUser', this.handleGetUser.bind(this))
    this.handlers.set('sdk:generateText', this.handleGenerateText.bind(this))
    this.handlers.set('sdk:generateImage', this.handleGenerateImage.bind(this))
    this.handlers.set('sdk:storage:save', this.handleStorageSave.bind(this))
    this.handlers.set('sdk:storage:load', this.handleStorageLoad.bind(this))
    this.handlers.set('sdk:storage:clear', this.handleStorageClear.bind(this))
    this.handlers.set('sdk:analytics:track', this.handleAnalyticsTrack.bind(this))
    this.handlers.set('sdk:leaderboard:submitScore', this.handleLeaderboardSubmit.bind(this))
    this.handlers.set('sdk:leaderboard:getRanking', this.handleLeaderboardGet.bind(this))
    this.handlers.set('game:ready', this.handleGameReady.bind(this))
    this.handlers.set('game:finish', this.handleGameFinish.bind(this))
    this.handlers.set('game:error', this.handleGameError.bind(this))
    this.handlers.set('game:paused', this.handleGamePaused.bind(this))
    this.handlers.set('game:resumed', this.handleGameResumed.bind(this))
  }

  handleMessage(event: MessageEvent): void {
    if (!event.data || typeof event.data !== 'object' || !event.data.type) {
      return
    }

    const message = event.data as SDKMessage

    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      this.handleResponse(message)
      return
    }

    const handler = this.handlers.get(message.type)
    if (handler) {
      this.executeHandler(handler, message)
    }
  }

  private handleResponse(message: SDKMessage): void {
    const pending = this.pendingRequests.get(message.requestId!)
    if (!pending) return

    clearTimeout(pending.timeout)
    this.pendingRequests.delete(message.requestId!)

    if (message.type.includes(':response') || message.type === 'sdk:response') {
      pending.resolve(message.payload)
    } else if (message.error) {
      pending.reject(new GameSDKError('REQUEST_FAILED', message.error))
    }
  }

  private async executeHandler(handler: MessageHandler, message: SDKMessage): Promise<void> {
    try {
      const result = await handler(message)
      if (message.requestId) {
        this.sendResponse(message.requestId, result)
      }
    } catch (error) {
      if (message.requestId) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        this.sendError(message.requestId, errorMessage)
      }
    }
  }

  private send(type: HostMessageType, payload?: any): void {
    if (!this.iframe?.contentWindow) {
      console.warn('[HostSDK] iframe not ready')
      return
    }

    const message: HostMessage = { type, payload }
    this.iframe.contentWindow.postMessage(message, '*')
  }

  private sendResponse(requestId: string, payload: any): void {
    if (!this.iframe?.contentWindow) return

    this.iframe.contentWindow.postMessage(
      {
        type: 'sdk:response',
        requestId,
        payload,
      },
      '*'
    )
  }

  private sendError(requestId: string, error: string): void {
    if (!this.iframe?.contentWindow) return

    this.iframe.contentWindow.postMessage(
      {
        type: 'sdk:error',
        requestId,
        error,
      },
      '*'
    )
  }

  setStatus(status: GameLifecycleStatus): void {
    this.status = status
    this.config.onLifecycleChange?.(status)
  }

  getStatus(): GameLifecycleStatus {
    return this.status
  }

  init(): void {
    this.send('platform:init', {
      gameId: this.config.gameId,
      userId: this.config.userId,
    })
    this.setStatus('loading')
  }

  start(): void {
    this.send('platform:start')
    this.setStatus('playing')
  }

  pause(): void {
    this.send('platform:pause')
    this.setStatus('paused')
  }

  resume(): void {
    this.send('platform:resume')
    this.setStatus('playing')
  }

  destroy(): void {
    this.send('platform:destroy')
    this.pendingRequests.forEach(({ timeout }) => clearTimeout(timeout))
    this.pendingRequests.clear()
    this.setStatus('finished')
  }

  private async handleGetUser(): Promise<any> {
    const response = await api.get('/users/me')
    return {
      id: response.data.id,
      phone: response.data.phone,
      nickname: response.data.nickname,
      avatar: response.data.avatar,
      vipLevel: response.data.vipLevel || 0,
      coins: response.data.coins || 0,
    }
  }

  private async handleGenerateText(message: SDKMessage): Promise<any> {
    const response = await api.post('/ai/text/generate', {
      gameId: this.config.gameId,
      prompt: message.payload?.prompt,
      options: message.payload?.options,
    })
    return { result: response.data.result }
  }

  private async handleGenerateImage(message: SDKMessage): Promise<any> {
    const response = await api.post('/ai/image/generate', {
      gameId: this.config.gameId,
      prompt: message.payload?.prompt,
      options: message.payload?.options,
    })
    return { url: response.data.url }
  }

  private async handleStorageSave(message: SDKMessage): Promise<void> {
    await api.post(`/games/${this.config.gameId}/session/save`, {
      key: message.payload?.key,
      value: message.payload?.value,
    })
  }

  private async handleStorageLoad(message: SDKMessage): Promise<any> {
    const response = await api.get(`/games/${this.config.gameId}/session/load`, {
      params: { key: message.payload?.key },
    })
    return { value: response.data?.value ?? null }
  }

  private async handleStorageClear(): Promise<void> {
    await api.delete(`/games/${this.config.gameId}/session/clear`)
  }

  private handleAnalyticsTrack(message: SDKMessage): void {
    api
      .post(`/games/${this.config.gameId}/analytics`, {
        event: message.payload?.event,
        data: message.payload?.data,
      })
      .catch((err) => {
        console.warn('[HostSDK] Analytics track failed:', err)
      })
  }

  private async handleLeaderboardSubmit(message: SDKMessage): Promise<any> {
    const response = await api.post(`/games/${this.config.gameId}/leaderboard/submit`, {
      score: message.payload?.score,
      extraData: message.payload?.extraData,
    })
    return response.data
  }

  private async handleLeaderboardGet(message: SDKMessage): Promise<any> {
    const response = await api.get(`/games/${this.config.gameId}/leaderboard`, {
      params: {
        type: message.payload?.type || 'global',
        limit: message.payload?.limit || 100,
      },
    })
    return response.data
  }

  private handleGameReady(): void {
    this.setStatus('ready')
    this.config.onGameReady?.()
  }

  private handleGameFinish(message: SDKMessage): void {
    this.setStatus('finished')
    const result: GameResult = {
      score: message.payload?.score,
      duration: message.payload?.duration,
      data: message.payload?.data,
      achievements: message.payload?.achievements,
    }
    this.recordGameSession(result)
    this.config.onGameFinish?.(result)
  }

  private handleGameError(message: SDKMessage): void {
    this.setStatus('error')
    this.config.onGameError?.(new GameSDKError('GAME_ERROR', message.error || 'Game error'))
  }

  private handleGamePaused(): void {
    this.setStatus('paused')
  }

  private handleGameResumed(): void {
    this.setStatus('playing')
  }

  private async recordGameSession(result: GameResult): Promise<void> {
    try {
      await api.post(`/games/${this.config.gameId}/session/finish`, result)
    } catch (error) {
      console.error('[HostSDK] Failed to record game session:', error)
    }
  }
}

export function createHostSDK(config: HostSDKConfig): HostSDK {
  return new HostSDK(config)
}
