"use client";

import { ShippingAddress, europeanCountries, EuropeanCountry } from "@/types/checkout";
import { AddressAutocomplete } from "./AddressAutocomplete";

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
  const postalCodePlaceholder = countryData?.placeholder || "Code postal";

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl text-white mb-4">
        Adresse de livraison
      </h2>

      {/* Name row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-white mb-1"
          >
            Prénom *
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
            placeholder="Jean"
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
            Nom *
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
            placeholder="Dupont"
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
          Téléphone *
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
          } bg-background text-primary focus:outline-none focus:ring-2`}
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
          className="block text-sm font-medium text-primary mb-1"
        >
          Complément d&apos;adresse
        </label>
        <input
          type="text"
          id="addressLine2"
          value={address.addressLine2 || ""}
          onChange={(e) => handleChange("addressLine2", e.target.value)}
          className="w-full px-4 py-3 rounded-[--radius-button] border border-background-secondary bg-background text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          placeholder="Appartement, étage, bâtiment..."
        />
      </div>

      {/* City and postal code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-white mb-1"
          >
            Ville *
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
            } bg-background text-primary focus:outline-none focus:ring-2`}
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
            Code postal *
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
            } bg-background text-primary focus:outline-none focus:ring-2`}
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
          className="block text-sm font-medium text-primary mb-1"
        >
          Pays *
        </label>
        <select
          id="country"
          value={address.country}
          onChange={(e) => handleChange("country", e.target.value)}
          className={`w-full px-4 py-3 rounded-[--radius-button] border ${
            errors.country
              ? "border-red-500 focus:ring-red-500"
              : "border-background-secondary focus:ring-accent"
          } bg-background text-primary focus:outline-none focus:ring-2`}
        >
          {Object.keys(europeanCountries).map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {errors.country && (
          <p className="mt-1 text-sm text-red-500">{errors.country}</p>
        )}
        <p className="mt-1 text-xs text-muted">
          Livraison disponible dans toute l&apos;Europe
        </p>
      </div>
    </div>
  );
}
