import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Notre Histoire — La Passion de la Chicha Libanaise",
  description:
    "Découvrez l'histoire de deux frères libanais passionnés par la culture de la chicha. Notre mission : apporter l'expérience authentique du Liban en Europe.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/60 via-background-dark/80 to-background-dark"></div>
          <div className="absolute inset-0 bg-[url('/nuage.mp4')] bg-cover bg-center opacity-40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold tracking-wider mb-4 uppercase backdrop-blur-md">
            Notre Histoire
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Du Liban à l&apos;Europe
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            L&apos;histoire de deux frères unis par une passion ancestrale
          </p>
        </div>
      </section>

      <Container>
        <div className="max-w-4xl mx-auto py-16 space-y-16">
          {/* The Beginning */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-center">Les Origines</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg">
                Tout commence à <span className="text-primary font-semibold">Beyrouth</span>, capitale effervescente du Liban,
                où la chicha n&apos;est pas qu&apos;un simple passe-temps, mais un véritable <span className="text-white font-semibold">art de vivre</span> transmis
                de génération en génération.
              </p>

              <p className="text-gray-300 leading-relaxed text-lg">
                Ali et Haidar, deux frères ingénieurs nés au cœur de cette tradition millénaire, ont grandi bercés par les volutes
                de fumée parfumée qui s&apos;échappaient des cafés traditionnels de leur quartier. Dès leur plus jeune âge,
                ils ont été fascinés par ce rituel social qui rassemble les familles, les amis, et même les inconnus autour
                d&apos;un narghilé partagé.
              </p>
            </div>
          </section>

          {/* The Tradition */}
          <section className="bg-background-card/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-icons text-primary text-4xl">spa</span>
              <h2 className="text-3xl md:text-4xl font-bold">La Culture de la Chicha au Liban</h2>
            </div>

            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="text-lg">
                Au Liban, la chicha (ou <em>arguilé</em> comme on l&apos;appelle là-bas) est bien plus qu&apos;une simple pratique.
                C&apos;est un <span className="text-white font-semibold">patrimoine culturel vivant</span>, un moment sacré de
                détente et de convivialité qui ponctue la vie quotidienne.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <span className="material-icons text-primary mb-3 text-3xl">groups</span>
                  <h3 className="text-xl font-bold text-white mb-2">Rituel Social</h3>
                  <p className="text-sm text-gray-400">
                    Dans les ruelles de Beyrouth, les cafés à chicha sont des lieux de rencontre où se tissent amitiés
                    et discussions philosophiques, où les générations se mêlent autour d&apos;un narghilé partagé.
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <span className="material-icons text-primary mb-3 text-3xl">auto_awesome</span>
                  <h3 className="text-xl font-bold text-white mb-2">Art Ancestral</h3>
                  <p className="text-sm text-gray-400">
                    La préparation de la chicha est un art transmis de maître à apprenti : le choix du tabac,
                    l&apos;arrangement des charbons, la température de l&apos;eau... chaque détail compte.
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <span className="material-icons text-primary mb-3 text-3xl">local_florist</span>
                  <h3 className="text-xl font-bold text-white mb-2">Tradition Raffinée</h3>
                  <p className="text-sm text-gray-400">
                    Les tabacs aux saveurs naturelles (pomme double, menthe fraîche, raisin) sont préparés avec soin,
                    utilisant des techniques séculaires pour offrir une expérience pure et authentique.
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <span className="material-icons text-primary mb-3 text-3xl">psychology</span>
                  <h3 className="text-xl font-bold text-white mb-2">Philosophie de Vie</h3>
                  <p className="text-sm text-gray-400">
                    Plus qu&apos;une activité, c&apos;est une invitation à ralentir, à savourer l&apos;instant présent,
                    à se reconnecter avec soi-même et avec les autres dans un monde qui va trop vite.
                  </p>
                </div>
              </div>

              <p className="text-lg">
                Pour Ali et Haidar, chaque session de chicha était une <span className="text-white font-semibold">célébration</span> :
                celle de l&apos;amitié, de la famille, des retrouvailles après une longue journée. C&apos;est dans ces moments
                que se nouaient les liens les plus profonds, que se partageaient les rires et les confidences,
                bercés par le doux bouillonnement de l&apos;eau et les arômes envoûtants du tabac.
              </p>
            </div>
          </section>

          {/* The Journey to Europe */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-center">Le Voyage vers l&apos;Europe</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg">
                En arrivant en Europe pour leurs études, les deux frères ont rapidement ressenti un manque.
                Malgré la présence de quelques établissements proposant de la chicha, quelque chose clochait :
                <span className="text-white font-semibold"> l&apos;âme n&apos;y était pas</span>.
              </p>

              <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6 my-8">
                <p className="text-gray-200 italic text-lg mb-0">
                  &quot;Nous avons réalisé que la chicha en Europe était souvent perçue comme une simple distraction,
                  dépouillée de toute sa dimension culturelle et spirituelle. Les produits étaient de qualité
                  médiocre, l&apos;expérience précipitée, la passion absente.&quot;
                </p>
                <p className="text-primary font-semibold mt-3 text-sm">— Ali & Haidar, Fondateurs de Nuage</p>
              </div>

              <p className="text-gray-300 leading-relaxed text-lg">
                C&apos;est alors qu&apos;est née l&apos;idée de <span className="text-primary font-bold">Nuage</span>.
                Pourquoi ne pas recréer cette expérience authentique qu&apos;ils avaient vécue au Liban ?
                Pourquoi ne pas partager cette tradition ancestrale avec le public européen, dans toute sa richesse
                et sa noblesse ?
              </p>
            </div>
          </section>

          {/* The Mission */}
          <section className="bg-gradient-to-br from-primary/10 via-background-card/50 to-emerald-500/10 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-icons text-primary text-4xl">flag</span>
              <h2 className="text-3xl md:text-4xl font-bold">Notre Mission</h2>
            </div>

            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="text-lg text-gray-200">
                Chez <span className="text-primary font-bold">Nuage</span>, notre mission est claire et passionnée :
              </p>

              <div className="space-y-6 my-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-icons text-primary">verified</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Authenticité Absolue</h3>
                    <p className="text-gray-300">
                      Nous importons directement du Liban et du Moyen-Orient les meilleures chichas artisanales,
                      les tabacs premium et les accessoires traditionnels. Aucun compromis sur la qualité.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-icons text-primary">school</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Éducation & Culture</h3>
                    <p className="text-gray-300">
                      Nous ne vendons pas seulement des produits, nous partageons un savoir-faire.
                      Chaque client reçoit des conseils d&apos;experts pour préparer sa chicha comme un véritable maître libanais.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-icons text-primary">favorite</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Passion & Excellence</h3>
                    <p className="text-gray-300">
                      Nous sélectionnons chaque article avec le même soin que si nous l&apos;achetions pour nous-mêmes.
                      Aluminium aérospatial, cristal de Bohème, silicone médical : nous n&apos;acceptons que le meilleur.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-icons text-primary">public</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Pont Culturel</h3>
                    <p className="text-gray-300">
                      Notre rêve est de créer un pont entre deux mondes : partager la richesse de la culture
                      libanaise de la chicha avec l&apos;Europe, et montrer que cette tradition ancestrale a toute sa
                      place dans le mode de vie contemporain.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-200 border-t border-white/10 pt-6 mt-6">
                Aujourd&apos;hui, chaque chicha que nous vendons porte en elle un morceau de notre histoire,
                de nos souvenirs des ruelles parfumées de Beyrouth, des rires partagés avec nos proches.
                Quand vous allumez votre narghilé Nuage, vous ne fumez pas simplement du tabac —
                <span className="text-primary font-bold"> vous vivez une expérience authentique qui traverse les frontières et les époques</span>.
              </p>
            </div>
          </section>

          {/* The Invitation */}
          <section className="text-center space-y-8 py-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Rejoignez Notre Communauté
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Que vous soyez un connaisseur chevronné ou un novice curieux, nous vous invitons à découvrir
              l&apos;art de la chicha tel qu&apos;il est pratiqué depuis des siècles au Liban.
              Laissez-nous vous guider dans ce voyage sensoriel et culturel.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                href="/produits"
                className="px-8 py-4 bg-primary text-background-dark font-bold rounded-full hover:bg-white transition-all duration-300"
              >
                Découvrir nos Produits
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white/5 border border-white/20 hover:border-primary/50 text-white rounded-full backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Retour à l&apos;Accueil
              </Link>
            </div>
          </section>

          {/* Signature */}
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-gray-400 italic">
              Avec passion et dévouement,
            </p>
            <p className="text-primary font-bold text-2xl mt-2 font-serif">
              Ali & Haidar
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Ingénieurs & Fondateurs, Nuage
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
