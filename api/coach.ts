import { GoogleGenAI, Type } from '@google/genai';

const ROLE_CARD = `You are Thoughtful Letter Coach, a patient collaborative writing partner. Ask concise clarifying questions when recipient, purpose, relationship, concrete details, tone, or boundaries are missing. Never invent memories, feelings, promises, or biographical facts. Draft only after enough context exists or the user explicitly asks for a provisional draft. Match the requested tone and language. Prefer specific natural phrasing over clichés. After every draft, invite targeted revision and preserve user-approved wording. Do not send messages or claim to contact anyone.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }

    const { context = {}, messages = [], currentDraft = '', userMessage = '', requestDraftNow = false } = req.body || {};
    const required = [
      ['recipient', 'recipient'],
      ['purpose', 'purpose'],
      ['relationship', 'relationship'],
      ['concreteDetails', 'at least one concrete detail or memory'],
      ['tone', 'desired tone'],
      ['boundaries', 'boundaries/phrases to avoid'],
    ] as const;
    const missingFields = required
      .filter(([key]) => !String(context[key] || '').trim())
      .map(([, label]) => label);
    const canGenerateDraft = missingFields.length === 0 || Boolean(String(currentDraft).trim());
    const preserveVoice = context.preserveVoice !== false;
    const history = messages
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Thoughtful Letter Coach'}: ${m.content}`)
      .join('\n\n');

    const prompt = `
CURRENT USER-PROVIDED CONTEXT
- Recipient: ${context.recipient || '[MISSING]'}
- Purpose: ${context.purpose || '[MISSING]'}
- Relationship: ${context.relationship || '[MISSING]'}
- Concrete details: ${context.concreteDetails || '[MISSING]'}
- Tone: ${context.tone || '[MISSING]'}
- Boundaries / phrases to avoid: ${context.boundaries || '[MISSING]'}
- Letter type: ${context.letterType || 'Not specified'}
- Target length: ${context.targetLength || 'Not specified'}
- Preserve my voice: ${preserveVoice ? 'ON' : 'OFF'}

INTAKE STATUS
- Missing: ${missingFields.length ? missingFields.join(', ') : 'None'}
- Draft allowed: ${canGenerateDraft ? 'YES' : 'NO'}

CURRENT DRAFT
${currentDraft || 'No draft yet.'}

CONVERSATION
${history || 'No previous conversation.'}

LATEST REQUEST
${userMessage || (requestDraftNow ? 'Draft the letter now from the complete intake.' : 'Guide the reflection.')}

RULES
1. If any required field is missing and there is no existing draft, do not draft. Ask at most two concise questions.
2. Never invent facts, memories, feelings, promises, grades, places, or biographical details.
3. Treat the requested tone as a hard constraint and avoid generic clichés.
4. Preserve user-approved sentences and manual edits during revision.
5. After drafting or revision, provide a short change summary and invite targeted revision.
6. Keep the requested target length as closely as possible.
`;

    const ai = new GoogleGenAI({ apiKey });
    let response: any;
    let lastError: any;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: ROLE_CARD,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                hasDraft: { type: Type.BOOLEAN },
                draft: { type: Type.STRING },
                changeSummary: { type: Type.STRING },
                knownDetailsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestionsProvided: { type: Type.ARRAY, items: { type: Type.STRING } },
                clarifyingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingIntakeFields: { type: Type.ARRAY, items: { type: Type.STRING } },
                toneAssessment: { type: Type.STRING },
              },
              required: ['reply', 'hasDraft', 'knownDetailsUsed', 'suggestionsProvided', 'clarifyingQuestions'],
            },
          },
        });
        if (response?.text) break;
      } catch (error: any) {
        lastError = error;
        const retryable = error?.status === 503 || /503|UNAVAILABLE|high demand/i.test(String(error?.message));
        if (!retryable || attempt === 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }
    if (!response?.text && lastError) throw lastError;

    if (!response.text) throw new Error('No response returned by Gemini.');
    const data = JSON.parse(response.text);
    data.clarifyingQuestions = Array.isArray(data.clarifyingQuestions)
      ? data.clarifyingQuestions.slice(0, 2)
      : [];
    if (!canGenerateDraft) {
      data.hasDraft = false;
      data.draft = '';
      data.missingIntakeFields = missingFields;
    }
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in /api/coach:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate coach response' });
  }
}
