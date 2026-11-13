export interface LetterContext {
  letterType: string;
  recipient: string;
  relationship: string;
  purpose: string;
  concreteDetails: string;
  tone: string;
  boundaries: string;
  targetLength: string;
  preserveVoice: boolean; // Iteration 2: 'preserve my voice' toggle
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  knownDetailsUsed?: string[];
  suggestionsProvided?: string[];
  clarifyingQuestions?: string[];
  changeSummary?: string; // Iteration 2: short change summary after each revision
  toneAssessment?: string;
  associatedDraft?: string;
}

export interface DraftVersion {
  id: string;
  versionNumber: number;
  text: string;
  wordCount: number;
  timestamp: string;
  label: string;
  source: 'coach' | 'user';
  isAccepted?: boolean; // Iteration 3: explicit Accept flag
  changeSummary?: string;
}

export interface CoachApiResponse {
  reply: string;
  hasDraft: boolean;
  draft: string;
  changeSummary?: string; // Iteration 2: short change summary
  knownDetailsUsed: string[];
  suggestionsProvided: string[];
  clarifyingQuestions?: string[];
  missingIntakeFields?: string[];
  toneAssessment?: string;
}

export const REQUIRED_INTAKE_KEYS = [
  'recipient',
  'purpose',
  'relationship',
  'concreteDetails',
  'tone',
  'boundaries',
] as const;

export type RequiredIntakeKey = typeof REQUIRED_INTAKE_KEYS[number];

export const TONE_PRESETS = [
  'warm professional',
  'formal',
  'friendly',
  'heartfelt',
  'concise',
] as const;
