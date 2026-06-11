"use client";

import Link from "next/link";
import { Container } from "@/components/ui";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 text-white" style={{ backgroundColor: '#85572A' }}>
      <Container size="lg">
        <div className="py-12 md:py-16">
          {/* Video - Centered and larger with lazy loading */}
          <div className="flex justify-center mb-10 md:mb-12">
            <video
              src="/footervid.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="h-48 md:h-56 lg:h-64 w-auto object-contain"
            />
          </div>

          {/* Links Grid - All visible */}
          <nav className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest border-b border-white/30 pb-2">Shop</h3>
              <Link href="/produits" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → Produits
              </Link>
              <Link href="/suivi" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → Suivi de commande
              </Link>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest border-b border-white/30 pb-2">Légal</h3>
              <Link href="/mentions-legales" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → Mentions légales
              </Link>
              <Link href="/cgv" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → CGV
              </Link>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest border-b border-white/30 pb-2">Contact</h3>
              <Link href="/contact" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → Nous contacter
              </Link>
            </div>
          </nav>

          {/* Bottom Section - Copyright */}
          <div className="text-center pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm font-light tracking-wide">
              &copy; {currentYear} Nuage. Tous droits réservés.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
