export interface SDKUser {
  id: string
  phone: string
  email?: string
  nickname: string
  avatar?: string
  vipLevel: number
  coins: number
}

export interface SDKConfig {
  gameId: string
  origin?: string
  timeout?: number
}

export type SDKMessageType =
  | 'sdk:getUser'
  | 'sdk:getUser:response'
  | 'sdk:generateText'
  | 'sdk:generateText:response'
  | 'sdk:generateImage'
  | 'sdk:generateImage:response'
  | 'sdk:storage:save'
  | 'sdk:storage:save:response'
  | 'sdk:storage:load'
  | 'sdk:storage:load:response'
  | 'sdk:storage:clear'
  | 'sdk:storage:clear:response'
  | 'sdk:analytics:track'
  | 'sdk:analytics:track:response'
  | 'sdk:ready'
  | 'sdk:error'

export interface SDKMessage<T = any> {
  type: SDKMessageType
  requestId?: string
  payload?: T
  error?: string
}

export interface GenerateTextOptions {
  maxTokens?: number
  temperature?: number
}

export interface GenerateImageOptions {
  size?: string
  quality?: string
}

export interface StorageData {
  [key: string]: any
}

export interface AnalyticsEvent {
  name: string
  data?: Record<string, any>
}

export interface SDKError {
  code: string
  message: string
  details?: any
}

export class GameSDKError extends Error {
  code: string
  details?: any

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = 'GameSDKError'
    this.code = code
    this.details = details
  }
}
