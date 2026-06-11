import { permanentRedirect } from "next/navigation";

/**
 * Legacy wishlist route.
 * The header and the rest of the site link to /compte/wishlist, which loads
 * real products from the API. This page previously filtered a hardcoded seed
 * catalogue, so real products never appeared here.
 */
export default function FavorisPage() {
  permanentRedirect("/compte/wishlist");
}
