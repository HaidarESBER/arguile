import { Button, Heading, Section, Text, Hr } from "@react-email/components";
import { Order } from "@/types/order";
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
  totalBoldText,
  ctaSection,
  ctaButton,
} from "./components/EmailLayout";

interface AbandonedCartEmailProps {
  order: Order;
  unsubscribeUrl: string;
}

/**
 * Abandoned Cart Recovery Email — sent when a checkout session expires.
 */
export function AbandonedCartEmail({
  order,
  unsubscribeUrl,
}: AbandonedCartEmailProps) {
  const { items, subtotal, shippingAddress } = order;
  const firstName = shippingAddress?.firstName || "";

  return (
    <EmailLayout
      preview="Votre panier vous attend - Nuage"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={section}>
        <Heading style={h1}>Votre panier vous attend</Heading>
        <Text style={text}>
          {firstName ? `Bonjour ${firstName}, ` : "Bonjour, "}
          nous avons remarqué que vous n&apos;avez pas finalisé votre commande.
          Vos articles sont toujours disponibles et vous attendent !
        </Text>
      </Section>

      <Hr style={hr} />

      <Section style={section}>
        <Heading style={h2}>Vos articles</Heading>
        {items.map((item, index) => (
          <Text key={index} style={itemText}>
            {item.productName} × {item.quantity} —{" "}
            {((item.price * item.quantity) / 100).toFixed(2)} €
          </Text>
        ))}
        <Text style={totalBoldText}>
          Sous-total : {(subtotal / 100).toFixed(2)} €
        </Text>
      </Section>

      <Hr style={hr} />

      <Section style={section}>
        <Text style={infoPill}>
          Utilisez le code <strong>BIENVENUE10</strong> pour 10% de remise sur
          votre commande !
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button href={`${SITE_URL}/panier`} style={ctaButton}>
          Reprendre mes achats
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default AbandonedCartEmail;
