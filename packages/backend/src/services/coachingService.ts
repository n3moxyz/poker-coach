import Anthropic from '@anthropic-ai/sdk';

// Graceful degradation - coaching is optional
// Requires ANTHROPIC_API_KEY from console.anthropic.com
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const MODEL_STANDARD = 'claude-haiku-4-5';
const MODEL_SHARP = 'claude-opus-4-6';

const SYSTEM_PROMPT = `You are a friendly poker coach for beginners learning Texas Hold'em.
Your job is to analyze poker hands and give clear, actionable feedback.

Guidelines:
- Use simple language, no advanced jargon without explanation
- Be encouraging but honest about mistakes
- Focus on one or two key concepts per analysis
- Grade decisions: A (optimal), B (good), C (acceptable), D (suboptimal), F (major mistake)
- Reference specific concepts like position, pot odds, hand strength, board texture
- Keep responses concise and focused`;

export interface StreetAnalysisInput {
  handHistory: unknown;
  street: string;
  playerAction: string;
  playerCards?: unknown;
  communityCards?: unknown;
  potSize?: number;
  position?: string;
}

export interface StreetAnalysisResult {
  grade: string;
  analysis: string;
  optimalPlay: string;
  concepts: string[];
}

export interface HandSummaryResult {
  overallGrade: string;
  streetAnalysis: Array<{
    street: string;
    grade: string;
    analysis: string;
  }>;
  keyLessons: string[];
  coachNote: string;
}

export async function analyzeStreet(
  input: StreetAnalysisInput,
  quality: 'standard' | 'sharp' = 'standard'
): Promise<StreetAnalysisResult | null> {
  if (!anthropic) return null;

  const model = quality === 'sharp' ? MODEL_SHARP : MODEL_STANDARD;

  try {
    const prompt = `Analyze this poker decision and respond in JSON format only.

Hand context:
${JSON.stringify(input, null, 2)}

Respond with this exact JSON structure (no markdown, no code fences):
{
  "grade": "A/B/C/D/F",
  "analysis": "Brief analysis of the decision (2-3 sentences)",
  "optimalPlay": "What the optimal play would be",
  "concepts": ["relevant-concept-1", "relevant-concept-2"]
}`;

    const response = await anthropic.messages.create({
      model,
      max_tokens: quality === 'sharp' ? 500 : 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text) as StreetAnalysisResult;
  } catch (error) {
    console.error('Coaching analyzeStreet error:', error);
    return null;
  }
}

export async function generateHandSummary(
  handHistory: unknown,
  quality: 'standard' | 'sharp' = 'standard'
): Promise<HandSummaryResult | null> {
  if (!anthropic) return null;

  const model = quality === 'sharp' ? MODEL_SHARP : MODEL_STANDARD;

  try {
    const prompt = `Review this complete poker hand and respond in JSON format only.

Hand history:
${JSON.stringify(handHistory, null, 2)}

Respond with this exact JSON structure (no markdown, no code fences):
{
  "overallGrade": "A/B/C/D/F",
  "streetAnalysis": [
    { "street": "preflop", "grade": "A/B/C/D/F", "analysis": "Brief analysis" },
    { "street": "flop", "grade": "A/B/C/D/F", "analysis": "Brief analysis" }
  ],
  "keyLessons": ["One key takeaway", "Another key takeaway"],
  "coachNote": "A brief encouraging note with specific advice (1-2 sentences)"
}

Include only streets that were played. Keep each analysis to 1-2 sentences.`;

    const response = await anthropic.messages.create({
      model,
      max_tokens: quality === 'sharp' ? 800 : 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text) as HandSummaryResult;
  } catch (error) {
    console.error('Coaching generateHandSummary error:', error);
    return null;
  }
}
