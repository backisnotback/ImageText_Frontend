"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-primary text-white"
        : "text-muted hover:text-foreground hover:bg-border/50"
    }`;

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="w-7 h-7 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-lg font-bold text-foreground">
              ImageText Reader
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className={linkClass("/")}>
              Extract
            </Link>
            <Link href="/history" className={linkClass("/history")}>
              History
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
