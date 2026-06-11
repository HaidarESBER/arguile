import { Metadata } from "next";
import { Container } from "@/components/ui";
import { SUPPORT_EMAIL } from "@/lib/support";

/*
 * ============================================================================
 * TODO AVANT MISE EN LIGNE — INFORMATIONS LÉGALES OBLIGATOIRES À COMPLÉTER
 * ============================================================================
 * Le propriétaire du site DOIT remplacer les placeholders « [À compléter] »
 * ci-dessous avant tout lancement public (obligation légale, art. 6 LCEN) :
 *   - Capital social de la société
 *   - Adresse du siège social
 *   - Numéro RCS
 *   - Numéro SIRET
 *   - Numéro de TVA intracommunautaire
 *   - Numéro de téléphone
 *   - Nom du directeur de la publication
 *   - Crédits photographiques (section 8)
 * ============================================================================
 */

export const metadata: Metadata = {
  title: "Mentions Légales",
  description: "Informations légales et mentions obligatoires de Nuage",
  alternates: {
    canonical: "/mentions-legales",
  },
};

export default function MentionsLegalesPage() {
  return (
    <main className="py-16 min-h-screen">
      <Container size="md">
        <h1 className="text-4xl font-heading font-bold text-primary mb-8">
          Mentions Légales
        </h1>

        <div className="prose prose-lg max-w-none text-primary/80 space-y-8">
          {/* Éditeur du site */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              1. Éditeur du site
            </h2>
            <p>
              Le site Nuage est édité par :
            </p>
            <p className="ml-4">
              <strong>Nuage SARL</strong><br />
              Capital social : [À compléter] €<br />
              Siège social : [Adresse à compléter]<br />
              RCS : [Numéro RCS à compléter]<br />
              SIRET : [Numéro SIRET à compléter]<br />
              TVA intracommunautaire : [Numéro TVA à compléter]<br />
              Email : {SUPPORT_EMAIL}<br />
              Téléphone : [Numéro à compléter]
            </p>
            <p>
              <strong>Directeur de la publication :</strong> [Nom à compléter]
            </p>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              2. Hébergement
            </h2>
            <p>
              Le site est hébergé par :
            </p>
            <p className="ml-4">
              <strong>Vercel Inc.</strong><br />
              340 S Lemon Ave #4133<br />
              Walnut, CA 91789<br />
              États-Unis<br />
              Site web : <a href="https://vercel.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
            </p>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              3. Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble de ce site relève de la législation française et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
            <p>
              La reproduction de tout ou partie de ce site sur un support électronique ou autre quel qu&apos;il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
            </p>
            <p>
              Les marques citées sur ce site sont déposées par les sociétés qui en sont propriétaires.
            </p>
          </section>

          {/* Protection des données */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              4. Protection des données personnelles
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition aux données personnelles vous concernant.
            </p>
            <p>
              Pour exercer ces droits, vous pouvez nous contacter à l&apos;adresse suivante : <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a>
            </p>
            <p>
              Les données collectées sont nécessaires au traitement de votre commande et à la gestion de la relation client. Elles ne seront en aucun cas cédées ou vendues à des tiers.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              5. Cookies
            </h2>
            <p>
              Ce site utilise des cookies pour améliorer l&apos;expérience utilisateur et permettre le fonctionnement de certaines fonctionnalités (panier, authentification, préférences).
            </p>
            <p>
              Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient ne plus être disponibles.
            </p>
          </section>

          {/* Limitation de responsabilité */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              6. Limitation de responsabilité
            </h2>
            <p>
              Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
            </p>
            <p>
              Nuage ne pourra être tenu responsable des dommages directs ou indirects causés au matériel de l&apos;utilisateur lors de l&apos;accès au site, et résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications, soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
            </p>
          </section>

          {/* Droit applicable */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              7. Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d&apos;accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
            </p>
          </section>

          {/* Crédits */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              8. Crédits
            </h2>
            <p>
              Conception et développement : Nuage<br />
              Photographies : [Crédits photos à compléter]
            </p>
          </section>

          <div className="pt-8 border-t border-primary/20">
            <p className="text-sm text-primary/60">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
