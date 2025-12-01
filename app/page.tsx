"use client";

import Link from 'next/link';
import { PROBLEMS } from '@/lib/problems';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
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

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Problem</h2>
          <div className="grid gap-4">
            {PROBLEMS.map((problem, idx) => (
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
                    </div>
                    <ArrowRight className="text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
