"use client";

import Link from "next/link";
import { Menu, X, MessageSquare, Layers, Tag } from "lucide-react";
import { useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-background border-b border-primary/20 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-heading font-semibold">Nuage Admin</h1>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 transition-colors text-background"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6 text-background" />
            ) : (
              <Menu className="w-6 h-6 text-background" />
            )}
          </button>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[57px] lg:top-0
            w-64 h-[calc(100vh-57px)] lg:h-[calc(100vh-4rem)]
            bg-secondary border-r border-primary/10
            transform transition-transform duration-300 ease-in-out z-50
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
          `}
        >
          <nav className="p-4 space-y-2">
            <Link
              href="/admin"
              onClick={() => setIsSidebarOpen(false)}
              className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/produits"
              onClick={() => setIsSidebarOpen(false)}
              className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
            >
              Produits
            </Link>
            <Link
              href="/admin/commandes"
              onClick={() => setIsSidebarOpen(false)}
              className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
            >
              Commandes
            </Link>
            <Link
              href="/admin/reviews"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Avis clients
            </Link>
            <Link
              href="/admin/pipeline"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
            >
              <Layers className="w-4 h-4" />
              Pipeline
            </Link>
            <Link
              href="/admin/promotions"
              onClick={() => setIsSidebarOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
            >
              <Tag className="w-4 h-4" />
              Promotions
            </Link>

            {/* Analytics Section */}
            <div className="pt-4 mt-4 border-t border-primary/10">
              <p className="text-xs font-semibold text-primary/50 uppercase mb-2 px-4">
                Analytics
              </p>
              <Link
                href="/admin"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/admin/analytics/revenue"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
              >
                💰 Revenus
              </Link>
              <Link
                href="/admin/analytics/products"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
              >
                📦 Produits
              </Link>
              <Link
                href="/admin/analytics/sales"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
              >
                📈 Ventes
              </Link>
              <Link
                href="/admin/analytics/inventory"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
              >
                📦 Stocks
              </Link>
              <Link
                href="/admin/analytics/orders"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
              >
                📋 Commandes
              </Link>
              <Link
                href="/admin/analytics/customers"
                onClick={() => setIsSidebarOpen(false)}
                className="block px-4 py-2 rounded-md text-primary hover:bg-accent/20 transition-colors"
              >
                👥 Clients
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full lg:w-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
