"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSpeechReturn {
    isRecording: boolean;
    isSpeaking: boolean;
    transcript: string;
    startRecording: () => void;
    stopRecording: () => void;
    speak: (text: string) => void;
    stopSpeaking: () => void;
    error: string | null;
}

export function useWebSpeech(): UseWebSpeechReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Initialize Speech Recognition
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US'; // Default to English for coding interview

                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setTranscript(prev => prev + ' ' + finalTranscript);
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    setError(event.error);
                    setIsRecording(false);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                };
            } else {
                setError('Speech recognition not supported in this browser.');
            }

            // Initialize Speech Synthesis
            if ('speechSynthesis' in window) {
                synthRef.current = window.speechSynthesis;
            } else {
                setError('Speech synthesis not supported in this browser.');
            }
        }
    }, []);

    const startRecording = useCallback(() => {
        if (recognitionRef.current && !isRecording) {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
                setError(null);
            } catch (e) {
                console.error(e);
            }
        }
    }, [isRecording]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const speak = useCallback((text: string) => {
        if (synthRef.current) {
            // Cancel current speech
            synthRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            synthRef.current.speak(utterance);
        }
    }, []);

    const stopSpeaking = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        isRecording,
        isSpeaking,
        transcript,
        startRecording,
        stopRecording,
        speak,
        stopSpeaking,
        error
    };
}
