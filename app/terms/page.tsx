'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#111111]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
              <p className="text-gray-300 mb-4">
                Welcome to TimeMate ("we," "our," or "us"). By accessing or using our service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Accounts</h2>
              <p className="text-gray-300 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <p className="text-gray-300 mb-4">
                You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Intellectual Property</h2>
              <p className="text-gray-300 mb-4">
                The service and its original content, features, and functionality are and will remain the exclusive property of TimeMate and its licensors. The service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of TimeMate.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Links To Other Web Sites</h2>
              <p className="text-gray-300 mb-4">
                Our service may contain links to third-party websites or services that are not owned or controlled by TimeMate.
              </p>
              <p className="text-gray-300 mb-4">
                TimeMate has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that TimeMate shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Termination</h2>
              <p className="text-gray-300 mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-gray-300 mb-4">
                Upon termination, your right to use the service will immediately cease. If you wish to terminate your account, you may simply discontinue using the service.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Limitation Of Liability</h2>
              <p className="text-gray-300 mb-4">
                In no event shall TimeMate, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Changes</h2>
              <p className="text-gray-300 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Contact Us</h2>
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms, please contact us at support@timemate.example.com.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 