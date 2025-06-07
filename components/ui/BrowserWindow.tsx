'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Minimize2, Maximize2, X } from 'lucide-react';

interface BrowserWindowProps {
  title?: string;
  url?: string;
  children: React.ReactNode;
  className?: string;
}

export default function BrowserWindow({ 
  title = "TaskMate Dashboard", 
  url = "https://taskmate.app/dashboard",
  children,
  className = ""
}: BrowserWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`bg-[#1a1a1a] border border-white/20 rounded-xl overflow-hidden shadow-2xl ${className}`}
    >
      {/* Browser Header */}
      <div className="bg-[#2a2a2a] border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1 flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-300 text-sm font-mono">{url}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="bg-[#111111] p-6">
        {children}
      </div>
    </motion.div>
  );
}

// Code Display Component
export function CodeDisplay({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-lg p-4 font-mono text-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
        <div className="text-gray-400 text-xs">stats.js</div>
      </div>
      <div className="text-gray-300">
        {children}
      </div>
    </div>
  );
}

// Stats Code Component
export function StatsCode({ stats }: { stats: Array<{label: string, value: string, growth: string}> }) {
  return (
    <CodeDisplay>
      <div className="space-y-2">
        <div className="text-blue-400">const</div> <div className="text-white inline">dashboardStats</div> <div className="text-blue-400 inline">=</div> <div className="text-yellow-400 inline">{'{'}</div>
        {stats.map((stat, index) => (
          <div key={index} className="ml-4">
            <span className="text-green-400">{stat.label.toLowerCase().replace(/\s+/g, '')}</span>: <span className="text-orange-400">'{stat.value}'</span>,
          </div>
        ))}
        <div className="ml-4">
          <span className="text-green-400">lastUpdated</span>: <span className="text-orange-400">'2025-06-05T08:17:21.863Z'</span>
        </div>
        <div className="text-yellow-400">{'}'}</div>
        
        <div className="mt-4">
          <div className="text-gray-500">// Real-time updates</div>
          <div className="text-blue-400">setInterval</div><span className="text-white">(</span><span className="text-blue-400">() =&gt;</span> <span className="text-yellow-400">{'{'}</span>
          <div className="ml-4 text-green-400">updateStats(dashboardStats)</div>
          <div className="text-yellow-400">{'}'}</div><span className="text-white">, </span><span className="text-orange-400">5000</span><span className="text-white">)</span>
        </div>
      </div>
    </CodeDisplay>
  );
} 