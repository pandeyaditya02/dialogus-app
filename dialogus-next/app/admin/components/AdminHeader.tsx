"use client";

import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();

  // Don't show the full header/logout on the login page
  const isLoginPage = pathname === "/admin/login";

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      alert("Failed to sign out. Please try again.");
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-900">Dialogus</span>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500">Admin</span>
      </div>

      {!isLoginPage && (
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
        >
          Sign out
        </button>
      )}
    </header>
  );
}
