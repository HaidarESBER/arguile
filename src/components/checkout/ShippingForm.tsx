"use client";

import { ShippingAddress, europeanCountries, EuropeanCountry } from "@/types/checkout";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { useLocale } from "@/contexts/LocaleContext";
import { EUROPEAN_COUNTRIES } from "@/data/countries";

// Localized country names keyed by ISO code. The <option> value stays the
// French name (used as the storage/lookup key in europeanCountries), only the
// visible label is translated.
const COUNTRY_NAME_EN_BY_CODE = new Map(
  EUROPEAN_COUNTRIES.map((c) => [c.code, c.nameEn])
);

const STRINGS = {
  fr: {
    postalCodeFallback: "Code postal",
    title: "Adresse de livraison",
    firstName: "Prénom *",
    firstNamePlaceholder: "Jean",
    lastName: "Nom *",
    lastNamePlaceholder: "Dupont",
    phone: "Téléphone *",
    addressLine2: "Complément d'adresse",
    addressLine2Placeholder: "Appartement, étage, bâtiment...",
    city: "Ville *",
    postalCode: "Code postal *",
    country: "Pays *",
    europeDelivery: "Livraison disponible dans toute l'Europe",
  },
  en: {
    postalCodeFallback: "Postal code",
    title: "Shipping address",
    firstName: "First name *",
    firstNamePlaceholder: "John",
    lastName: "Last name *",
    lastNamePlaceholder: "Smith",
    phone: "Phone *",
    addressLine2: "Address line 2",
    addressLine2Placeholder: "Apartment, floor, building...",
    city: "City *",
    postalCode: "Postal code *",
    country: "Country *",
    europeDelivery: "Delivery available across Europe",
  },
} as const;

interface ShippingFormProps {
  address: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
  errors: Partial<Record<keyof ShippingAddress, string>>;
}

/**
 * ShippingForm component for collecting shipping address
 *
 * Features:
 * - All fields in French
 * - Client-side validation feedback
 * - Address autocomplete with Google Places
 * - Country-specific postal code validation
 */
export function ShippingForm({ address, onChange, errors }: ShippingFormProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];

  const handleChange = (
    field: keyof ShippingAddress,
    value: string
  ) => {
    onChange({ ...address, [field]: value });
  };

  const handleAddressSelect = (addressData: Partial<ShippingAddress>) => {
    onChange({ ...address, ...addressData });
  };

  const countryData = europeanCountries[address.country as EuropeanCountry];
  const postalCodePlaceholder = countryData?.placeholder || t.postalCodeFallback;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl text-text mb-4">
        {t.title}
      </h2>

      {/* Name row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-white mb-1"
          >
            {t.firstName}
          </label>
          <input
            type="text"
            id="firstName"
            value={address.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.firstName
                ? "border-error focus:ring-error"
                : "border-white/10 focus:ring-primary"
            } bg-white/5 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:bg-white/10 backdrop-blur-sm transition-all`}
            placeholder={t.firstNamePlaceholder}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-white mb-1"
          >
            {t.lastName}
          </label>
          <input
            type="text"
            id="lastName"
            value={address.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.lastName
                ? "border-error focus:ring-error"
                : "border-white/10 focus:ring-primary"
            } bg-white/5 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:bg-white/10 backdrop-blur-sm transition-all`}
            placeholder={t.lastNamePlaceholder}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Phone (the email is collected in the section "Votre email") */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-white mb-1"
        >
          {t.phone}
        </label>
        <input
          type="tel"
          id="phone"
          value={address.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className={`w-full px-4 py-3 rounded-[--radius-button] border ${
            errors.phone
              ? "border-red-500 focus:ring-red-500"
              : "border-background-secondary focus:ring-accent"
          } bg-background text-text focus:outline-none focus:ring-2`}
          placeholder="06 12 34 56 78"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
        )}
      </div>

      {/* Address with Autocomplete */}
      <AddressAutocomplete
        onAddressSelect={handleAddressSelect}
        selectedCountry={address.country}
        currentAddress={address.address}
        onAddressChange={(value) => handleChange("address", value)}
        error={errors.address}
      />

      {/* Address line 2 */}
      <div>
        <label
          htmlFor="addressLine2"
          className="block text-sm font-medium text-text mb-1"
        >
          {t.addressLine2}
        </label>
        <input
          type="text"
          id="addressLine2"
          value={address.addressLine2 || ""}
          onChange={(e) => handleChange("addressLine2", e.target.value)}
          className="w-full px-4 py-3 rounded-[--radius-button] border border-background-secondary bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder={t.addressLine2Placeholder}
        />
      </div>

      {/* City and postal code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-white mb-1"
          >
            {t.city}
          </label>
          <input
            type="text"
            id="city"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className={`w-full px-4 py-3 rounded-[--radius-button] border ${
              errors.city
                ? "border-red-500 focus:ring-red-500"
                : "border-background-secondary focus:ring-accent"
            } bg-background text-text focus:outline-none focus:ring-2`}
            placeholder="Paris"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="postalCode"
            className="block text-sm font-medium text-white mb-1"
          >
            {t.postalCode}
          </label>
          <input
            type="text"
            id="postalCode"
            value={address.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            className={`w-full px-4 py-3 rounded-[--radius-button] border ${
              errors.postalCode
                ? "border-red-500 focus:ring-red-500"
                : "border-background-secondary focus:ring-accent"
            } bg-background text-text focus:outline-none focus:ring-2`}
            placeholder={postalCodePlaceholder}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-text mb-1"
        >
          {t.country}
        </label>
        <select
          id="country"
          value={address.country}
          onChange={(e) => handleChange("country", e.target.value)}
          className={`w-full px-4 py-3 rounded-[--radius-button] border ${
            errors.country
              ? "border-red-500 focus:ring-red-500"
              : "border-background-secondary focus:ring-accent"
          } bg-background text-text focus:outline-none focus:ring-2`}
        >
          {Object.entries(europeanCountries).map(([country, data]) => (
            <option key={country} value={country}>
              {locale === "en"
                ? COUNTRY_NAME_EN_BY_CODE.get(data.code) ?? country
                : country}
            </option>
          ))}
        </select>
        {errors.country && (
          <p className="mt-1 text-sm text-red-500">{errors.country}</p>
        )}
        <p className="mt-1 text-xs text-muted">
          {t.europeDelivery}
        </p>
      </div>
    </div>
  );
}
