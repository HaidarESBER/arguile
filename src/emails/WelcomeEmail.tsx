import { Button, Heading, Section, Text, Hr } from "@react-email/components";
import {
  EmailLayout,
  SITE_URL,
  h1,
  text,
  section,
  hr,
  ctaSection,
  ctaButton,
} from "./components/EmailLayout";

interface WelcomeEmailProps {
  unsubscribeUrl: string;
}

/**
 * Welcome Email — sent on newsletter signup.
 */
export function WelcomeEmail({ unsubscribeUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview="Bienvenue dans l'univers Nuage !"
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={section}>
        <Heading style={h1}>Bienvenue dans l&apos;univers Nuage !</Heading>
        <Text style={text}>
          Merci de vous être inscrit(e) à notre newsletter. Vous recevrez en
          avant-première nos offres exclusives, nos nouvelles collections et
          des contenus autour de la culture chicha.
        </Text>
      </Section>

      <Hr style={hr} />

      <Section style={ctaSection}>
        <Button href={`${SITE_URL}/produits`} style={ctaButton}>
          Découvrir nos produits
        </Button>
      </Section>
    </EmailLayout>
  );
}

export default WelcomeEmail;
