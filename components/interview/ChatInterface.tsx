"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Message } from '@/lib/interview-flow';
import { Send, Mic, MicOff, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (content: string) => void;
    isRecording: boolean;
    onToggleRecording: () => void;
    isSpeaking: boolean;
}

export function ChatInterface({
    messages,
    onSendMessage,
    isRecording,
    onToggleRecording,
    isSpeaking
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

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e as any);
                            }
                        }}
                        placeholder="Type your message... (Shift+Enter for new line)"
                        className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none min-h-[44px] max-h-[120px]"
                        rows={1}
                        style={{ height: 'auto', minHeight: '44px' }}
                    />

                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-1"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
