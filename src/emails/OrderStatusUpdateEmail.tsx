import { Heading, Link, Section, Text, Hr } from "@react-email/components";
import { Order, OrderStatus } from "@/types/order";
import {
  EmailLayout,
  SITE_URL,
  h1,
  h2,
  text,
  section,
  hr,
  infoPill,
  itemText,
  ctaSection,
  ctaButton,
} from "./components/EmailLayout";

interface OrderStatusUpdateEmailProps {
  order: Order;
  newStatus: OrderStatus;
  oldStatus: OrderStatus;
}

interface StatusContent {
  previewText: string;
  heading: string;
  bodyText: string;
  showItems: boolean;
  showTrackingLink: boolean;
}

/**
 * Returns status-specific content for the email template.
 */
function getStatusContent(
  newStatus: OrderStatus,
  orderNumber: string
): StatusContent {
  switch (newStatus) {
    case "confirmed":
      return {
        previewText: `Votre commande ${orderNumber} a été confirmée - Nuage`,
        heading: "Votre commande a été confirmée !",
        bodyText:
          "Nous avons bien reçu votre commande et nous la préparons avec soin. Vous recevrez une notification dès que vos articles seront expédiés.",
        showItems: true,
        showTrackingLink: false,
      };
    case "processing":
      return {
        previewText: `Votre commande ${orderNumber} est en préparation - Nuage`,
        heading: "Votre commande est en préparation",
        bodyText:
          "Vos articles sont en cours de préparation par notre équipe. Nous mettons tout en oeuvre pour que votre commande soit prête dans les meilleurs délais.",
        showItems: false,
        showTrackingLink: false,
      };
    case "delivered":
      return {
        previewText: `Votre commande ${orderNumber} a été livrée - Nuage`,
        heading: "Votre commande a été livrée !",
        bodyText:
          "Votre commande a été livrée avec succès. Nous espérons que vous apprécierez vos articles.",
        showItems: true,
        showTrackingLink: true,
      };
    case "cancelled":
      return {
        previewText: `Votre commande ${orderNumber} a été annulée - Nuage`,
        heading: "Votre commande a été annulée",
        bodyText:
          "Nous sommes désolés de vous informer que votre commande a été annulée. Si vous avez des questions, n'hésitez pas à nous contacter.",
        showItems: false,
        showTrackingLink: false,
      };
    default:
      return {
        previewText: `Mise à jour de votre commande ${orderNumber} - Nuage`,
        heading: "Mise à jour de votre commande",
        bodyText: "Le statut de votre commande a été mis à jour.",
        showItems: false,
        showTrackingLink: false,
      };
  }
}

/**
 * Order Status Update Email — confirmed / processing / delivered / cancelled.
 * For "shipped", use ShippingNotificationEmail instead.
 */
export function OrderStatusUpdateEmail({
  order,
  newStatus,
}: OrderStatusUpdateEmailProps) {
  const { orderNumber, items } = order;
  const content = getStatusContent(newStatus, orderNumber);

  return (
    <EmailLayout preview={content.previewText}>
      <Section style={section}>
        <Heading style={h1}>{content.heading}</Heading>
        <Text style={text}>{content.bodyText}</Text>
        <Text style={infoPill}>
          Numéro de commande : <strong>{orderNumber}</strong>
        </Text>
      </Section>

      {content.showItems && items.length > 0 && (
        <>
          <Hr style={hr} />
          <Section style={section}>
            <Heading style={h2}>
              {newStatus === "delivered"
                ? "Articles livrés"
                : "Récapitulatif de votre commande"}
            </Heading>
            {items.map((item, index) => (
              <Text key={index} style={itemText}>
                {item.productName} × {item.quantity} —{" "}
                {((item.price * item.quantity) / 100).toFixed(2)} €
              </Text>
            ))}
          </Section>
        </>
      )}

      {content.showTrackingLink && (
        <>
          <Hr style={hr} />
          <Section style={section}>
            <Heading style={h2}>Suivi de commande</Heading>
            <Text style={text}>
              Consultez le détail de votre commande et son suivi :
            </Text>
            <Section style={ctaSection}>
              <Link
                href={`${SITE_URL}/suivi/${orderNumber}?email=${encodeURIComponent(order.shippingAddress.email)}`}
                style={ctaButton}
              >
                Voir ma commande
              </Link>
            </Section>
          </Section>
        </>
      )}

      {newStatus === "cancelled" && (
        <>
          <Hr style={hr} />
          <Section style={section}>
            <Text style={text}>
              Si cette annulation ne correspond pas à votre demande ou si vous
              souhaitez passer une nouvelle commande, n&apos;hésitez pas à nous
              contacter en répondant à cet email.
            </Text>
          </Section>
        </>
      )}
    </EmailLayout>
  );
}

export default OrderStatusUpdateEmail;
