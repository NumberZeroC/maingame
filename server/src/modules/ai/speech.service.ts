import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

export interface TextToSpeechOptions {
  voice?: 'male' | 'female' | 'child'
  speed?: number
  format?: 'mp3' | 'wav'
  language?: string
}

export interface SpeechToTextOptions {
  language?: string
}

export interface TTSResult {
  audioUrl: string
  duration: number
}

export interface STTResult {
  text: string
  confidence: number
}

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name)

  constructor(private configService: ConfigService) {}

  async textToSpeech(text: string, options: TextToSpeechOptions = {}): Promise<TTSResult> {
    const voice = options.voice || 'female'
    const speed = options.speed || 1.0
    const format = options.format || 'mp3'
    const language = options.language || 'zh-CN'

    try {
      const dashscopeApiKey = process.env.ALIYUN_DASHSCOPE_API_KEY

      if (dashscopeApiKey) {
        return await this.aliyunTTS(dashscopeApiKey, text, voice, speed, format, language)
      }

      this.logger.warn('No TTS provider configured, returning mock result')
      return this.mockTTS(text, options)
    } catch (error) {
      this.logger.error('TTS failed:', error)
      throw error
    }
  }

  private async aliyunTTS(
    apiKey: string,
    text: string,
    voice: string,
    speed: number,
    format: string,
    language: string
  ): Promise<TTSResult> {
    const voiceMap: Record<string, string> = {
      male: 'zhichu',
      female: 'zhiyan',
      child: 'zhixiaobai',
    }

    const selectedVoice = voiceMap[voice] || 'zhiyan'

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/audio/tts',
      {
        model: 'sambert-zhichu-v1',
        input: {
          text,
        },
        parameters: {
          voice: selectedVoice,
          speech_rate: speed,
          format,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return {
      audioUrl: response.data.output?.audio_url || '',
      duration: response.data.output?.duration || Math.ceil(text.length / 10),
    }
  }

  private mockTTS(text: string, options: TextToSpeechOptions): TTSResult {
    const duration = Math.ceil(text.length / 10)
    return {
      audioUrl: `mock://tts/${Date.now()}.${options.format || 'mp3'}`,
      duration,
    }
  }

  async speechToText(audioData: string, options: SpeechToTextOptions = {}): Promise<STTResult> {
    const language = options.language || 'zh-CN'

    try {
      const dashscopeApiKey = process.env.ALIYUN_DASHSCOPE_API_KEY

      if (dashscopeApiKey) {
        return await this.aliyunSTT(dashscopeApiKey, audioData, language)
      }

      this.logger.warn('No STT provider configured, returning mock result')
      return this.mockSTT(audioData, options)
    } catch (error) {
      this.logger.error('STT failed:', error)
      throw error
    }
  }

  private async aliyunSTT(apiKey: string, audioUrl: string, language: string): Promise<STTResult> {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/audio/asr',
      {
        model: 'paraformer-realtime-v1',
        input: {
          audio_url: audioUrl,
        },
        parameters: {
          language,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return {
      text: response.data.output?.text || '',
      confidence: response.data.output?.confidence || 0.95,
    }
  }

  private mockSTT(audioData: string, options: SpeechToTextOptions): STTResult {
    return {
      text: 'Mock transcription result',
      confidence: 0.95,
    }
  }
}