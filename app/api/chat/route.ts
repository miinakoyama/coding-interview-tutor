import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { INTERVIEW_STEPS, STEP_DESCRIPTIONS } from "@/lib/interview-flow";

// Initialize Gemini API
// Note: In a real app, this should be in a singleton or service
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

const SYSTEM_PROMPTS = {
  clarify: `You are a coding interview interviewer. The candidate is in the "Clarify" step. 
  Your goal is to ensure they understand the problem. 
  - If the user asks a question, answer it clearly and concisely. Do NOT ask a follow-up question immediately if their question was simple.
  - Only ask them to provide input/output examples if they haven't done so and the conversation has stalled.
  - Do NOT give them the solution.
  - If they seem ready or ask to move on, suggest the "Plan" step.`,

  plan: `You are a coding interview interviewer. The candidate is in the "Plan" step.
  - Discuss their proposed approach.
  - Do NOT summarize their plan back to them. Just acknowledge it (e.g., "That sounds like a solid approach.").
  - If the plan is suboptimal, ask ONE guiding question to help them realize it.
  - Do not overwhelm them with multiple potential issues at once.
  - Once the plan is solid, suggest moving to the "Request to Code" step.`,

  request_code: `You are a coding interview interviewer. The candidate is in the "Request to Code" step.
  - If the user says they want to move to the next step (or clicks the button), simply say "Go ahead" or "Please start coding".
  - Do NOT ask them to explicitly ask for permission if they have already indicated readiness.
  - If they skipped planning completely, gently ask them to outline their approach first.`,

  write_code: `You are a coding interview interviewer. The candidate is in the "Write Code" step.
  - Watch them code.
  - **CRITICAL: Do NOT repeat the user's code in your response.**
  - Focus on the LOGIC first. Do not nitpick syntax errors immediately unless they block understanding.
  - If there are bugs, say "Let's debug this together" or "Let's trace this with an example".
  - If there are syntax errors, mention them gently at the very end, or frame it as "By the way, check the syntax on line X".
  - Encourage them to think aloud if they are silent.`,

  debug: `You are a coding interview interviewer. The candidate is in the "Debug" step.
  - Ask them to trace their code with an example.
  - If they missed a bug, ask ONE specific question like "What happens if input is X?".`,

  analyze: `You are a coding interview interviewer. The candidate is in the "Analyze" step.
  - Ask for the Time and Space complexity.`,

  reflect: `You are a coding interview interviewer. The candidate is in the "Reflect" step.
  - Ask what they would improve if they had more time.
  - Discuss trade-offs.`,
};

export async function POST(req: Request) {
  try {
    const { messages, currentStep, code, language, problemId } =
      await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        reply:
          "I'm ready to help, but I need a Gemini API Key to function. Please configure it in your environment variables.",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      You are an expert technical interviewer conducting a coding interview.
      Current Step: ${currentStep} (${STEP_DESCRIPTIONS[currentStep as keyof typeof STEP_DESCRIPTIONS]
      })
      Problem ID: ${problemId}
      Current Language: ${language || "Not specified"}
      Current Code:
      \`\`\`${language || "javascript"}
      ${code}
      \`\`\`
      
      Instructions for this step:
      ${SYSTEM_PROMPTS[currentStep as keyof typeof SYSTEM_PROMPTS]}
      
      General Rules:
      - Be professional but conversational and encouraging.
      - Keep responses concise (under 3 sentences usually).
      - **CRITICAL: Ask at most ONE question per turn.** Do not stack questions.
      - If answering a user's question, just answer it. You don't always need to follow up with a question.
      - Do NOT write the code for them.
      - Guide them with questions.
      - If they want to move to the next step, check if they have completed the current step's goals.
      - If they are ready to move, explicitly mention the next step in your response so the UI can update.
    `;

    // Convert messages to Gemini format
    const history = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Add system prompt as the first part of the conversation or context
    // Gemini Pro doesn't support system instructions in the same way as OpenAI,
    // but we can prepend it to the first message or use it as context.
    // A common pattern is to send it as the first user message.

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I am ready to conduct the interview as per your instructions.",
            },
          ],
        },
        ...history.slice(0, -1), // All but last message
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = result.response;
    const text = response.text();

    // Simple logic to detect step transition suggestions (can be improved)
    let nextStep = currentStep;
    const lowerText = text.toLowerCase();

    // This is a very basic state transition logic based on keywords
    // In a real app, we might ask the LLM to output a JSON with { reply, nextStep }
    if (
      currentStep === "clarify" &&
      (lowerText.includes("plan") || lowerText.includes("next step"))
    )
      nextStep = "plan";
    else if (
      currentStep === "plan" &&
      (lowerText.includes("code") || lowerText.includes("implement"))
    )
      nextStep = "request_code";
    else if (
      currentStep === "request_code" &&
      (lowerText.includes("go ahead") || lowerText.includes("start"))
    )
      nextStep = "write_code";
    else if (
      currentStep === "write_code" &&
      (lowerText.includes("debug") || lowerText.includes("test"))
    )
      nextStep = "debug";
    else if (
      currentStep === "debug" &&
      (lowerText.includes("complexity") || lowerText.includes("analyze"))
    )
      nextStep = "analyze";
    else if (
      currentStep === "analyze" &&
      (lowerText.includes("reflect") || lowerText.includes("improve"))
    )
      nextStep = "reflect";

    return NextResponse.json({
      reply: text,
      nextStep,
    });
  } catch (error: any) {
    console.error("API Error:", error);

    // Check for rate limiting (429) or service unavailable (503)
    if (
      error.status === 429 ||
      error.message?.includes("429") ||
      error.message?.includes("Too Many Requests")
    ) {
      return NextResponse.json(
        {
          error: "You are sending requests too quickly. Please wait a moment.",
        },
        { status: 429 }
      );
    }

    if (error.status === 503 || error.message?.includes("503")) {
      return NextResponse.json(
        {
          error: "The service is currently overloaded. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
