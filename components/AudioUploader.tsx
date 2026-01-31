'use client'

import { useState } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface AudioUploaderProps {
  onTranscriptComplete: (text: string) => void
}

export default function AudioUploader({ onTranscriptComplete }: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [transcriptId, setTranscriptId] = useState<string | null>(null)
  const [estimatedCost, setEstimatedCost] = useState<number>(0)

  const supportedFormats = [
    '.mp3', '.mp4', '.wav', '.m4a', '.flac', '.ogg', '.webm', '.mpeg', '.mpga'
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (500MB limit)
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const uploadAndTranscribe = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setProgress(10)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('speaker_labels', 'true') // Enable speaker diarization

      setProgress(30)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      setProgress(50)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setTranscriptId(data.transcriptId)
      setEstimatedCost(data.cost)
      setUploading(false)
      setTranscribing(true)

      // Poll for completion
      await pollTranscript(data.transcriptId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploading(false)
      setProgress(0)
    }
  }

  const pollTranscript = async (id: string) => {
    const maxAttempts = 120 // 10 minutes max (5 second intervals)
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/transcribe?id=${id}`)
        const data = await response.json()

        if (data.status === 'completed') {
          setTranscribing(false)
          setProgress(100)
          onTranscriptComplete(data.text)
          return
        }

        if (data.status === 'error') {
          throw new Error(data.error || 'Transcription failed')
        }

        // Still processing
        attempts++
        if (attempts >= maxAttempts) {
          throw new Error('Transcription timeout - please try again')
        }

        // Update progress (estimate based on time elapsed)
        const progressPercent = Math.min(50 + (attempts / maxAttempts) * 50, 95)
        setProgress(Math.round(progressPercent))

        // Poll again in 5 seconds
        setTimeout(poll, 5000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transcription failed')
        setTranscribing(false)
        setProgress(0)
      }
    }

    poll()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload Audio or Video
      </h3>

      {/* File Input */}
      {!file && !uploading && !transcribing && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept={supportedFormats.join(',')}
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              MP3, MP4, WAV, M4A, FLAC, OGG, WEBM (max 500MB)
            </p>
          </label>
        </div>
      )}

      {/* Selected File */}
      {file && !uploading && !transcribing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <button
            onClick={uploadAndTranscribe}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Transcribe Audio
          </button>

          <p className="text-xs text-gray-500 text-center">
            Estimated cost: ~$0.{estimatedCost > 0 ? estimatedCost.toFixed(4).substring(2) : '01'}
            (based on audio duration)
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {(uploading || transcribing) && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-gray-700 font-medium">
              {uploading ? 'Uploading...' : 'Transcribing...'}
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            {progress}% complete
            {transcribing && ' - This may take a few minutes for long files'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Transcription failed</p>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setFile(null)
                setProgress(0)
              }}
              className="text-sm text-red-600 hover:text-red-700 underline mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
