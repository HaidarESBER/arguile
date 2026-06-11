import { Heading, Section, Text, Hr } from "@react-email/components";
import { Order } from "@/types/order";
import {
  EmailLayout,
  h1,
  h2,
  text,
  section,
  hr,
  infoPill,
  itemText,
  totalRowText,
  totalBoldText,
  addressText,
} from "./components/EmailLayout";

interface OrderConfirmationEmailProps {
  order: Order;
}

/**
 * Order Confirmation Email — sent after successful payment.
 */
export function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  const { orderNumber, items, subtotal, shipping, total, shippingAddress } = order;

  return (
    <EmailLayout preview={`Votre commande ${orderNumber} a été confirmée - Nuage`}>
      <Section style={section}>
        <Heading style={h1}>Merci pour votre commande !</Heading>
        <Text style={text}>
          Votre commande a été confirmée avec succès. Nous préparons vos
          articles avec soin.
        </Text>
        <Text style={infoPill}>
          Numéro de commande : <strong>{orderNumber}</strong>
        </Text>
      </Section>

      <Hr style={hr} />

      <Section style={section}>
        <Heading style={h2}>Détails de votre commande</Heading>
        {items.map((item, index) => (
          <Text key={index} style={itemText}>
            {item.productName} × {item.quantity} —{" "}
            <strong>{((item.price * item.quantity) / 100).toFixed(2)} €</strong>
          </Text>
        ))}
      </Section>

      <Hr style={hr} />

      <Section style={section}>
        <Text style={totalRowText}>
          Sous-total : {(subtotal / 100).toFixed(2)} €
        </Text>
        <Text style={totalRowText}>
          Livraison :{" "}
          {shipping > 0 ? `${(shipping / 100).toFixed(2)} €` : "Offerte"}
        </Text>
        <Text style={totalBoldText}>Total : {(total / 100).toFixed(2)} €</Text>
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
        <Heading style={h2}>Prochaines étapes</Heading>
        <Text style={text}>
          1. Nous préparons votre commande
          <br />
          2. Vous recevrez un email dès que votre colis sera expédié
          <br />
          3. Suivez votre livraison avec le numéro de suivi fourni
        </Text>
      </Section>
    </EmailLayout>
  );
}

export default OrderConfirmationEmail;
