'use client';

import { motion } from 'framer-motion';
import { Clock, Users, BarChart2, CheckCircle2 } from 'lucide-react';

export default function Stats() {
  const stats = [
    {
      icon: <Clock />,
      value: '42%',
      label: 'Time saved on manual tracking',
      description: 'Teams report saving up to 42% of time previously spent on manual time tracking processes.'
    },
    {
      icon: <Users />,
      value: '5000+',
      label: 'Teams using TimeTrackr',
      description: 'From small startups to large enterprises, thousands of teams trust TimeTrackr daily.'
    },
    {
      icon: <BarChart2 />,
      value: '38%',
      label: 'Productivity improvement',
      description: 'Our clients report an average productivity increase of 38% after implementing TimeTrackr.'
    },
    {
      icon: <CheckCircle2 />,
      value: '99.9%',
      label: 'Uptime reliability',
      description: 'Our platform maintains enterprise-grade reliability with 99.9% uptime guarantee.'
    }
  ];

  return (
    <section className="py-16 md:py-24 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by teams 
              <span className="bg-gradient-to-r from-white to-white/70 text-transparent bg-clip-text"> worldwide</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              TimeTrackr helps thousands of teams improve productivity and streamline workflow management.
            </p>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4 p-3 bg-white/10 rounded-lg inline-block w-12 h-12 flex items-center justify-center">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-lg font-medium text-white/90 mb-3">
                  {stat.label}
                </p>
                <p className="text-gray-400 text-sm mt-auto">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logos of companies (placeholder) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mt-20 flex flex-wrap justify-center items-center gap-8 md:gap-12"
        >
          <div className="text-white/30 text-xl font-bold">COMPANY 1</div>
          <div className="text-white/30 text-xl font-bold">COMPANY 2</div>
          <div className="text-white/30 text-xl font-bold">COMPANY 3</div>
          <div className="text-white/30 text-xl font-bold">COMPANY 4</div>
          <div className="text-white/30 text-xl font-bold">COMPANY 5</div>
          <div className="text-white/30 text-xl font-bold">COMPANY 6</div>
        </motion.div>
      </div>
    </section>
  );
} 