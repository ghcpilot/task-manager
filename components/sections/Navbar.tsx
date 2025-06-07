'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-200 ${
        isScrolled ? 'bg-[#111111]/90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 text-transparent bg-clip-text">
              TimeTrackr
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="#live-data">Live Data</NavLink>
            <NavLink href="#how-it-works">How it Works</NavLink>
            <NavLink href="#feedback">GIve Feedback</NavLink>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="default" size="sm">
                Sign up free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-[#1a1a1a] border-t border-white/10"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4 mb-6">
              <MobileNavLink href="#live-data" onClick={() => setIsMobileMenuOpen(false)}>
                Live Data
              </MobileNavLink>
              <MobileNavLink href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
                How it Works
              </MobileNavLink>
              <MobileNavLink href="#feedback" onClick={() => setIsMobileMenuOpen(false)}>
                Give Feedback
              </MobileNavLink>
            </nav>
            <div className="flex flex-col space-y-3">
              <Link href="/auth/login" className="w-full">
                <Button variant="ghost" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register" className="w-full">
                <Button variant="default" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign up free
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-sm text-gray-300 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ 
  href, 
  onClick, 
  children 
}: { 
  href: string; 
  onClick: () => void;
  children: React.ReactNode 
}) {
  return (
    <Link 
      href={href} 
      className="text-base text-gray-300 hover:text-white transition-colors py-2"
      onClick={onClick}
    >
      {children}
    </Link>
  );
} 