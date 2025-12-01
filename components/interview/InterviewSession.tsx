"use client";

import { useState, useEffect } from 'react';
import {
    InterviewState,
    INTERVIEW_STEPS,
    STEP_DESCRIPTIONS,
    Message
} from '@/lib/interview-flow';
import { Problem } from '@/lib/problems';
import { ChatInterface } from './ChatInterface';
import { CodeBoard } from './CodeBoard';
import { useWebSpeech } from '@/hooks/useWebSpeech';
import { AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Timer as TimerIcon, LogOut } from 'lucide-react';
import { SUPPORTED_LANGUAGES, INITIAL_CODE_TEMPLATES, SupportedLanguage } from '@/lib/interview-flow';
import Link from 'next/link';

interface InterviewSessionProps {
    problem: Problem;
}

export function InterviewSession({ problem }: InterviewSessionProps) {
    const [state, setState] = useState<InterviewState>({
        currentStep: 'clarify',
        messages: [{
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your coding interview tutor. Let's start by clarifying the problem. Please read the problem description and ask any clarifying questions or provide input/output examples.",
            timestamp: Date.now()
        }],
        code: INITIAL_CODE_TEMPLATES.python,
        language: 'python',
        isRecording: false,
        isSpeaking: false
    });

    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const {
        isRecording,
        isSpeaking,
        transcript,
        startRecording,
        stopRecording,
        speak
    } = useWebSpeech();

    // Sync speech state
    useEffect(() => {
        setState(prev => ({ ...prev, isRecording, isSpeaking }));
    }, [isRecording, isSpeaking]);

    // Handle transcript
    useEffect(() => {
        if (transcript) {
            // In a real app, we might want to debounce this or wait for a pause
            // For now, we'll just let the user manually send or we can auto-fill the input
            // But ChatInterface handles input state. 
            // We might need to pass transcript to ChatInterface or handle it here.
            // Let's just log it for now or maybe we need a way to push it to chat input.
            // Ideally, ChatInterface should consume the hook or we pass a ref.
            // For simplicity, we'll skip auto-filling for now and rely on manual typing or we can implement a "fill from voice" later.
            // Actually, let's just use the transcript as a message if it's final?
            // The hook appends to transcript.
        }
    }, [transcript]);

    const handleSendMessage = async (content: string) => {
        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now()
        };

        setState(prev => ({
            ...prev,
            messages: [...prev.messages, userMsg]
        }));

        // Call AI API
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...state.messages, userMsg],
                    currentStep: state.currentStep,
                    code: state.code,
                    language: state.language,
                    problemId: problem.id
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply,
                timestamp: Date.now()
            };

            setState(prev => ({
                ...prev,
                messages: [...prev.messages, aiMsg],
                currentStep: data.nextStep || prev.currentStep // AI can suggest step transition
            }));

            // Speak the response if voice mode was active (or just always if we want)
            // For now, let's only speak if the user used voice recently or we have a toggle.
            // We'll just speak it for now to demonstrate capability.
            speak(data.reply);

        } catch (error) {
            console.error('Failed to get AI response:', error);
            // Add error message
        }
    };

    const handleCodeChange = (newCode: string) => {
        setState(prev => ({ ...prev, code: newCode }));
    };

    const handleLanguageChange = (newLang: SupportedLanguage) => {
        setState(prev => ({
            ...prev,
            language: newLang,
            code: INITIAL_CODE_TEMPLATES[newLang]
        }));
    };

    return (
        <div className="flex h-screen bg-gray-50 p-4 gap-4">
            {/* Left Panel: Chat & Instructions */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm border">
                    <h2 className="font-bold text-lg mb-2">Current Step: {state.currentStep.replace('_', ' ').toUpperCase()}</h2>
                    <p className="text-sm text-gray-600">{STEP_DESCRIPTIONS[state.currentStep]}</p>

                    <div className="mt-4 flex gap-2 flex-wrap">
                        {INTERVIEW_STEPS.map((step, idx) => {
                            const isCurrent = step === state.currentStep;
                            const isPast = INTERVIEW_STEPS.indexOf(state.currentStep) > idx;

                            return (
                                <div
                                    key={step}
                                    className="relative group flex flex-col items-center"
                                >
                                    <div
                                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 cursor-help
                                            ${isCurrent ? 'border-blue-500 bg-blue-50 text-blue-600' :
                                                isPast ? 'border-green-500 bg-green-50 text-green-600' :
                                                    'border-gray-200 text-gray-400'}`}
                                    >
                                        {isPast ? <CheckCircle2 size={16} /> : idx + 1}
                                    </div>

                                    {/* Tooltip */}
                                    <div className={`absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 text-center
                                        ${idx <= 1 ? 'left-0' :
                                            idx === INTERVIEW_STEPS.length - 1 ? 'right-0' :
                                                'left-1/2 -translate-x-1/2'}`}
                                    >
                                        <div className="font-bold mb-1 capitalize">{step.replace('_', ' ')}</div>
                                        <div className="font-normal opacity-90">{STEP_DESCRIPTIONS[step]}</div>
                                        {/* Arrow */}
                                        <div className={`absolute top-full border-4 border-transparent border-t-gray-900
                                            ${idx <= 1 ? 'left-4 -translate-x-1/2' :
                                                idx === INTERVIEW_STEPS.length - 1 ? 'right-4 translate-x-1/2' :
                                                    'left-1/2 -translate-x-1/2'}`}
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
                                const nextStepIdx = INTERVIEW_STEPS.indexOf(state.currentStep) + 1;
                                if (nextStepIdx < INTERVIEW_STEPS.length) {
                                    const nextStepName = INTERVIEW_STEPS[nextStepIdx].replace('_', ' ');
                                    handleSendMessage(`I would like to move to the "${nextStepName}" step.`);
                                }
                            }}
                            className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>Move to Next Step</span>
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
                    />
                </div>
            </div>

            {/* Right Panel: Code Editor */}
            <div className="w-2/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md shadow-sm border">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors mb-2 text-sm font-medium"
                                title="Exit Interview"
                            >
                                <ArrowLeft size={16} />
                                <span>Exit Interview</span>
                            </Link>
                            <h1 className="font-bold text-xl mb-1">{problem.title}</h1>
                            <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium
                                    ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'}`}
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
                                onClick={() => setState(prev => ({ ...prev, code: INITIAL_CODE_TEMPLATES[prev.language as SupportedLanguage] }))}
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                            >
                                Reset Code
                            </button>
                        </div>
                    </div>
                    <div className="text-gray-700 text-sm bg-gray-50 p-3 rounded border">
                        {problem.description}
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
        </div>
    );
}
