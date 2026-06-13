import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { getLocale } from "@/lib/i18n/server";
import {
  Leaf,
  Users,
  Sparkles,
  Flower2,
  Brain,
  Target,
  BadgeCheck,
  GraduationCap,
  Heart,
  Globe,
} from "lucide-react";

const STRINGS = {
  fr: {
    metaTitle: "Notre Histoire — La Passion de la Chicha Libanaise",
    metaDescription:
      "Découvrez l'histoire de deux frères libanais passionnés par la culture de la chicha. Notre mission : apporter l'expérience authentique du Liban en Europe.",
    heroBadge: "Notre Histoire",
    heroTitle: "Du Liban à l'Europe",
    heroSubtitle: "L'histoire de deux frères unis par une passion ancestrale",
    originsTitle: "Les Origines",
    originsP1a: "Tout commence à ",
    originsP1city: "Beyrouth",
    originsP1b:
      ", capitale effervescente du Liban, où la chicha n'est pas qu'un simple passe-temps, mais un véritable ",
    originsP1span: "art de vivre",
    originsP1c: " transmis de génération en génération.",
    originsP2:
      "Ali et Haidar, deux frères ingénieurs nés au cœur de cette tradition millénaire, ont grandi bercés par les volutes de fumée parfumée qui s'échappaient des cafés traditionnels de leur quartier. Dès leur plus jeune âge, ils ont été fascinés par ce rituel social qui rassemble les familles, les amis, et même les inconnus autour d'un narghilé partagé.",
    cultureTitle: "La Culture de la Chicha au Liban",
    cultureP1a: "Au Liban, la chicha (ou ",
    cultureP1em: "arguilé",
    cultureP1b:
      " comme on l'appelle là-bas) est bien plus qu'une simple pratique. C'est un ",
    cultureP1span: "patrimoine culturel vivant",
    cultureP1c:
      ", un moment sacré de détente et de convivialité qui ponctue la vie quotidienne.",
    card1Title: "Rituel Social",
    card1Text:
      "Dans les ruelles de Beyrouth, les cafés à chicha sont des lieux de rencontre où se tissent amitiés et discussions philosophiques, où les générations se mêlent autour d'un narghilé partagé.",
    card2Title: "Art Ancestral",
    card2Text:
      "La préparation de la chicha est un art transmis de maître à apprenti : le choix du tabac, l'arrangement des charbons, la température de l'eau... chaque détail compte.",
    card3Title: "Tradition Raffinée",
    card3Text:
      "Les tabacs aux saveurs naturelles (pomme double, menthe fraîche, raisin) sont préparés avec soin, utilisant des techniques séculaires pour offrir une expérience pure et authentique.",
    card4Title: "Philosophie de Vie",
    card4Text:
      "Plus qu'une activité, c'est une invitation à ralentir, à savourer l'instant présent, à se reconnecter avec soi-même et avec les autres dans un monde qui va trop vite.",
    cultureP2a: "Pour Ali et Haidar, chaque session de chicha était une ",
    cultureP2span: "célébration",
    cultureP2b:
      " : celle de l'amitié, de la famille, des retrouvailles après une longue journée. C'est dans ces moments que se nouaient les liens les plus profonds, que se partageaient les rires et les confidences, bercés par le doux bouillonnement de l'eau et les arômes envoûtants du tabac.",
    journeyTitle: "Le Voyage vers l'Europe",
    journeyP1a:
      "En arrivant en Europe pour leurs études, les deux frères ont rapidement ressenti un manque. Malgré la présence de quelques établissements proposant de la chicha, quelque chose clochait :",
    journeyP1span: " l'âme n'y était pas",
    quote:
      '"Nous avons réalisé que la chicha en Europe était souvent perçue comme une simple distraction, dépouillée de toute sa dimension culturelle et spirituelle. Les produits étaient de qualité médiocre, l\'expérience précipitée, la passion absente."',
    quoteAuthor: "— Ali & Haidar, Fondateurs de Nuage",
    journeyP2a: "C'est alors qu'est née l'idée de ",
    journeyP2b:
      ". Pourquoi ne pas recréer cette expérience authentique qu'ils avaient vécue au Liban ? Pourquoi ne pas partager cette tradition ancestrale avec le public européen, dans toute sa richesse et sa noblesse ?",
    missionTitle: "Notre Mission",
    missionIntroA: "Chez ",
    missionIntroB: ", notre mission est claire et passionnée :",
    mission1Title: "Authenticité Absolue",
    mission1Text:
      "Nous importons directement du Liban et du Moyen-Orient les meilleures chichas artisanales, les tabacs premium et les accessoires traditionnels. Aucun compromis sur la qualité.",
    mission2Title: "Éducation & Culture",
    mission2Text:
      "Nous ne vendons pas seulement des produits, nous partageons un savoir-faire. Chaque client reçoit des conseils d'experts pour préparer sa chicha comme un véritable maître libanais.",
    mission3Title: "Passion & Excellence",
    mission3Text:
      "Nous sélectionnons chaque article avec le même soin que si nous l'achetions pour nous-mêmes. Aluminium aérospatial, cristal de Bohème, silicone médical : nous n'acceptons que le meilleur.",
    mission4Title: "Pont Culturel",
    mission4Text:
      "Notre rêve est de créer un pont entre deux mondes : partager la richesse de la culture libanaise de la chicha avec l'Europe, et montrer que cette tradition ancestrale a toute sa place dans le mode de vie contemporain.",
    missionOutroA:
      "Aujourd'hui, chaque chicha que nous vendons porte en elle un morceau de notre histoire, de nos souvenirs des ruelles parfumées de Beyrouth, des rires partagés avec nos proches. Quand vous allumez votre narghilé Nuage, vous ne fumez pas simplement du tabac —",
    missionOutroSpan:
      " vous vivez une expérience authentique qui traverse les frontières et les époques",
    joinTitle: "Rejoignez Notre Communauté",
    joinText:
      "Que vous soyez un connaisseur chevronné ou un novice curieux, nous vous invitons à découvrir l'art de la chicha tel qu'il est pratiqué depuis des siècles au Liban. Laissez-nous vous guider dans ce voyage sensoriel et culturel.",
    ctaProducts: "Découvrir nos Produits",
    ctaHome: "Retour à l'Accueil",
    signatureLine: "Avec passion et dévouement,",
    signatureRole: "Ingénieurs & Fondateurs, Nuage",
  },
  en: {
    metaTitle: "Our Story — A Passion for Lebanese Hookah",
    metaDescription:
      "Discover the story of two Lebanese brothers passionate about hookah culture. Our mission: bringing the authentic Lebanese experience to Europe.",
    heroBadge: "Our Story",
    heroTitle: "From Lebanon to Europe",
    heroSubtitle: "The story of two brothers united by an ancestral passion",
    originsTitle: "The Origins",
    originsP1a: "It all begins in ",
    originsP1city: "Beirut",
    originsP1b:
      ", Lebanon's vibrant capital, where hookah is not just a pastime but a true ",
    originsP1span: "art of living",
    originsP1c: " passed down from generation to generation.",
    originsP2:
      "Ali and Haidar, two engineer brothers born at the heart of this thousand-year-old tradition, grew up surrounded by the wisps of fragrant smoke drifting from the traditional cafés of their neighborhood. From their earliest years, they were fascinated by this social ritual that brings together families, friends, and even strangers around a shared narghile.",
    cultureTitle: "Hookah Culture in Lebanon",
    cultureP1a: "In Lebanon, hookah (or ",
    cultureP1em: "arguileh",
    cultureP1b:
      " as it is called there) is far more than a simple practice. It is a ",
    cultureP1span: "living cultural heritage",
    cultureP1c:
      ", a sacred moment of relaxation and conviviality that punctuates everyday life.",
    card1Title: "Social Ritual",
    card1Text:
      "In the alleys of Beirut, hookah cafés are meeting places where friendships and philosophical conversations are woven, where generations mingle around a shared narghile.",
    card2Title: "Ancestral Art",
    card2Text:
      "Preparing a hookah is an art passed from master to apprentice: the choice of tobacco, the arrangement of the coals, the temperature of the water... every detail matters.",
    card3Title: "Refined Tradition",
    card3Text:
      "Naturally flavored tobaccos (double apple, fresh mint, grape) are prepared with care, using age-old techniques to deliver a pure, authentic experience.",
    card4Title: "A Philosophy of Life",
    card4Text:
      "More than an activity, it is an invitation to slow down, to savor the present moment, to reconnect with yourself and with others in a world that moves too fast.",
    cultureP2a: "For Ali and Haidar, every hookah session was a ",
    cultureP2span: "celebration",
    cultureP2b:
      ": of friendship, of family, of reunions after a long day. It was in these moments that the deepest bonds were formed, that laughter and confidences were shared, lulled by the gentle bubbling of the water and the bewitching aromas of the tobacco.",
    journeyTitle: "The Journey to Europe",
    journeyP1a:
      "Upon arriving in Europe for their studies, the two brothers quickly felt that something was missing. Despite a handful of venues offering hookah, something was off:",
    journeyP1span: " the soul wasn't there",
    quote:
      '"We realized that hookah in Europe was often seen as mere entertainment, stripped of all its cultural and spiritual depth. The products were mediocre, the experience rushed, the passion absent."',
    quoteAuthor: "— Ali & Haidar, Founders of Nuage",
    journeyP2a: "That is when the idea of ",
    journeyP2b:
      " was born. Why not recreate the authentic experience they had lived in Lebanon? Why not share this ancestral tradition with the European public, in all its richness and nobility?",
    missionTitle: "Our Mission",
    missionIntroA: "At ",
    missionIntroB: ", our mission is clear and passionate:",
    mission1Title: "Absolute Authenticity",
    mission1Text:
      "We import the finest handcrafted hookahs, premium tobaccos and traditional accessories directly from Lebanon and the Middle East. No compromise on quality.",
    mission2Title: "Education & Culture",
    mission2Text:
      "We don't just sell products, we share know-how. Every customer receives expert advice to prepare their hookah like a true Lebanese master.",
    mission3Title: "Passion & Excellence",
    mission3Text:
      "We select every item with the same care as if we were buying it for ourselves. Aerospace-grade aluminum, Bohemian crystal, medical-grade silicone: we only accept the best.",
    mission4Title: "A Cultural Bridge",
    mission4Text:
      "Our dream is to build a bridge between two worlds: sharing the richness of Lebanese hookah culture with Europe, and showing that this ancestral tradition has its rightful place in contemporary life.",
    missionOutroA:
      "Today, every hookah we sell carries a piece of our story, of our memories of Beirut's fragrant alleys, of laughter shared with our loved ones. When you light your Nuage narghile, you are not simply smoking tobacco —",
    missionOutroSpan:
      " you are living an authentic experience that crosses borders and eras",
    joinTitle: "Join Our Community",
    joinText:
      "Whether you are a seasoned connoisseur or a curious beginner, we invite you to discover the art of hookah as it has been practiced for centuries in Lebanon. Let us guide you on this sensory and cultural journey.",
    ctaProducts: "Discover our Products",
    ctaHome: "Back to Home",
    signatureLine: "With passion and dedication,",
    signatureRole: "Engineers & Founders, Nuage",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: "/about",
    },
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const t = STRINGS[locale];

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden flex items-center justify-center">
        {/* Background image with overlay (was a broken bg-[url(.mp4)]) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/history.jpeg')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/60 via-background-dark/80 to-background-dark"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold tracking-wider mb-4 uppercase backdrop-blur-md">
            {t.heroBadge}
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-medium mb-6 leading-tight tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      <Container>
        <div className="max-w-4xl mx-auto py-16 space-y-16">
          {/* The Beginning */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-center">{t.originsTitle}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg">
                {t.originsP1a}<span className="text-primary font-semibold">{t.originsP1city}</span>{t.originsP1b}<span className="text-white font-semibold">{t.originsP1span}</span>{t.originsP1c}
              </p>

              <p className="text-gray-300 leading-relaxed text-lg">
                {t.originsP2}
              </p>
            </div>
          </section>

          {/* The Tradition */}
          <section className="bg-background-card/30 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="w-8 h-8 text-primary flex-shrink-0" aria-hidden="true" />
              <h2 className="font-display text-3xl md:text-4xl font-medium">{t.cultureTitle}</h2>
            </div>

            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="text-lg">
                {t.cultureP1a}<em>{t.cultureP1em}</em>{t.cultureP1b}<span className="text-white font-semibold">{t.cultureP1span}</span>{t.cultureP1c}
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <Users className="w-7 h-7 text-primary mb-3" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-2">{t.card1Title}</h3>
                  <p className="text-sm text-gray-400">
                    {t.card1Text}
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <Sparkles className="w-7 h-7 text-primary mb-3" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-2">{t.card2Title}</h3>
                  <p className="text-sm text-gray-400">
                    {t.card2Text}
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <Flower2 className="w-7 h-7 text-primary mb-3" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-2">{t.card3Title}</h3>
                  <p className="text-sm text-gray-400">
                    {t.card3Text}
                  </p>
                </div>

                <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                  <Brain className="w-7 h-7 text-primary mb-3" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-2">{t.card4Title}</h3>
                  <p className="text-sm text-gray-400">
                    {t.card4Text}
                  </p>
                </div>
              </div>

              <p className="text-lg">
                {t.cultureP2a}<span className="text-white font-semibold">{t.cultureP2span}</span>{t.cultureP2b}
              </p>
            </div>
          </section>

          {/* The Journey to Europe */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-center">{t.journeyTitle}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg">
                {t.journeyP1a}<span className="text-white font-semibold">{t.journeyP1span}</span>.
              </p>

              <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6 my-8">
                <p className="text-gray-200 italic text-lg mb-0">
                  {t.quote}
                </p>
                <p className="text-primary font-semibold mt-3 text-sm">{t.quoteAuthor}</p>
              </div>

              <p className="text-gray-300 leading-relaxed text-lg">
                {t.journeyP2a}<span className="text-primary font-bold">Nuage</span>{t.journeyP2b}
              </p>
            </div>
          </section>

          {/* The Mission */}
          <section className="bg-gradient-to-br from-primary/10 via-background-card/50 to-emerald-500/10 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 md:p-12 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-primary flex-shrink-0" aria-hidden="true" />
              <h2 className="font-display text-3xl md:text-4xl font-medium">{t.missionTitle}</h2>
            </div>

            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="text-lg text-gray-200">
                {t.missionIntroA}<span className="text-primary font-bold">Nuage</span>{t.missionIntroB}
              </p>

              <div className="space-y-6 my-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <BadgeCheck className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t.mission1Title}</h3>
                    <p className="text-gray-300">
                      {t.mission1Text}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t.mission2Title}</h3>
                    <p className="text-gray-300">
                      {t.mission2Text}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t.mission3Title}</h3>
                    <p className="text-gray-300">
                      {t.mission3Text}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Globe className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t.mission4Title}</h3>
                    <p className="text-gray-300">
                      {t.mission4Text}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-lg text-gray-200 border-t border-white/10 pt-6 mt-6">
                {t.missionOutroA}
                <span className="text-primary font-bold">{t.missionOutroSpan}</span>.
              </p>
            </div>
          </section>

          {/* The Invitation */}
          <section className="text-center space-y-8 py-8">
            <h2 className="font-display text-3xl md:text-4xl font-medium">
              {t.joinTitle}
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              {t.joinText}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                href="/produits"
                className="px-8 py-4 bg-primary text-background-dark font-bold rounded-full hover:bg-white transition-all duration-300"
              >
                {t.ctaProducts}
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white/5 border border-white/20 hover:border-primary/50 text-white rounded-full backdrop-blur-sm transition-all hover:bg-white/10"
              >
                {t.ctaHome}
              </Link>
            </div>
          </section>

          {/* Signature */}
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-gray-400 italic">
              {t.signatureLine}
            </p>
            <p className="text-primary font-bold text-2xl mt-2 font-serif">
              Ali & Haidar
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {t.signatureRole}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
