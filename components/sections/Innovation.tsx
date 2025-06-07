'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function Innovation() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Orange gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-orange-600/50 to-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Innovate with TimeTrackr
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Our platform is built for the next generation of developers and teams. 
            Experience cutting-edge time tracking with AI-powered insights, real-time collaboration, 
            and seamless integration across all your favorite tools and platforms.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full">
              Try TimeTrackr Studio
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
