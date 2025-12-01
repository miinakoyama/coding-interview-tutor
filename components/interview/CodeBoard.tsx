"use client";

import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-typescript';

import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/interview-flow';

interface CodeBoardProps {
    code: string;
    onChange: (code: string) => void;
    language: string;
    onLanguageChange: (lang: SupportedLanguage) => void;
    readOnly?: boolean;
}

export function CodeBoard({ code, onChange, language, onLanguageChange, readOnly = false }: CodeBoardProps) {
    return (
        <div className="h-full w-full border rounded-md overflow-hidden bg-white font-mono text-sm shadow-sm">
            <div className="bg-gray-100 px-4 py-2 border-b text-gray-600 text-xs font-semibold uppercase tracking-wider flex justify-between items-center">
                <span>Editor</span>
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                    className="bg-transparent border-none text-xs text-gray-600 focus:ring-0 cursor:pointer hover:text-gray-900"
                >
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.id} value={lang.id}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="h-[calc(100%-40px)] overflow-auto">
                <Editor
                    value={code}
                    onValueChange={onChange}
                    highlight={code => {
                        let grammar = languages.javascript;
                        if (language === 'python') grammar = languages.python;
                        else if (language === 'java') grammar = languages.java;
                        else if (language === 'cpp') grammar = languages.cpp;
                        else if (language === 'go') grammar = languages.go;
                        else if (language === 'rust') grammar = languages.rust;
                        else if (language === 'ruby') grammar = languages.ruby;
                        else if (language === 'kotlin') grammar = languages.kotlin;
                        else if (language === 'swift') grammar = languages.swift;
                        else if (language === 'typescript') grammar = languages.typescript;

                        return highlight(code, grammar || languages.javascript, language);
                    }}
                    padding={16}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: '100%',
                    }}
                    disabled={readOnly}
                    textareaClassName="focus:outline-none"
                />
            </div>
        </div>
    );
}
