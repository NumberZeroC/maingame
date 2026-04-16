interface PreloadOptions {
  manifest: {
    id: string
    slug: string
    name: string
    entry: string
    assets?: {
      bundleUrl?: string
      preload?: string[]
    }
  }
  onProgress?: (progress: number) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

class GamePreloader {
  private cache: Map<string, Promise<Response>> = new Map()
  private preloadCache: Cache | null = null

  async init(): Promise<void> {
    if ('caches' in window) {
      this.preloadCache = await caches.open('game-preload-cache')
    }
  }

  async preload(options: PreloadOptions): Promise<void> {
    const { manifest, onProgress, onComplete, onError } = options
    const preloadList = manifest.assets?.preload || []

    try {
      if (preloadList.length === 0) {
        onProgress?.(100)
        onComplete?.()
        return
      }

      const total = preloadList.length
      let loaded = 0

      const loadPromises = preloadList.map(async (url) => {
        await this.loadAsset(url)
        loaded++
        onProgress?.(Math.round((loaded / total) * 100))
      })

      await Promise.all(loadPromises)
      onComplete?.()
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Preload failed'))
    }
  }

  private async loadAsset(url: string): Promise<Response> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    const promise = fetch(url, { mode: 'cors' }).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${url}`)
      }
      if (this.preloadCache) {
        this.preloadCache.put(url, response.clone())
      }
      return response
    })

    this.cache.set(url, promise)
    return promise
  }

  async getAsset(url: string): Promise<Response | null> {
    if (this.preloadCache) {
      const cached = await this.preloadCache.match(url)
      if (cached) return cached
    }

    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    return null
  }

  async clearCache(): Promise<void> {
    this.cache.clear()
    if (this.preloadCache) {
      const keys = await this.preloadCache.keys()
      for (const key of keys) {
        await this.preloadCache.delete(key)
      }
    }
  }
}

export const gamePreloader = new GamePreloader()
export type { PreloadOptions }
