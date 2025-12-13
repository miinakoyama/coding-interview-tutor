# Coding Interview Tutor

## App Overview
**Coding Interview Tutor** is an AI-powered application designed to simulate real-world technical interviews. It helps users practice algorithm problems through a guided, interactive session with an AI interviewer.
Instead of jumping straight to code, the app enforces a structured workflow:
- Clarify the problem - Learners write input/output examples and ask clarifying questions about constraints.
- Plan an approach - Discuss possible strategies with the AI interviewer.
- Request to code - Learners ask for permission to begin coding; the AI either approves or suggests reconsideration.
- Write code - Learners type their solution in a text-based editor.
- Joint debugging - Learners manually trace the code while the AI asks guiding questions.
Analyze complexity - Learners explain time/space complexity.
Reflect and improve - The AI prompts reflection on potential optimizations or design trade-offs.

This process helps candidates develop the "Think Aloud" habit and structured problem-solving skills essential for acing technical interviews.

## Tech Stack
**Frontend & Framework:**
- Next.js 16 (App Router)
- TypeScript
- React 19

**Styling & UI:**
- Tailwind CSS v4
- Framer Motion
- Lucide React
- React Simple Code Editor / PrismJS

**AI & Backend:**
- Google Generative AI SDK (Gemini)

## Requirement: Gemini API Setup
To use the AI interviewer features, this application requires a valid API key from Google Gemini.

1.  **Get an API Key**: Visit [Google AI Studio](https://aistudio.google.com/) to create a new API key.
2.  **Configure Environment**:
    - Create a file named `.env.local` in the root directory.
    - Add your API key to this file:
      ```bash
      NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
      ```
    - Restart the development server if it is already running.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
