'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: [
        'Personal Information: When you create an account, we collect your name, email address, and any profile information you choose to provide.',
        'Usage Data: We automatically collect information about how you use TaskMate, including features accessed, time spent in the application, and interaction patterns.',
        'Device Information: We collect information about the device and browser you use to access TaskMate, including IP address, operating system, and browser type.',
        'Time Tracking Data: As our core service, we collect and store time entries, project information, task details, and related productivity metrics.',
        'Communication Data: When you contact our support team, we may retain records of those communications to provide better service.'
      ]
    },
    {
      id: 'information-usage',
      title: 'How We Use Your Information',
      icon: FileText,
      content: [
        'Service Provision: To provide, maintain, and improve TaskMate\'s functionality and user experience.',
        'Account Management: To create and manage your account, authenticate your identity, and provide customer support.',
        'Analytics: To understand usage patterns, identify issues, and improve our platform\'s performance and features.',
        'Communication: To send you important service updates, security alerts, and respond to your inquiries.',
        'Personalization: To customize your experience and provide relevant recommendations and insights.',
        'Legal Compliance: To comply with applicable laws, regulations, and legitimate business interests.'
      ]
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing and Disclosure',
      icon: Users,
      content: [
        'Service Providers: We may share your information with trusted third-party service providers who assist us in operating TaskMate, provided they agree to keep your information confidential.',
        'Legal Requirements: We may disclose your information if required by law, court order, or other legal process.',
        'Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.',
        'Consent: We may share your information with your explicit consent for purposes not covered by this policy.',
        'We do not sell, rent, or trade your personal information to third parties for marketing purposes.'
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      icon: Lock,
      content: [
        'Encryption: All data is encrypted in transit using industry-standard TLS encryption and at rest using AES-256 encryption.',
        'Access Controls: We implement strict access controls and authentication mechanisms to protect your data from unauthorized access.',
        'Regular Audits: We conduct regular security audits and assessments to identify and address potential vulnerabilities.',
        'Infrastructure: Our data is hosted on secure, SOC 2 Type II certified cloud infrastructure with robust physical and network security measures.',
        'Incident Response: We have established procedures for detecting, responding to, and reporting security incidents.',
        'Employee Training: Our team receives regular security training and follows strict data handling protocols.'
      ]
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: Eye,
      content: [
        'Active Accounts: We retain your personal information and usage data for as long as your account is active.',
        'Account Deletion: When you delete your account, we will permanently delete your personal information within 30 days, except as required by law.',
        'Backup Data: Some information may persist in our backup systems for up to 90 days after deletion for disaster recovery purposes.',
        'Legal Obligations: We may retain certain information longer if required by law or for legitimate business interests.',
        'Anonymized Data: We may retain anonymized and aggregated data indefinitely for analytics and service improvement purposes.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Your privacy is important to us. This policy explains how TaskMate collects, uses, and protects your personal information.
          </p>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 inline-block">
            <p className="text-gray-400 mb-2">
              <strong className="text-white">Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-gray-400">
              <strong className="text-white">Effective date:</strong> January 1, 2024
            </p>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              TaskMate ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, share, and protect information about you when you use our time tracking 
              and project management platform.
            </p>
            <p className="text-gray-300 mb-4">
              By using TaskMate, you agree to the collection and use of information in accordance with this policy. 
              If you do not agree with any part of this policy, please do not use our service.
            </p>
            <p className="text-gray-300">
              This policy applies to all users of TaskMate, including free and paid accounts, across all platforms and devices.
            </p>
          </div>
        </motion.div>

        {/* Main Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.content.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Rights and Choices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Access',
                description: 'You can access and review your personal information through your account settings at any time.'
              },
              {
                title: 'Correction',
                description: 'You can update or correct your personal information directly in your account settings.'
              },
              {
                title: 'Deletion',
                description: 'You can request deletion of your account and personal data by contacting our support team.'
              },
              {
                title: 'Data Export',
                description: 'You can export your data in standard formats through our data export feature.'
              },
              {
                title: 'Opt-out',
                description: 'You can opt out of non-essential communications and data processing for marketing purposes.'
              },
              {
                title: 'Portability',
                description: 'You have the right to receive your personal data in a structured, machine-readable format.'
              }
            ].map((right, index) => (
              <div key={index} className="bg-[#111111] border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">{right.title}</h3>
                <p className="text-gray-400 text-sm">{right.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* International Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">International Users</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 mb-4">
              <strong className="text-white">GDPR Compliance:</strong> For users in the European Union, we comply with the General Data Protection Regulation (GDPR). 
              You have additional rights including the right to object to processing and the right to data portability.
            </p>
            <p className="text-gray-300 mb-4">
              <strong className="text-white">CCPA Compliance:</strong> For California residents, we comply with the California Consumer Privacy Act (CCPA). 
              You have the right to know what personal information we collect and the right to delete your information.
            </p>
            <p className="text-gray-300">
              <strong className="text-white">Data Transfers:</strong> Your information may be transferred to and processed in countries other than your own. 
              We implement appropriate safeguards to protect your data during international transfers.
            </p>
          </div>
        </motion.div>

        {/* Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
          <p className="text-gray-300 mb-4">
            TaskMate is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. 
            If we become aware that a child under 13 has provided us with personal information, we will delete such information immediately.
          </p>
          <p className="text-gray-300">
            If you are a parent or guardian and you are aware that your child has provided us with personal information, 
            please contact us so that we can take appropriate action.
          </p>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="bg-[#1a1a1a] border border-white/10 rounded-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-300 mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, 
            or other factors. We will notify you of any material changes by:
          </p>
          <div className="space-y-2 mb-4">
            {[
              'Posting the updated policy on our website',
              'Sending an email notification to registered users',
              'Displaying a prominent notice in the TaskMate application',
              'Providing at least 30 days notice for material changes'
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <p className="text-gray-300">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-300">
            Your continued use of TaskMate after any changes to this policy will constitute your acceptance of the updated policy.
          </p>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
          <p className="text-gray-300 mb-6">
            If you have any questions about this Privacy Policy, your rights, or our data practices, please contact us:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Email</h3>
              <p className="text-blue-400">privacy@taskmate.example.com</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Mailing Address</h3>
              <p className="text-gray-300">
                TaskMate Privacy Team<br />
                123 Innovation Drive<br />
                Tech Valley, CA 94025<br />
                United States
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <Link 
              href="/contact"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              Contact Support Team →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 