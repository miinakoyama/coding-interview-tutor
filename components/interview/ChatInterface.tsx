"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Message } from '@/lib/interview-flow';
import { Send, Mic, MicOff, User, Bot, Lightbulb, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (content: string) => void;
    isRecording: boolean;
    onToggleRecording: () => void;
    isSpeaking: boolean;
    voiceEnabled?: boolean;
    onRequestHint?: () => void;
    transcript?: string;
    onTranscriptReset?: () => void;
}

export function ChatInterface({
    messages,
    onSendMessage,
    isRecording,
    onToggleRecording,
    isSpeaking,
    voiceEnabled = true,
    onRequestHint,
    transcript,
    onTranscriptReset
}: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    // Update input when transcript changes
    useEffect(() => {
        if (transcript && onTranscriptReset) {
            setInput(prev => (prev ? prev + ' ' : '') + transcript);
            onTranscriptReset();
        }
    }, [transcript, onTranscriptReset]);

    return (
        <div className="flex flex-col h-full bg-white border rounded-md shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b text-gray-600 text-xs font-semibold uppercase tracking-wider flex justify-between items-center">
                <span>Interview Chat</span>
                {isSpeaking && <span className="text-blue-500 animate-pulse">AI Speaking...</span>}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                                "flex w-full",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] rounded-lg p-3 text-sm flex gap-2 items-start",
                                    msg.role === 'user'
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-800"
                                )}
                            >
                                <span className="mt-0.5 shrink-0 opacity-70">
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </span>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-gray-50">
                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    {/* Voice button - only show if voice is enabled */}
                    {voiceEnabled && (
                        <button
                            type="button"
                            onClick={onToggleRecording}
                            className={cn(
                                "p-2 rounded-full transition-colors mb-1",
                                isRecording
                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            )}
                            title={isRecording ? "Stop recording" : "Start recording"}
                        >
                            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e as unknown as React.FormEvent);
                            }
                        }}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none min-h-[80px] max-h-[200px]"
                        rows={3}
                        style={{ height: 'auto', minHeight: '80px' }}
                    />

                    <div className="flex flex-col gap-2 items-center mb-1">
                        {onRequestHint && (
                            <button
                                type="button"
                                onClick={onRequestHint}
                                className="p-1.5 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                                title="Request a hint"
                            >
                                <Lightbulb size={16} />
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>

                {/* G2: AI Limitations disclaimer */}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                    <Info size={12} />
                    <span>AI won&apos;t give direct answers. No code execution available.</span>
                </div>
            </div>
        </div>
    );
}
