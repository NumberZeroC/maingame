import { Injectable, Logger } from '@nestjs/common'
import { Observable, Subject } from 'rxjs'
import { AICoreService } from '../ai/ai-core.service'
import { ChatMessage, TextGenerationOptions, ChatOptions } from '../ai/interfaces'

export interface StreamChunk {
  text: string
  done: boolean
  error?: string
}

@Injectable()
export class StreamService {
  private readonly logger = new Logger(StreamService.name)

  constructor(private readonly aiCoreService: AICoreService) {}

  async streamText(prompt: string, options: TextGenerationOptions = {}): Promise<string> {
    return this.aiCoreService.generateText(prompt, options).then(r => r.text)
  }

  async streamChat(messages: ChatMessage[], options: ChatOptions = {}): Promise<string> {
    return this.aiCoreService.chat(messages, options).then(r => r.text)
  }

  createTextStream(prompt: string, options: TextGenerationOptions = {}): Observable<StreamChunk> {
    const subject = new Subject<StreamChunk>()

    this.streamText(prompt, options)
      .then(fullText => {
        const words = fullText.split(/(\s+)/)
        let accumulated = ''
        
        for (const word of words) {
          accumulated += word
          subject.next({ text: accumulated, done: false })
        }
        
        subject.next({ text: fullText, done: true })
        subject.complete()
      })
      .catch(error => {
        this.logger.error('Stream error:', error)
        subject.next({ text: '', done: true, error: error.message })
        subject.complete()
      })

    return subject.asObservable()
  }

  createChatStream(messages: ChatMessage[], options: ChatOptions = {}): Observable<StreamChunk> {
    const subject = new Subject<StreamChunk>()

    this.streamChat(messages, options)
      .then(fullText => {
        const words = fullText.split(/(\s+)/)
        let accumulated = ''
        
        for (const word of words) {
          accumulated += word
          subject.next({ text: accumulated, done: false })
        }
        
        subject.next({ text: fullText, done: true })
        subject.complete()
      })
      .catch(error => {
        this.logger.error('Stream error:', error)
        subject.next({ text: '', done: true, error: error.message })
        subject.complete()
      })

    return subject.asObservable()
  }

  simulateStream(text: string, chunkDelayMs: number = 50): Observable<StreamChunk> {
    const subject = new Subject<StreamChunk>()
    const words = text.split(/(\s+)/)
    let accumulated = ''
    let index = 0

    const interval = setInterval(() => {
      if (index < words.length) {
        accumulated += words[index]
        subject.next({ text: accumulated, done: false })
        index++
      } else {
        subject.next({ text: text, done: true })
        subject.complete()
        clearInterval(interval)
      }
    }, chunkDelayMs)

    return subject.asObservable()
  }
}