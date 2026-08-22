import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

const footerLinks = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Risk Demo', href: '#simulator' },
  { label: 'Dashboard', href: '/dashboard' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 border border-primary/30">
                <ShieldAlert size={14} className="text-primary" />
              </div>
              <span className="font-bold text-sm text-foreground">ForeSight</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">
              Predict. Explain. Act.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 flex-wrap justify-center">
            {footerLinks?.map((link) => (
              <Link
                key={link?.label}
                href={link?.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link?.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 ForeSight
          </p>
        </div>
      </div>
    </footer>
  );
}