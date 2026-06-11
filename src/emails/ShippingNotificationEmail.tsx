import { Heading, Link, Section, Text, Hr } from "@react-email/components";
import { Order } from "@/types/order";
import { SUPPORT_EMAIL } from "@/lib/support";
import {
  EmailLayout,
  h1,
  h2,
  text,
  section,
  hr,
  infoPill,
  itemText,
  addressText,
  ctaSection,
  ctaButton,
} from "./components/EmailLayout";

interface ShippingNotificationEmailProps {
  order: Order;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

/**
 * Shipping Notification Email — sent when the order ships, with tracking.
 */
export function ShippingNotificationEmail({
  order,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
}: ShippingNotificationEmailProps) {
  const { orderNumber, items, shippingAddress } = order;

  return (
    <EmailLayout preview={`Votre commande ${orderNumber} a été expédiée - Nuage`}>
      <Section style={section}>
        <Heading style={h1}>Votre commande est en route ! 📦</Heading>
        <Text style={text}>
          Bonne nouvelle ! Votre commande a été expédiée et est en chemin vers
          vous.
        </Text>
        <Text style={infoPill}>
          Numéro de commande : <strong>{orderNumber}</strong>
        </Text>
      </Section>

      {trackingNumber && (
        <>
          <Hr style={hr} />
          <Section style={section}>
            <Heading style={h2}>Informations de suivi</Heading>
            <Text style={text}>
              Numéro de suivi : <strong>{trackingNumber}</strong>
            </Text>
            {estimatedDelivery && (
              <Text style={text}>
                Livraison estimée : <strong>{estimatedDelivery}</strong>
              </Text>
            )}
            {trackingUrl && (
              <Section style={ctaSection}>
                <Link href={trackingUrl} style={ctaButton}>
                  Suivre mon colis
                </Link>
              </Section>
            )}
          </Section>
        </>
      )}

      <Hr style={hr} />

      <Section style={section}>
        <Heading style={h2}>Articles expédiés</Heading>
        {items.map((item, index) => (
          <Text key={index} style={itemText}>
            • {item.productName} × {item.quantity}
          </Text>
        ))}
      </Section>

      <Hr style={hr} />

      <Section style={section}>
        <Heading style={h2}>Adresse de livraison</Heading>
        <Text style={addressText}>
          {shippingAddress.firstName} {shippingAddress.lastName}
          <br />
          {shippingAddress.address}
          <br />
          {shippingAddress.addressLine2 && (
            <>
              {shippingAddress.addressLine2}
              <br />
            </>
          )}
          {shippingAddress.postalCode} {shippingAddress.city}
          <br />
          {shippingAddress.country}
        </Text>
      </Section>

      <Hr style={hr} />

      <Section style={section}>
        <Text style={text}>
          <strong>Besoin d&apos;aide ?</strong>
          <br />
          Notre équipe est là pour vous. Répondez simplement à cet email ou
          contactez-nous à {SUPPORT_EMAIL}
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default ShippingNotificationEmail;
