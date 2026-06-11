import { Metadata } from "next";
import { Container } from "@/components/ui";
import { SUPPORT_EMAIL } from "@/lib/support";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions générales de vente de la boutique Nuage",
  alternates: {
    canonical: "/cgv",
  },
};

export default function CGVPage() {
  return (
    <main className="py-16 min-h-screen">
      <Container size="md">
        <h1 className="text-4xl font-heading font-bold text-primary mb-8">
          Conditions Générales de Vente
        </h1>

        <div className="prose prose-lg max-w-none text-primary/80 space-y-8">
          {/* Préambule */}
          <section>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées sur le site nuage.fr par la société Nuage SARL.
            </p>
            <p>
              Toute commande implique l&apos;acceptation sans réserve des présentes CGV.
            </p>
          </section>

          {/* Article 1 - Produits */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 1 - Produits
            </h2>
            <p>
              Les produits proposés à la vente sont des chichas et accessoires pour fumeurs, destinés exclusivement aux personnes majeures.
            </p>
            <p>
              Les photographies et descriptions des produits sont les plus fidèles possibles mais ne peuvent assurer une similitude parfaite avec le produit offert, notamment en ce qui concerne les couleurs.
            </p>
            <p>
              <strong>AVERTISSEMENT :</strong> La vente de nos produits est strictement réservée aux personnes âgées de 18 ans et plus. En passant commande, vous certifiez avoir 18 ans révolus.
            </p>
          </section>

          {/* Article 2 - Prix */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 2 - Prix
            </h2>
            <p>
              Les prix de nos produits sont indiqués en euros (€) toutes taxes comprises (TTC), hors frais de livraison.
            </p>
            <p>
              Nuage se réserve le droit de modifier ses prix à tout moment, étant entendu que le prix figurant sur le site au jour de la commande sera le seul applicable à l&apos;acheteur.
            </p>
            <p>
              Les frais de livraison sont indiqués avant la validation finale de la commande et varient selon la destination et le mode de livraison choisi.
            </p>
          </section>

          {/* Article 3 - Commande */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 3 - Commande
            </h2>
            <p>
              Pour passer commande, le client doit :
            </p>
            <ul className="list-disc ml-8 space-y-2">
              <li>Sélectionner les produits souhaités et les ajouter au panier</li>
              <li>Valider le contenu du panier</li>
              <li>Renseigner les informations de livraison</li>
              <li>Choisir le mode de livraison</li>
              <li>Accepter les présentes CGV</li>
              <li>Procéder au paiement</li>
            </ul>
            <p>
              La commande est définitivement enregistrée après validation du paiement. Un email de confirmation est alors envoyé au client.
            </p>
          </section>

          {/* Article 4 - Paiement */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 4 - Paiement
            </h2>
            <p>
              Le paiement s&apos;effectue en ligne de manière sécurisée via notre prestataire de paiement.
            </p>
            <p>
              Les moyens de paiement acceptés sont :
            </p>
            <ul className="list-disc ml-8 space-y-2">
              <li>Carte bancaire (Visa, Mastercard, American Express)</li>
              <li>PayPal</li>
            </ul>
            <p>
              Les données de paiement sont cryptées et ne sont pas stockées sur nos serveurs.
            </p>
          </section>

          {/* Article 5 - Livraison */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 5 - Livraison
            </h2>
            <p>
              <strong>5.1 Zones de livraison</strong><br />
              Nous livrons en France métropolitaine et dans les pays de l&apos;Union Européenne.
            </p>
            <p>
              <strong>5.2 Délais de livraison</strong><br />
              Les délais de livraison sont donnés à titre indicatif et varient selon la destination :
            </p>
            <ul className="list-disc ml-8 space-y-2">
              <li>France métropolitaine : 2-3 jours ouvrés (Colissimo) ou 24h (Chronopost)</li>
              <li>UE Schengen : 3-5 jours ouvrés</li>
              <li>UE hors Schengen : 5-7 jours ouvrés</li>
              <li>Hors UE : 7-10 jours ouvrés</li>
            </ul>
            <p>
              <strong>5.3 Frais de port</strong><br />
              Les frais de livraison sont calculés en fonction du poids du colis et de la destination. Ils sont indiqués lors du processus de commande avant validation.
            </p>
            <p>
              <strong>5.4 Suivi de commande</strong><br />
              Un numéro de suivi est communiqué au client dès l&apos;expédition de sa commande.
            </p>
          </section>

          {/* Article 6 - Droit de rétractation */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 6 - Droit de rétractation
            </h2>
            <p>
              Conformément à l&apos;article L221-18 du Code de la consommation, vous disposez d&apos;un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalité.
            </p>
            <p>
              <strong>Conditions de retour :</strong>
            </p>
            <ul className="list-disc ml-8 space-y-2">
              <li>Les produits doivent être retournés dans leur emballage d&apos;origine</li>
              <li>Les produits ne doivent pas avoir été utilisés</li>
              <li>Les scellés de sécurité ne doivent pas avoir été brisés</li>
            </ul>
            <p>
              Pour exercer votre droit de rétractation, contactez-nous à : <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a>
            </p>
            <p>
              Les frais de retour sont à la charge du client. Le remboursement sera effectué dans un délai de 14 jours suivant la réception du retour.
            </p>
          </section>

          {/* Article 7 - Garanties */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 7 - Garanties
            </h2>
            <p>
              Tous nos produits bénéficient de la garantie légale de conformité (articles L217-4 à L217-14 du Code de la consommation) et de la garantie contre les vices cachés (articles 1641 à 1648 du Code civil).
            </p>
            <p>
              En cas de défaut de conformité, les produits peuvent être retournés, échangés ou remboursés.
            </p>
          </section>

          {/* Article 8 - Responsabilité */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 8 - Responsabilité
            </h2>
            <p>
              Nuage ne saurait être tenue responsable de l&apos;inexécution du contrat en cas de rupture de stock, indisponibilité du produit, ou en cas de force majeure.
            </p>
            <p>
              Les photographies et graphismes présentés sur le site ne sont pas contractuels et ne sauraient engager la responsabilité de Nuage.
            </p>
          </section>

          {/* Article 9 - Données personnelles */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 9 - Données personnelles
            </h2>
            <p>
              Les données personnelles collectées sont nécessaires au traitement de votre commande et à la gestion de la relation client.
            </p>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition. Pour l&apos;exercer, contactez : <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a>
            </p>
          </section>

          {/* Article 10 - Litiges */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 10 - Règlement des litiges
            </h2>
            <p>
              En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
            </p>
            <p>
              À défaut, les tribunaux français seront seuls compétents.
            </p>
            <p>
              Conformément à l&apos;article L612-1 du Code de la consommation, le client peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige.
            </p>
          </section>

          {/* Article 11 - Santé et avertissements */}
          <section>
            <h2 className="text-2xl font-heading font-semibold text-primary mb-4">
              Article 11 - Santé et avertissements
            </h2>
            <p className="font-semibold text-primary">
              AVERTISSEMENT SANTÉ : Fumer est dangereux pour la santé.
            </p>
            <p>
              Les produits vendus sur ce site sont destinés à un usage de détente et ne doivent pas être utilisés avec des substances illégales.
            </p>
            <p>
              Nuage ne saurait être tenu responsable de l&apos;utilisation faite de ses produits par les clients.
            </p>
          </section>

          <div className="pt-8 border-t border-primary/20">
            <p className="text-sm text-primary/60">
              Conditions Générales de Vente en vigueur au {new Date().toLocaleDateString("fr-FR", {
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
