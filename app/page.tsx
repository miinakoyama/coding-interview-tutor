"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { PROBLEMS } from '@/lib/problems';
import { ArrowRight, MessageSquare, Code2, Clock, Brain, History, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { storage, RecentProblem } from '@/lib/storage';

// 7-step process features
const FEATURES = [
  { icon: MessageSquare, title: 'Clarify', desc: 'Ask questions about the problem' },
  { icon: Brain, title: 'Plan', desc: 'Discuss your approach' },
  { icon: Code2, title: 'Code', desc: 'Write your solution' },
  { icon: CheckCircle2, title: 'Debug', desc: 'Trace and fix issues' },
];

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([]);

  useEffect(() => {
    setRecentProblems(storage.getRecentProblems());
  }, []);

  const allTags = Array.from(new Set(PROBLEMS.flatMap(p => p.tags))).sort();

  const filteredProblems = PROBLEMS.filter(problem => {
    const difficultyMatch = selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;
    const tagMatch = selectedTag === 'All' || problem.tags.includes(selectedTag);
    return difficultyMatch && tagMatch;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
          >
            Coding Interview Tutor
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Master technical interviews with an AI-powered tutor that guides you through the 7-step process.
          </motion.p>
        </div>

        {/* G1: What the system can do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">What You Can Do Here</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                  <feature.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>Average session: ~55 minutes (similar to real interviews)</span>
          </div>
        </motion.div>

        {/* G12: Recent Problems */}
        {recentProblems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <History size={20} className="text-gray-400" />
              <h2 className="text-lg font-bold text-gray-900">Recently Practiced</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentProblems.slice(0, 5).map((problem) => {
                const fullProblem = PROBLEMS.find(p => p.id === problem.id);
                if (!fullProblem) return null;
                return (
                  <Link
                    key={problem.id}
                    href={`/interview/${problem.id}`}
                    className="flex-shrink-0 bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all w-48"
                  >
                    <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                      {problem.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium
                        ${fullProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          fullProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'}`}
                      >
                        {fullProblem.difficulty}
                      </span>
                      <span className="text-xs text-gray-400">
                        {problem.completedSteps.length}/7 steps
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Problem List */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Select a Problem</h2>

            <div className="flex gap-4">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Topics</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredProblems.map((problem, idx) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <Link
                  href={`/interview/${problem.id}`}
                  className="block bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                          {problem.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium
                          ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'}`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{problem.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        {problem.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ArrowRight className="text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}

            {filteredProblems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No problems found matching your filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
