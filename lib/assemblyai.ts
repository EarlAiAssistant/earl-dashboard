import { AssemblyAI } from 'assemblyai'

let assemblyAIClient: AssemblyAI | null = null

/**
 * Get the AssemblyAI client (lazy initialization)
 * This prevents build errors when ASSEMBLYAI_API_KEY isn't set
 */
export function getAssemblyAI(): AssemblyAI {
  if (!assemblyAIClient) {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new Error('ASSEMBLYAI_API_KEY is not set')
    }
    assemblyAIClient = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY,
    })
  }
  return assemblyAIClient
}
