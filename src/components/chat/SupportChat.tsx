"use client";

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORT_EMAIL } from '@/lib/support';

interface ProductCard {
  slug: string;
  name: string;
  price: number;
  image: string;
  url: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: ProductCard[];
}

export function SupportChat() {
  const pathname = usePathname();
  const isProductDetailPage =
    pathname.startsWith("/produits/") && pathname !== "/produits";
  const [isOpen, setIsOpen] = useState(false);
  // The launcher sits bottom-left, exactly where the cookie-consent card
  // renders on mobile. Stay hidden until the visitor has made their cookie
  // choice (read once on mount + custom event for the no-reload path).
  const [consentDecided, setConsentDecided] = useState(false);

  useEffect(() => {
    const check = () =>
      // Reads localStorage (client-only); deferred to an effect for SSR hydration safety
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConsentDecided(localStorage.getItem("nuage_cookie_consent") !== null);
    check();
    window.addEventListener("nuage:cookie-consent", check);
    return () => window.removeEventListener("nuage:cookie-consent", check);
  }, []);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Salut habibi ! 👋 Comment je peux t'aider ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [showEscalation, setShowEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          products: data.products || [],
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Show escalation option if needed or if error
        if (data.escalate || data.error) {
          setShowEscalation(true);
        }
      } else {
        throw new Error('No message in response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Oups, j'ai un petit problème technique 😅 Réessaie dans quelques secondes ou contacte ${SUPPORT_EMAIL}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { label: "🔥 Quelle chicha choisir ?", message: "Je cherche une chicha, peux-tu me conseiller ?" },
    { label: "💨 Quel bol recommandes-tu ?", message: "Quel est le meilleur bol pour chicha ?" },
    { label: "✨ Conseils débutant", message: "Je débute avec les chichas, des conseils ?" },
    { label: "🧹 Comment nettoyer ?", message: "Comment bien nettoyer ma chicha ?" },
  ];

  return (
    <>
      {/* Chat Toggle Button — deliberately a plain button with NO mount
          animation: an entrance starting at scale-0 leaves the launcher
          permanently invisible if the animation ever fails to run. CSS
          transitions handle hover/active feedback instead. */}
      {!isOpen && consentDecided && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir le chat d'assistance"
          style={{ backgroundColor: '#85572A' }}
          className={`fixed left-4 sm:left-6 z-[90] w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg shadow-black/50 flex items-center justify-center text-white hover:shadow-xl hover:scale-105 active:scale-95 transition-all ${
            isProductDetailPage
              ? // Above the product page's sticky buy bar on mobile;
                // desktop has no bottom bar, normal offset there
                "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6"
              : "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-6"
          }`}
        >
          <span className="material-icons text-2xl sm:text-3xl" aria-hidden="true">chat</span>
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
            1
          </span>
        </button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:left-4 z-50 w-full h-full sm:w-96 sm:h-[600px] sm:max-h-[85vh] bg-white border-0 sm:border sm:border-gray-300 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div style={{ backgroundColor: '#85572A' }} className="p-3 sm:p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden bg-white">
                  <img src="/cbot.jpeg" alt="Habibi Chichbot" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">Habibi Chichbot</h3>
                  <p className="text-[10px] sm:text-xs text-white/70">En ligne • Répond en ~5 sec</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 active:bg-white/30 rounded-full p-2 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              >
                <span className="material-icons text-xl sm:text-2xl">close</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#F5E6D3' }}>
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'text-white border border-brown-600'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}
                      style={msg.role === 'user' ? { backgroundColor: '#85572A' } : undefined}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] mt-1 opacity-60">
                        {msg.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="flex justify-start mt-2 ml-0 sm:ml-2">
                      <div className="flex flex-col gap-2 w-full max-w-full sm:max-w-[80%]">
                        {msg.products.map((product) => (
                          <a
                            key={product.slug}
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow active:scale-95"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2">
                                {product.name}
                              </p>
                              <p className="text-sm sm:text-base font-bold mt-1" style={{ color: '#85572A' }}>
                                {(product.price / 100).toFixed(2)}€
                              </p>
                            </div>
                            <span className="material-icons text-gray-400 text-lg sm:text-xl flex-shrink-0">arrow_forward</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#85572A', animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#85572A', animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#85572A', animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Escalation option */}
              {showEscalation && (
                <div className="border rounded-lg p-3 bg-orange-50" style={{ borderColor: '#85572A' }}>
                  <p className="text-xs text-gray-700 mb-2">
                    💡 Besoin d&apos;aide personnalisée ?
                  </p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    style={{ backgroundColor: '#85572A' }}
                    className="text-xs text-white px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity inline-block"
                  >
                    Contacter le support
                  </a>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (only show at start) */}
            {messages.length <= 2 && (
              <div className="p-3 sm:p-4 border-t border-gray-200" style={{ backgroundColor: '#F5E6D3' }}>
                <p className="text-xs text-gray-600 mb-2 font-medium">Questions rapides:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(action.message);
                        setTimeout(() => sendMessage(), 100);
                      }}
                      className="text-xs sm:text-[10px] bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 sm:px-2 sm:py-1.5 text-left transition-colors text-gray-700 min-h-[44px] sm:min-h-0 flex items-center"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white safe-area-bottom">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écris ton message..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-3 sm:py-2 text-sm sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50"
                  style={{ '--tw-ring-color': '#85572A' } as React.CSSProperties}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  style={{ backgroundColor: '#85572A' }}
                  className="text-white rounded-full p-3 sm:p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                >
                  <span className="material-icons text-xl">send</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center hidden sm:block">
                Propulsé par IA • Réponses en temps réel
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
