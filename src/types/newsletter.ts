/**
 * Newsletter subscriber type definitions
 */

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  source: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
  createdAt: string;
}

export type SubscribeResult = {
  success: boolean;
  alreadySubscribed?: boolean;
  error?: string;
};
