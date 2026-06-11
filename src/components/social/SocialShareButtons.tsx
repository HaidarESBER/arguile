'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

/**
 * SocialShareButtons component
 *
 * Renders share buttons for social media platforms with:
 * - Native Web Share API support (mobile)
 * - Fallback to window.open for desktop
 * - Icon-only design with tooltips
 * - Share success feedback
 * - Analytics tracking
 *
 * Platforms: Facebook, Twitter/X, WhatsApp, LinkedIn, Copy Link
 */

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'floating' | 'inline';
}

export function SocialShareButtons({
  url,
  title,
  description = '',
  variant = 'inline'
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Check if Web Share API is available (primarily mobile)
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const shareText = description || title;
  const fullUrl = url.startsWith('http') ? url : `https://nuage.fr${url}`;

  /**
   * Handle native share (Web Share API)
   */
  const handleNativeShare = async () => {
    if (!canShare) return;

    try {
      await navigator.share({
        title,
        text: shareText,
        url: fullUrl,
      });

      // Track successful share
      trackEvent('share', {
        platform: 'native',
        url: fullUrl,
        title,
      });
    } catch (error) {
      // User cancelled or share failed - silent failure
      if ((error as Error).name !== 'AbortError') {
        console.warn('Share failed:', error);
      }
    }
  };

  /**
   * Handle platform-specific share
   */
  const handleShare = (platform: string, shareUrl: string) => {
    // Open share dialog in new window
    window.open(
      shareUrl,
      'share-dialog',
      'width=600,height=400,resizable=yes,scrollbars=yes'
    );

    // Track share event
    trackEvent('share', {
      platform,
      url: fullUrl,
      title,
    });
  };

  /**
   * Copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);

      // Track copy event
      trackEvent('share', {
        platform: 'copy_link',
        url: fullUrl,
        title,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  /**
   * Generate platform-specific share URLs
   */
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
  };

  const buttons = [
    {
      platform: 'facebook',
      label: 'Partager sur Facebook',
      icon: Facebook,
      url: shareUrls.facebook,
      color: 'hover:text-[#1877F2]',
    },
    {
      platform: 'twitter',
      label: 'Partager sur X (Twitter)',
      icon: Twitter,
      url: shareUrls.twitter,
      color: 'hover:text-[#1DA1F2]',
    },
    {
      platform: 'whatsapp',
      label: 'Partager sur WhatsApp',
      icon: MessageCircle,
      url: shareUrls.whatsapp,
      color: 'hover:text-[#25D366]',
    },
    {
      platform: 'linkedin',
      label: 'Partager sur LinkedIn',
      icon: Linkedin,
      url: shareUrls.linkedin,
      color: 'hover:text-[#0A66C2]',
    },
  ];

  const containerClasses = variant === 'floating'
    ? 'fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40'
    : 'flex items-center gap-3 flex-wrap';

  const buttonBaseClasses = 'group relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-background-secondary hover:border-accent transition-all duration-300 bg-background-card hover:bg-accent/5';

  return (
    <div className={containerClasses}>
      {/* Native share button (mobile only) */}
      {canShare && (
        <button
          onClick={handleNativeShare}
          className={`${buttonBaseClasses} text-primary/60 hover:text-accent`}
          aria-label="Partager"
          title="Partager"
        >
          <Share2 className="w-5 h-5" />
          <span className="absolute right-full mr-2 px-2 py-1 bg-primary text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Partager
          </span>
        </button>
      )}

      {/* Platform-specific buttons */}
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button
            key={button.platform}
            onClick={() => handleShare(button.platform, button.url)}
            className={`${buttonBaseClasses} text-primary/60 ${button.color}`}
            aria-label={button.label}
            title={button.label}
          >
            <Icon className="w-5 h-5" />
            <span className="absolute right-full mr-2 px-2 py-1 bg-primary text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {button.label}
            </span>
          </button>
        );
      })}

      {/* Copy link button */}
      <button
        onClick={handleCopyLink}
        className={`${buttonBaseClasses} ${copied ? 'text-accent border-accent' : 'text-primary/60 hover:text-accent'}`}
        aria-label="Copier le lien"
        title={copied ? 'Lien copié!' : 'Copier le lien'}
      >
        {copied ? (
          <Check className="w-5 h-5" />
        ) : (
          <LinkIcon className="w-5 h-5" />
        )}
        <span className="absolute right-full mr-2 px-2 py-1 bg-primary text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {copied ? 'Lien copié!' : 'Copier le lien'}
        </span>
      </button>
    </div>
  );
}
