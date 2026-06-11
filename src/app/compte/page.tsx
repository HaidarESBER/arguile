import { Metadata } from "next";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = {
  title: "Mon Compte",
  description: "Gérez votre compte et consultez vos commandes",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountClient />;
}
