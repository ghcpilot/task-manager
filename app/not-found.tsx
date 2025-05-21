import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#111111] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="w-full flex justify-center">
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-[10rem] font-bold text-[#1e1e1e]"
            >
              404
            </motion.div>
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="text-[10rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff]/30 to-[#ffffff]/10">
                404
              </div>
            </motion.div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mt-6 mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md py-2.5 px-4 font-medium transition-colors bg-[#ffffff] hover:bg-[#ffffff]/90 text-[#111111]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Home className={`h-4 w-4 mr-2 ${isHovering ? 'animate-bounce' : ''}`} />
            Go Home
          </Link>
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md py-2.5 px-4 font-medium transition-colors border border-[#2e2e2e] bg-[#1e1e1e] hover:bg-[#2e2e2e] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 