'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    {
      question: 'How does TimeTrackr help improve productivity?',
      answer: 'TimeTrackr offers detailed time tracking and analytics that help you understand where your team\'s time is spent. By identifying time-consuming tasks and processes, you can optimize workflows, reallocate resources, and focus on high-priority work.'
    },
    {
      question: 'Can I track time for different projects and clients?',
      answer: 'Yes! TimeTrackr allows you to organize your work by creating multiple projects and clients. You can track time separately for each project, generate client-specific reports, and manage your team\'s workload efficiently across different projects.'
    },
    {
      question: 'Does TimeTrackr work on mobile devices?',
      answer: 'Absolutely. TimeTrackr is fully responsive and works on all devices including smartphones and tablets. We also offer dedicated mobile apps for iOS and Android that allow you to track time on the go with features like offline tracking and GPS tracking for field work.'
    },
    {
      question: 'How does the pricing work?',
      answer: 'TimeTrackr offers several pricing tiers based on team size and feature requirements. We have a free plan for individuals and small teams, and paid plans starting at $8 per user per month. All paid plans come with a 14-day free trial, and you can cancel anytime.'
    },
    {
      question: 'Can I import data from other time tracking tools?',
      answer: 'Yes, TimeTrackr supports importing data from popular time tracking tools like Toggl, Harvest, and Clockify. Our import wizards help you migrate your projects, clients, and historical time data seamlessly.'
    },
    {
      question: 'Is my data secure with TimeTrackr?',
      answer: 'We take security seriously. TimeTrackr uses industry-standard encryption for all data, both in transit and at rest. We are GDPR compliant, implement regular security audits, and maintain a strict privacy policy to ensure your data remains private and secure.'
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24">
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
              Frequently Asked 
              <span className="bg-gradient-to-r from-white to-white/70 text-transparent bg-clip-text"> Questions</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Find answers to common questions about TimeTrackr and how it can help your team.
            </p>
          </motion.div>
        </div>

        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-4"
            >
              <div 
                className={`border ${openIndex === index ? 'border-white/30 bg-[#1a1a1a]' : 'border-white/10 bg-[#131313]'} rounded-lg transition-all duration-300`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex items-center justify-between w-full px-6 py-4 text-left focus:outline-none"
                >
                  <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                  <div className={`flex-shrink-0 ml-4 transition-transform duration-300 ${openIndex === index ? 'rotate-0' : 'rotate-0'}`}>
                    {openIndex === index ? (
                      <Minus className="h-5 w-5 text-white" />
                    ) : (
                      <Plus className="h-5 w-5 text-white" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-400">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-3">Still have questions?</p>
          <a 
            href="/contact" 
            className="text-white font-medium hover:underline"
          >
            Contact our support team
          </a>
        </motion.div>
      </div>
    </section>
  );
} 