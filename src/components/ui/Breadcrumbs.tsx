'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs navigation component.
 * Provides hierarchical navigation for better user orientation.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="flex items-center gap-1 text-gold/70 hover:text-gold transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gold/40" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-gold/70 hover:text-gold transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}



