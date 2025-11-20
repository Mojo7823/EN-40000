import { sessionService, type CoverSessionData } from '../services/sessionService'
import { dataUrlToFile } from './dataUrl'

export interface CoverImageContext {
  form: CoverSessionData['form']
  uploadedImagePath: string | null
  uploadedImageData: string | null
}

export interface EnsureCoverImageOptions {
  force?: boolean
  filenamePrefix?: string
}

export async function ensureCoverImageUploaded(
  context: CoverImageContext,
  options: EnsureCoverImageOptions = {}
): Promise<string | null> {
  const { force = false, filenamePrefix = 'cover-image' } = options
  const userToken = sessionService.getUserToken()

  if (!userToken) {
    return context.uploadedImagePath
  }

  if (!context.uploadedImageData) {
    return context.uploadedImagePath
  }

  if (!force && context.uploadedImagePath) {
    return context.uploadedImagePath
  }

  const file = dataUrlToFile(context.uploadedImageData, filenamePrefix)
  if (!file) {
    return context.uploadedImagePath
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    const config = useRuntimeConfig()
    let baseURL = config.public.apiBase

    // In dev, use Vite proxy at /api to avoid CORS if using default local address
    if (import.meta.dev && baseURL === 'http://127.0.0.1:8000') {
      baseURL = '/api'
    }

    const response = await $fetch('/cover/upload', {
      method: 'POST',
      baseURL,
      body: formData,
      params: { user_id: userToken },
    })

    const newPath: string | null = (response as any)?.path ?? null
    sessionService.saveCoverData(context.form, newPath, context.uploadedImageData)

    return newPath
  } catch (error) {
    console.error('Failed to restore cover image upload', error)
    return context.uploadedImagePath
  }
}
