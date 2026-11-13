import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = isProd ? (process.env.PORT ? parseInt(process.env.PORT, 10) : 8080) : 3000;

app.use(express.json({ limit: '10mb' }));

// Healthcheck endpoint for Cloud Run
app.get(['/healthz', '/_healthz', '/api/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

const ROLE_CARD = `You are Thoughtful Letter Coach, a patient collaborative writing partner. Ask concise clarifying questions when recipient, purpose, relationship, concrete details, tone, or boundaries are missing. Never invent memories, feelings, promises, or biographical facts. Distinguish known details from suggestions. Draft only after enough context exists or the user explicitly asks for a provisional draft. Match the requested tone and language. Prefer specific natural phrasing over clichés. After every draft, invite targeted revision and preserve user-approved wording. Do not send messages or claim to contact anyone.`;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.post('/api/coach', async (req, res) => {
  try {
    const { context, messages, currentDraft, userMessage, requestDraftNow } = req.body;

    const formattedHistory = (messages || []).map((m: { role: string; content: string }) => {
      return `${m.role === 'user' ? 'User' : 'Thoughtful Letter Coach'}: ${m.content}`;
    }).join('\n\n');

    // Pre-draft intake validation: require all 6 items before generating any draft
    const hasRecipient = Boolean(context?.recipient && context.recipient.trim().length > 0);
    const hasPurpose = Boolean(context?.purpose && context.purpose.trim().length > 0);
    const hasRelationship = Boolean(context?.relationship && context.relationship.trim().length > 0);
    const hasConcreteDetails = Boolean(context?.concreteDetails && context.concreteDetails.trim().length > 0);
    const hasTone = Boolean(context?.tone && context.tone.trim().length > 0);
    const hasBoundaries = Boolean(context?.boundaries && context.boundaries.trim().length > 0);

    const missingFields: string[] = [];
    if (!hasRecipient) missingFields.push('recipient');
    if (!hasPurpose) missingFields.push('purpose');
    if (!hasRelationship) missingFields.push('relationship');
    if (!hasConcreteDetails) missingFields.push('at least one concrete detail or memory');
    if (!hasTone) missingFields.push('desired tone');
    if (!hasBoundaries) missingFields.push('boundaries/phrases to avoid');

    const canGenerateDraft = missingFields.length === 0 || (currentDraft && currentDraft.trim().length > 0);

    const preserveVoice = context?.preserveVoice !== false;

    const prompt = `
CURRENT LETTER CONTEXT COLLECTED FROM USER:
- Recipient: ${context?.recipient || '[MISSING - REQUIRED]'}
- Purpose / Core Message: ${context?.purpose || '[MISSING - REQUIRED]'}
- Relationship: ${context?.relationship || '[MISSING - REQUIRED]'}
- Concrete Memory / Specific Details: ${context?.concreteDetails || '[MISSING - REQUIRED]'}
- Desired Tone: ${context?.tone || '[MISSING - REQUIRED]'}
- Boundaries / Phrases to Avoid: ${context?.boundaries || '[MISSING - REQUIRED]'}
- Letter Type: ${context?.letterType || 'Not specified'}
- Target Length / Specific Request: ${context?.targetLength || 'Not specified'}
- 'Preserve My Voice' Toggle: ${preserveVoice ? 'ON (Strictly protect user authentic voice and phrasing)' : 'OFF'}

PRE-DRAFT INTAKE STATUS:
- Missing required fields: ${missingFields.length > 0 ? missingFields.join(', ') : 'None! All 6 required intake items are provided.'}
- Ready to draft: ${canGenerateDraft ? 'YES' : 'NO - PRE-DRAFT INTAKE INCOMPLETE'}

CURRENT WORKING DRAFT (if any):
${currentDraft ? `"""\n${currentDraft}\n"""` : 'No draft yet.'}

CONVERSATION HISTORY:
${formattedHistory || 'No previous conversation.'}

LATEST USER MESSAGE / ACTION:
${userMessage || (requestDraftNow ? 'Please draft the letter based on the provided intake.' : 'Please guide my reflection on the letter context.')}

CRITICAL RULES FOR THOUGHTFUL LETTER COACH:
1. STRICT PRE-DRAFT INTAKE ENFORCEMENT:
   - Before generating any draft, the following 6 pieces of context are STRICTLY REQUIRED:
     1) recipient
     2) purpose
     3) relationship
     4) at least one concrete detail or memory
     5) desired tone
     6) boundaries/phrases to avoid
   - If ANY of these 6 fields are missing and no existing draft is being revised, YOU MUST NOT GENERATE A DRAFT. Set "hasDraft" to false and "draft" to "".
   - Instead, ask NO MORE THAN TWO concise clarifying questions at a time to help the user provide the missing items.
2. QUESTION LIMIT:
   - Never ask more than two clarifying questions in a single response.
3. TONE AS STRICT CONSTRAINT & AVOID CLICHÉS:
   - Treat the user's chosen tone ("${context?.tone || 'warm professional'}") as a HARD CONSTRAINT throughout the entire letter.
   - Absolutely avoid clichés (e.g. "I hope this email/letter finds you well", "words cannot express", "needless to say", "please do not hesitate", "plethora", etc.).
   - Use specific, natural, human phrasing.
4. KEEP USER-APPROVED SENTENCES UNCHANGED:
   - During revision, keep any user-approved sentences or manual edits completely unchanged.
   - When 'Preserve My Voice' is enabled, do not smooth away the user's authentic expressions into sterile AI template prose.
5. ANTI-HALLUCINATION:
   - Never invent memories, feelings, promises, or biographical facts.
   - Distinguish known user-provided details from suggestions.
6. CHANGE SUMMARY:
   - After every revision or initial draft, provide a short, clear 1-2 sentence change summary explaining what was adjusted, what was preserved verbatim, and word count.
`;

    // Call Gemini with retry logic for transient high-demand spikes
    const ai = getGeminiClient();
    let response: any = null;
    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
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
                reply: {
                  type: Type.STRING,
                  description: 'Conversational coach response: reflection, guidance, feedback, or concise clarifying questions.',
                },
                hasDraft: {
                  type: Type.BOOLEAN,
                  description: 'Set to true ONLY if all 6 intake requirements are met or if revising an existing draft.',
                },
                draft: {
                  type: Type.STRING,
                  description: 'The letter draft text if all 6 requirements are met, otherwise empty string.',
                },
                changeSummary: {
                  type: Type.STRING,
                  description: 'A short 1-2 sentence summary of what changed, what was preserved, and word count adjustments.',
                },
                knownDetailsUsed: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of exact user-provided facts and details anchored into this draft.',
                },
                suggestionsProvided: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of suggestions or stylistic choices clearly distinguished from user facts.',
                },
                clarifyingQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'NO MORE THAN TWO concise clarifying questions focused on missing required fields or reflection.',
                },
                missingIntakeFields: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of any of the 6 required intake fields that are still missing.',
                },
                toneAssessment: {
                  type: Type.STRING,
                  description: 'Brief note on how the draft matches the requested tone constraint without cliché.',
                },
              },
              required: ['reply', 'hasDraft', 'knownDetailsUsed', 'suggestionsProvided', 'clarifyingQuestions'],
            },
          },
        });
        if (response && response.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini attempt ${attempt + 1} failed: ${err.message}. Retrying...`);
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    const text = response.text;
    if (!text) {
      throw new Error('No response text returned by Gemini API');
    }

    const data = JSON.parse(text);

    // Hard enforcement: clamp clarifying questions to at most 2
    if (data.clarifyingQuestions && Array.isArray(data.clarifyingQuestions)) {
      data.clarifyingQuestions = data.clarifyingQuestions.slice(0, 2);
    } else {
      data.clarifyingQuestions = [];
    }

    // Hard enforcement: if intake is incomplete and there is no draft yet, suppress draft
    if (!canGenerateDraft) {
      data.hasDraft = false;
      data.draft = '';
      data.missingIntakeFields = missingFields;
    }
    return res.json(data);
  } catch (error: any) {
    console.error('Error in /api/coach:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate coach response',
      details: error.toString(),
    });
  }
});

// Serve frontend in development with Vite middlewares, or static in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
