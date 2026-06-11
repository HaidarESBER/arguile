import { Button, Heading, Section, Text, Hr } from "@react-email/components";
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

interface WinBackEmailProps {
  firstName: string;
  products: Array<{ name: string; price: number }>;
  unsubscribeUrl: string;
}

/**
 * Win-Back Email — re-engagement campaign for inactive customers.
 */
export function WinBackEmail({
  firstName,
  products,
  unsubscribeUrl,
}: WinBackEmailProps) {
  return (
    <EmailLayout
      preview="Cela fait un moment... découvrez nos nouveautés - Nuage"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={section}>
        <Heading style={h1}>Cela fait un moment...</Heading>
        <Text style={text}>
          {firstName ? `Bonjour ${firstName}, ` : "Bonjour, "}
          vous nous manquez ! Cela fait un moment depuis votre dernière visite.
          Nous avons de belles nouveautés qui pourraient vous plaire.
        </Text>
      </Section>

      {products.length > 0 && (
        <>
          <Hr style={hr} />
          <Section style={section}>
            <Heading style={h2}>Nos dernières nouveautés</Heading>
            {products.map((product, index) => (
              <Text key={index} style={itemText}>
                {product.name} — {(product.price / 100).toFixed(2)} €
              </Text>
            ))}
          </Section>
        </>
      )}

      <Hr style={hr} />

      <Section style={section}>
        <Text style={infoPill}>
          Code exclusif <strong>RETOUR15</strong> pour 15% de remise sur votre
          prochaine commande !
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button href={`${SITE_URL}/produits`} style={ctaButton}>
          Découvrir les nouveautés
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default WinBackEmail;
