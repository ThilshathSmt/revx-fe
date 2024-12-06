"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="fixed top-4 left-4 flex items-center gap-2 text-primary">
      <LayoutDashboard className="h-6 w-6" />
      <span className="font-bold text-lg hidden sm:inline-block">Dashboard</span>
    </Link>
  );
}