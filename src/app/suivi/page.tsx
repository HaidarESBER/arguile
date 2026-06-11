import { Metadata } from "next";
import SuiviClient from "./SuiviClient";

export const metadata: Metadata = {
  title: "Suivre ma commande",
  description:
    "Suivez votre commande Nuage en entrant votre numéro de commande et votre adresse email.",
  robots: { index: false, follow: false },
};

export default function SuiviPage() {
  return <SuiviClient />;
}
