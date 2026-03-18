import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface AIRecommendation {
  explanation: string
  recommended_steps: string[]
  success_likelihood: string
  alternative_actions: string[]
}

export async function getAIRecommendation({
  rejectCode,
  rejectDescription,
  plainEnglish,
  pbmName,
  drugName,
  insuranceType,
  existingResolutions,
}: {
  rejectCode: string
  rejectDescription: string
  plainEnglish: string
  pbmName?: string
  drugName?: string
  insuranceType?: string
  existingResolutions?: Array<{
    action_taken: string
    outcome: string
    helpful_count: number
  }>
}): Promise<AIRecommendation> {
  const resolutionContext = existingResolutions?.length
    ? `\n\nHistorical resolutions from other pharmacies for this combination:\n${existingResolutions
        .map(
          (r, i) =>
            `${i + 1}. Action: ${r.action_taken} | Outcome: ${r.outcome} | Helpful votes: ${r.helpful_count}`
        )
        .join('\n')}`
    : ''

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are an expert pharmacy claims specialist with deep knowledge of NCPDP rejection codes, PBM processes, and pharmacy billing. You help pharmacy technicians and pharmacists resolve claim rejections efficiently. Always provide practical, actionable advice.`,
    messages: [
      {
        role: 'user',
        content: `A pharmacy received the following claim rejection. Please analyze it and provide resolution recommendations.

Rejection Code: ${rejectCode}
Official Description: ${rejectDescription}
Plain English: ${plainEnglish}
${pbmName ? `PBM: ${pbmName}` : ''}
${drugName ? `Drug: ${drugName}` : ''}
${insuranceType ? `Insurance Type: ${insuranceType}` : ''}
${resolutionContext}

Please respond with a JSON object (no markdown, just JSON) with these fields:
- "explanation": A 2-3 sentence explanation of why this rejection likely occurred in this specific context
- "recommended_steps": An array of 3-5 ordered resolution steps, most effective first
- "success_likelihood": One of "high", "medium", or "low" based on the typical resolution success for this type of rejection
- "alternative_actions": An array of 2-3 backup actions if the primary steps don't work`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type')
  }

  try {
    return JSON.parse(content.text) as AIRecommendation
  } catch {
    // If JSON parsing fails, return a structured fallback
    return {
      explanation: content.text,
      recommended_steps: ['Review the rejection details and contact the PBM for specific guidance.'],
      success_likelihood: 'medium',
      alternative_actions: ['Contact PBM help desk directly', 'Escalate to pharmacy manager'],
    }
  }
}
