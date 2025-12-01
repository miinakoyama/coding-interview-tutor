export type InterviewStep =
  | 'clarify'
  | 'plan'
  | 'request_code'
  | 'write_code'
  | 'debug'
  | 'analyze'
  | 'reflect';

export const INTERVIEW_STEPS: InterviewStep[] = [
  'clarify',
  'plan',
  'request_code',
  'write_code',
  'debug',
  'analyze',
  'reflect'
];

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface InterviewState {
  currentStep: InterviewStep;
  messages: Message[];
  code: string;
  language: string;
  isRecording: boolean;
  isSpeaking: boolean;
}

export const STEP_DESCRIPTIONS: Record<InterviewStep, string> = {
  clarify: "Clarify the problem: Write input/output examples and ask about constraints.",
  plan: "Plan your approach: Discuss strategies with the interviewer.",
  request_code: "Request to code: Ask for permission to begin coding.",
  write_code: "Write code: Implement your solution.",
  debug: "Joint debugging: Trace your code with the interviewer.",
  analyze: "Analyze complexity: Explain time and space complexity.",
  reflect: "Reflect and improve: Discuss optimizations and trade-offs."
};

export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'swift', name: 'Swift' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['id'];

export const INITIAL_CODE_TEMPLATES: Record<SupportedLanguage, string> = {
  python: `# Write your solution here\n`,
  javascript: `// Write your solution here\n`,
  typescript: `// Write your solution here\n`,
  java: `// Write your solution here\n`,
  cpp: `// Write your solution here\n`,
  go: `// Write your solution here\n`,
  rust: `// Write your solution here\n`,
  ruby: `# Write your solution here\n`,
  kotlin: `// Write your solution here\n`,
  swift: `// Write your solution here\n`
};

export const INITIAL_CODE = INITIAL_CODE_TEMPLATES.python;
