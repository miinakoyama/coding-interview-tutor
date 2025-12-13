"use client";

import { useState, useEffect, useCallback } from "react";
import {
  InterviewState,
  INTERVIEW_STEPS,
  STEP_DESCRIPTIONS,
  Message,
  InterviewStep,
} from "@/lib/interview-flow";
import { Problem } from "@/lib/problems";
import { ChatInterface } from "./ChatInterface";
import { CodeBoard } from "./CodeBoard";
import { useWebSpeech } from "@/hooks/useWebSpeech";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Timer as TimerIcon,
  Settings,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  INITIAL_CODE_TEMPLATES,
  SupportedLanguage,
} from "@/lib/interview-flow";
import Link from "next/link";
import { useSettings } from "@/hooks/useSettings";
import { storage } from "@/lib/storage";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FeedbackModal } from "@/components/FeedbackModal";
import { useToast } from "@/components/ui/Toast";

interface InterviewSessionProps {
  problem: Problem;
}

// Recommended time per step (in seconds)
const STEP_RECOMMENDED_TIMES: Record<InterviewStep, number> = {
  clarify: 5 * 60, // 5 minutes
  plan: 10 * 60, // 10 minutes
  request_code: 1 * 60, // 1 minute
  write_code: 20 * 60, // 20 minutes
  debug: 10 * 60, // 10 minutes
  analyze: 5 * 60, // 5 minutes
  reflect: 5 * 60, // 5 minutes
};

export function InterviewSession({ problem }: InterviewSessionProps) {
  const { settings, updateSetting, resetSettings, isLoaded } = useSettings();
  const { showToast } = useToast();

  const [state, setState] = useState<InterviewState>({
    currentStep: "clarify",
    messages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your coding interview tutor. Let's start by clarifying the problem. Please read the problem description and ask any clarifying questions or provide input/output examples.",
        timestamp: Date.now(),
      },
    ],
    code: INITIAL_CODE_TEMPLATES.python,
    language: "python",
    isRecording: false,
    isSpeaking: false,
  });

  const [elapsedTime, setElapsedTime] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(0);
  const [stepElapsedTime, setStepElapsedTime] = useState(0);
  const [hintOffered, setHintOffered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with saved settings
  useEffect(() => {
    if (isLoaded && settings.defaultLanguage) {
      setState((prev) => ({
        ...prev,
        language: settings.defaultLanguage,
        code: INITIAL_CODE_TEMPLATES[settings.defaultLanguage],
      }));
    }
  }, [isLoaded, settings.defaultLanguage]);

  // Save problem to recent on mount
  useEffect(() => {
    storage.addRecentProblem({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
    });
  }, [problem.id, problem.title, problem.difficulty]);

  // Total timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Step timer
  useEffect(() => {
    const timer = setInterval(() => {
      setStepElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset step timer when step changes
  useEffect(() => {
    setStepStartTime(Date.now());
    setStepElapsedTime(0);
    setHintOffered(false);

    // Update progress
    storage.updateProblemProgress(problem.id, state.currentStep);
  }, [state.currentStep, problem.id]);

  // Check if step time exceeded and offer hint
  useEffect(() => {
    const recommendedTime = STEP_RECOMMENDED_TIMES[state.currentStep];
    if (stepElapsedTime > recommendedTime && !hintOffered && !isLoading) {
      setHintOffered(true);
      // Add a system message offering help
      const hintMsg: Message = {
        id: `hint-${Date.now()}`,
        role: "assistant",
        content: `You've been on this step for a while. Would you like a hint? Click the 💡 button or ask me for help!`,
        timestamp: Date.now(),
      };
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, hintMsg],
      }));
    }
  }, [stepElapsedTime, state.currentStep, hintOffered, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const { isRecording, isSpeaking, startRecording, stopRecording, speak } =
    useWebSpeech();

  // Sync speech state
  useEffect(() => {
    setState((prev) => ({ ...prev, isRecording, isSpeaking }));
  }, [isRecording, isSpeaking]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg],
      }));

      setIsLoading(true);

      // Call AI API
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...state.messages, userMsg],
            currentStep: state.currentStep,
            code: state.code,
            language: state.language,
            problemId: problem.id,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          timestamp: Date.now(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMsg],
          currentStep: data.nextStep || prev.currentStep,
        }));

        // Speak the response if auto-speak is enabled
        if (settings.autoSpeakResponses) {
          speak(data.reply);
        }
      } catch (error) {
        console.error("Failed to get AI response:", error);
        showToast("Failed to get AI response. Please try again.", "error");

        // Add error message to chat
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: error instanceof Error ? error.message : "I'm sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        };
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMsg],
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [
      state.messages,
      state.currentStep,
      state.code,
      state.language,
      problem.id,
      settings.autoSpeakResponses,
      speak,
      showToast,
    ]
  );

  const handleRequestHint = useCallback(() => {
    handleSendMessage(`I need a hint for this step. Can you help guide me?`);
  }, [handleSendMessage]);

  const handleCodeChange = (newCode: string) => {
    setState((prev) => ({ ...prev, code: newCode }));
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setState((prev) => ({
      ...prev,
      language: newLang,
      code: INITIAL_CODE_TEMPLATES[newLang],
    }));
  };

  const handleExitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setIsFeedbackOpen(true);
  };

  const currentStepIndex = INTERVIEW_STEPS.indexOf(state.currentStep);
  const recommendedTime = STEP_RECOMMENDED_TIMES[state.currentStep];
  const isOverTime = stepElapsedTime > recommendedTime;

  return (
    <div className="flex h-screen bg-gray-50 p-4 gap-4">
      {/* Left Panel: Chat & Instructions */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm border">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-bold text-lg">
              Current Step: {state.currentStep.replace("_", " ").toUpperCase()}
            </h2>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {STEP_DESCRIPTIONS[state.currentStep]}
          </p>

          {/* Step time indicator */}
          <div
            className={`mt-2 text-xs flex items-center gap-1.5 ${isOverTime ? "text-orange-600" : "text-gray-400"
              }`}
          >
            <TimerIcon size={12} />
            <span>
              {formatTime(stepElapsedTime)} / {formatTime(recommendedTime)}{" "}
              recommended
            </span>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {INTERVIEW_STEPS.map((step, idx) => {
              const isCurrent = step === state.currentStep;
              const isPast = currentStepIndex > idx;

              return (
                <div
                  key={step}
                  className="relative group flex flex-col items-center"
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-help
                                            ${isCurrent
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : isPast
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-gray-200 text-gray-400"
                      }`}
                  >
                    {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>

                  {/* Tooltip */}
                  <div
                    className={`absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 text-center
                                        ${idx <= 1
                        ? "left-0"
                        : idx === INTERVIEW_STEPS.length - 1
                          ? "right-0"
                          : "left-1/2 -translate-x-1/2"
                      }`}
                  >
                    <div className="font-bold mb-1 capitalize">
                      {step.replace("_", " ")}
                    </div>
                    <div className="font-normal opacity-90">
                      {STEP_DESCRIPTIONS[step]}
                    </div>
                    <div className="font-normal opacity-70 mt-1">
                      ~{Math.round(STEP_RECOMMENDED_TIMES[step] / 60)} min
                    </div>
                    {/* Arrow */}
                    <div
                      className={`absolute top-full border-4 border-transparent border-t-gray-900
                                            ${idx <= 1
                          ? "left-4 -translate-x-1/2"
                          : idx ===
                            INTERVIEW_STEPS.length - 1
                            ? "right-4 translate-x-1/2"
                            : "left-1/2 -translate-x-1/2"
                        }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Step Button */}
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => {
                const nextStepIdx = currentStepIndex + 1;
                if (nextStepIdx < INTERVIEW_STEPS.length) {
                  const nextStepName = INTERVIEW_STEPS[nextStepIdx].replace(
                    "_",
                    " "
                  );
                  handleSendMessage(
                    `I would like to move to the "${nextStepName}" step.`
                  );
                } else {
                  // Last step - offer to finish
                  setIsFeedbackOpen(true);
                }
              }}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>
                {currentStepIndex >= INTERVIEW_STEPS.length - 1
                  ? "Finish Session"
                  : "Move to Next Step"}
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={state.messages}
            onSendMessage={handleSendMessage}
            isRecording={isRecording}
            onToggleRecording={isRecording ? stopRecording : startRecording}
            isSpeaking={isSpeaking}
            voiceEnabled={settings.voiceEnabled}
            onRequestHint={handleRequestHint}
          />
        </div>
      </div>

      {/* Right Panel: Code Editor */}
      <div className="w-2/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm border">
          <div className="flex justify-between items-start mb-4">
            <div>
              <button
                onClick={handleExitClick}
                className="inline-flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors mb-2 text-sm font-medium"
                title="Exit Interview"
              >
                <ArrowLeft size={16} />
                <span>Exit Interview</span>
              </button>
              <h1 className="font-bold text-xl mb-1">{problem.title}</h1>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium
                                    ${problem.difficulty === "Easy"
                      ? "bg-green-100 text-green-700"
                      : problem.difficulty === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                >
                  {problem.difficulty}
                </span>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              {/* Timer */}
              <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-mono">
                <TimerIcon size={16} />
                <span>{formatTime(elapsedTime)}</span>
              </div>

              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    code: INITIAL_CODE_TEMPLATES[
                      prev.language as SupportedLanguage
                    ],
                  }))
                }
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
              >
                Reset Code
              </button>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold">
              <FileText size={18} />
              <h3>Problem Statement</h3>
            </div>
            <div className="text-gray-800 text-base leading-relaxed">
              {problem.description}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <CodeBoard
            code={state.code}
            onChange={handleCodeChange}
            language={state.language}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onResetSettings={resetSettings}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => {
          setIsFeedbackOpen(false);
          // Navigate to home after feedback
          window.location.href = "/";
        }}
        problemId={problem.id}
        problemTitle={problem.title}
      />

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowExitConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Exit Interview?</h3>
                <p className="text-sm text-gray-600">
                  Your progress will be lost.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
