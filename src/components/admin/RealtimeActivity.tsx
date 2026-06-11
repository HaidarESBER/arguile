import { ServerAnalyticsEvent } from '@/types/analytics';

interface RealtimeActivityProps {
  events: ServerAnalyticsEvent[];
}

export default function RealtimeActivity({ events }: RealtimeActivityProps) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-secondary rounded-lg p-6 border border-primary/10">
        <p className="text-center text-primary/60">Aucune activité récente</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-lg border border-primary/10 max-h-[400px] overflow-y-auto">
      {events.slice(0, 10).map((event, index) => (
        <EventRow key={event.id} event={event} isEven={index % 2 === 0} />
      ))}
    </div>
  );
}

function EventRow({ event, isEven }: { event: ServerAnalyticsEvent; isEven: boolean }) {
  const { icon, description } = formatEvent(event);
  const userIndicator = event.user_id ? '👤 Utilisateur' : '👻 Visiteur';
  const timestamp = formatTimestamp(event.created_at);

  return (
    <div
      className={`p-4 flex items-start gap-3 border-b border-primary/10 last:border-b-0 ${
        isEven ? 'bg-primary/5' : ''
      }`}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-primary">{description}</p>
        <p className="text-xs text-primary/60 mt-1">{userIndicator}</p>
      </div>
      <time className="text-xs text-primary/50 font-mono flex-shrink-0 whitespace-nowrap">
        {timestamp}
      </time>
    </div>
  );
}

function formatEvent(event: ServerAnalyticsEvent): { icon: string; description: string } {
  const { event_type, event_data, url } = event;

  switch (event_type) {
    case 'page_view':
      const pathname = url ? new URL(url, 'https://example.com').pathname : '/';
      return { icon: '📄', description: `Page vue: ${pathname}` };

    case 'product_view':
      const productName = event_data?.productName || event_data?.productId || 'Produit';
      return { icon: '👁️', description: `Produit vu: ${productName}` };

    case 'add_to_cart':
      return {
        icon: '🛒',
        description: `Ajout panier: ${event_data?.productName || 'Produit'}`,
      };

    case 'remove_from_cart':
      return {
        icon: '❌',
        description: `Retrait panier: ${event_data?.productName || 'Produit'}`,
      };

    case 'checkout_started':
      return { icon: '💳', description: 'Paiement démarré' };

    case 'purchase':
      const total = event_data?.total ? `${(event_data.total / 100).toFixed(2)}€` : '';
      return { icon: '✅', description: `Achat${total ? ': ' + total : ''}` };

    case 'search':
      return { icon: '🔍', description: `Recherche: ${event_data?.query || ''}` };

    case 'wishlist_add':
      return {
        icon: '❤️',
        description: `Ajout favoris: ${event_data?.productName || 'Produit'}`,
      };

    default:
      return { icon: '📊', description: `Événement: ${event_type}` };
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Less than 1 hour: show minutes
  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? "il y a 1 minute" : `il y a ${diffMinutes} minutes`;
  }

  // Less than 24 hours: show hours
  if (diffHours < 24) {
    return diffHours === 1 ? "il y a 1 heure" : `il y a ${diffHours} heures`;
  }

  // Less than 7 days: show days
  if (diffDays < 7) {
    return diffDays === 1 ? "il y a 1 jour" : `il y a ${diffDays} jours`;
  }

  // More than 7 days: show absolute date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
