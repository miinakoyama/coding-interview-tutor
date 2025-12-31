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

## Open Source Attribution

### Framework & Libraries

This application was built from scratch using the following open-source packages:

| Package                  | License    | Purpose                                     |
| ------------------------ | ---------- | ------------------------------------------- |
| Next.js 16               | MIT        | React framework for frontend and API routes |
| React 19                 | MIT        | UI library                                  |
| @google/generative-ai    | Apache-2.0 | Google Gemini API SDK                       |
| Tailwind CSS v4          | MIT        | Utility-first CSS framework                 |
| Framer Motion            | MIT        | Animation library                           |
| Lucide React             | ISC        | Icon library                                |
| PrismJS                  | MIT        | Syntax highlighting                         |
| react-simple-code-editor | MIT        | Code editor component                       |
| clsx / tailwind-merge    | MIT        | CSS class utilities                         |

### What I Built From Scratch

All application logic and components were implemented from scratch. No existing open-source codebase was forked or modified.

- **Interview Flow Engine** (`lib/interview-flow.ts`) – AI interviewer state machine and prompt engineering
- **Chat Interface** (`components/interview/ChatInterface.tsx`) – Real-time conversation UI with message history
- **Code Editor** (`components/interview/CodeBoard.tsx`) – Integrated code writing environment with syntax highlighting
- **Problem Set** (`lib/problems.ts`) – Curated algorithm problems for practice
- **Voice Input** (`hooks/useWebSpeech.ts`) – Web Speech API integration for voice-based interaction
- **Settings Management** (`hooks/useSettings.ts`) – User preferences and configuration
- **API Routes** (`app/api/chat/route.ts`) – Backend integration with Gemini AI

## Requirement: Gemini API Setup

To use the AI interviewer features, this application requires a valid API key from Google Gemini.

1.  **Get an API Key**: Visit [Google AI Studio](https://aistudio.google.com/) to create a new API key.
2.  **Configure Environment**:
    - Create a file named `.env.local` in the root directory.
    - Add your API key to this file:
      ```bash
      GEMINI_API_KEY=your_api_key_here
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

## Human-AI Interaction Guidelines

This application was designed following the [Guidelines for Human-AI Interaction](https://www.microsoft.com/en-us/research/project/guidelines-for-human-ai-interaction/) by Microsoft Research. Below is how each implemented guideline shapes the user experience:

### Initially

| Guideline                                                    | Implementation                                                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **G1: Make clear what the system can do**                    | The homepage includes a "What You Can Do Here" section that explains the 7-step interview process and key features before users begin.                                         |
| **G2: Make clear how well the system can do what it can do** | A disclaimer below the chat input states: "AI won't give direct answers. No code execution available." This sets realistic expectations about AI capabilities and limitations. |

### During Interaction

| Guideline                              | Implementation                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G3: Time services based on context** | Each step displays recommended time (e.g., "5 min for Clarify"). When users exceed the recommended time, the AI proactively offers hints. A hint button (💡) is always available for on-demand assistance. |

### When Wrong

| Guideline                             | Implementation                                                                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G10: Scope services when in doubt** | When API calls fail, the app displays user-friendly toast notifications instead of failing silently. Error messages are shown in the chat with clear recovery options. |

### Over Time

| Guideline                             | Implementation                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **G12: Remember recent interactions** | Recently practiced problems are saved to LocalStorage and displayed on the homepage as "Recently Practiced" cards, allowing users to quickly resume or revisit problems. |
| **G13: Learn from user behavior**     | User preferences (default programming language, voice settings) are persisted in LocalStorage and automatically applied in future sessions.                              |
| **G15: Encourage granular feedback**  | After completing or exiting a session, users are presented with an optional feedback modal featuring star ratings and free-text comments.                                |
| **G17: Provide global controls**      | A settings panel (⚙️) allows users to toggle voice input, auto-speak responses, and set their preferred programming language at any time.                                |
