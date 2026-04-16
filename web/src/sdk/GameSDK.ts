import {
  SDKUser,
  SDKConfig,
  SDKMessage,
  GenerateTextOptions,
  GenerateImageOptions,
  GameSDKError,
} from './types'

const DEFAULT_TIMEOUT = 30000

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export class GameSDK {
  private config: SDKConfig
  private pendingRequests: Map<
    string,
    {
      resolve: (value: any) => void
      reject: (error: GameSDKError) => void
      timeout: ReturnType<typeof setTimeout>
    }
  > = new Map()
  private isReady: boolean = false
  private readyCallbacks: (() => void)[] = []

  ai = {
    generateText: (prompt: string, options?: GenerateTextOptions) =>
      this.generateText(prompt, options),
    generateImage: (prompt: string, options?: GenerateImageOptions) =>
      this.generateImage(prompt, options),
  }

  storage = {
    save: (key: string, value: any) => this.storageSave(key, value),
    load: <T>(key: string) => this.storageLoad<T>(key),
    clear: () => this.storageClear(),
  }

  analytics = {
    track: (event: string, data?: Record<string, any>) => this.trackEvent(event, data),
  }

  leaderboard = {
    submitScore: (score: number, extraData?: Record<string, any>) =>
      this.submitScore(score, extraData),
    getRanking: (type?: 'global' | 'friends', limit?: number) => this.getRanking(type, limit),
  }

  constructor(config: SDKConfig) {
    this.config = {
      origin: window.location.origin,
      timeout: DEFAULT_TIMEOUT,
      ...config,
    }
    this.setupMessageListener()
  }

  private setupMessageListener(): void {
    window.addEventListener('message', this.handleMessage.bind(this))
  }

  private handleMessage(event: MessageEvent): void {
    if (event.data && typeof event.data === 'object' && event.data.type) {
      const message = event.data as SDKMessage

      if (message.type === 'sdk:ready') {
        this.isReady = true
        this.readyCallbacks.forEach((cb) => cb())
        this.readyCallbacks = []
        return
      }

      if (message.requestId && this.pendingRequests.has(message.requestId)) {
        const pending = this.pendingRequests.get(message.requestId)!
        clearTimeout(pending.timeout)
        this.pendingRequests.delete(message.requestId)

        if (message.type.includes(':response')) {
          pending.resolve(message.payload)
        } else if (message.type === 'sdk:error' || message.error) {
          pending.reject(
            new GameSDKError('REQUEST_FAILED', message.error || 'Request failed', message.payload)
          )
        }
      }
    }
  }

  private sendMessage<T>(type: SDKMessage['type'], payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = generateRequestId()
      const message: SDKMessage = {
        type,
        requestId,
        payload,
      }

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId)
        reject(new GameSDKError('TIMEOUT', `Request timed out: ${type}`))
      }, this.config.timeout)

      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout,
      })

      window.parent.postMessage(message, this.config.origin || '*')
    })
  }

  onReady(callback: () => void): void {
    if (this.isReady) {
      callback()
    } else {
      this.readyCallbacks.push(callback)
    }
  }

  async getUser(): Promise<SDKUser> {
    try {
      return await this.sendMessage<SDKUser>('sdk:getUser')
    } catch (error) {
      throw new GameSDKError('GET_USER_FAILED', 'Failed to get user info', error)
    }
  }

  private async generateText(prompt: string, options?: GenerateTextOptions): Promise<string> {
    try {
      const response = await this.sendMessage<{ result: string }>('sdk:generateText', {
        prompt,
        options,
      })
      return response.result
    } catch (error) {
      throw new GameSDKError('GENERATE_TEXT_FAILED', 'Failed to generate text', error)
    }
  }

  private async generateImage(prompt: string, options?: GenerateImageOptions): Promise<string> {
    try {
      const response = await this.sendMessage<{ url: string }>('sdk:generateImage', {
        prompt,
        options,
      })
      return response.url
    } catch (error) {
      throw new GameSDKError('GENERATE_IMAGE_FAILED', 'Failed to generate image', error)
    }
  }

  private async storageSave(key: string, value: any): Promise<void> {
    try {
      await this.sendMessage<void>('sdk:storage:save', { key, value })
    } catch (error) {
      throw new GameSDKError('STORAGE_SAVE_FAILED', 'Failed to save data', error)
    }
  }

  private async storageLoad<T = any>(key: string): Promise<T | null> {
    try {
      const response = await this.sendMessage<{ value: T | null }>('sdk:storage:load', { key })
      return response?.value ?? null
    } catch (error) {
      throw new GameSDKError('STORAGE_LOAD_FAILED', 'Failed to load data', error)
    }
  }

  private async storageClear(): Promise<void> {
    try {
      await this.sendMessage<void>('sdk:storage:clear')
    } catch (error) {
      throw new GameSDKError('STORAGE_CLEAR_FAILED', 'Failed to clear storage', error)
    }
  }

  private async trackEvent(event: string, data?: Record<string, any>): Promise<void> {
    try {
      await this.sendMessage<void>('sdk:analytics:track', { event, data })
    } catch (error) {
      console.warn('[GameSDK] Analytics track failed:', error)
    }
  }

  private async submitScore(score: number, extraData?: Record<string, any>): Promise<void> {
    try {
      await this.sendMessage<void>('sdk:leaderboard:submitScore', { score, extraData })
    } catch (error) {
      throw new GameSDKError('SUBMIT_SCORE_FAILED', 'Failed to submit score', error)
    }
  }

  private async getRanking(type?: 'global' | 'friends', limit?: number): Promise<any[]> {
    try {
      const response = await this.sendMessage<any[]>('sdk:leaderboard:getRanking', {
        type: type || 'global',
        limit: limit || 100,
      })
      return response
    } catch (error) {
      throw new GameSDKError('GET_RANKING_FAILED', 'Failed to get ranking', error)
    }
  }

  destroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this))
    this.pendingRequests.forEach(({ timeout }) => clearTimeout(timeout))
    this.pendingRequests.clear()
    this.readyCallbacks = []
  }
}

export { GameSDKError } from './types'
export type {
  SDKUser,
  SDKConfig,
  SDKMessage,
  GenerateTextOptions,
  GenerateImageOptions,
  SDKMessageType,
} from './types'

export function createGameSDK(config: SDKConfig): GameSDK {
  return new GameSDK(config)
}
