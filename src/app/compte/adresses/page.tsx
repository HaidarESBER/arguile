import { Metadata } from "next";
import AdressesClient from "./AdressesClient";

export const metadata: Metadata = {
  title: "Mes Adresses",
  description: "Gérez vos adresses de livraison enregistrées.",
  robots: { index: false, follow: false },
};

export default function AdressesPage() {
  return <AdressesClient />;
}
