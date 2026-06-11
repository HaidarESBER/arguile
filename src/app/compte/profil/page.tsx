import { Metadata } from "next";
import ProfilClient from "./ProfilClient";

export const metadata: Metadata = {
  title: "Mon Profil",
  description:
    "Gérez vos informations personnelles, votre sécurité et vos préférences.",
  robots: { index: false, follow: false },
};

export default function ProfilPage() {
  return <ProfilClient />;
}
