"use client";

import { useEffect, useRef, useState } from "react";
import { ShippingAddress, europeanCountries, EuropeanCountry } from "@/types/checkout";

interface AddressAutocompleteProps {
  onAddressSelect: (address: Partial<ShippingAddress>) => void;
  selectedCountry: string;
  currentAddress: string;
  onAddressChange: (address: string) => void;
  error?: string;
}

/**
 * Address autocomplete component using Google Places API
 * Falls back to manual input if API is unavailable
 */
export function AddressAutocomplete({
  onAddressSelect,
  selectedCountry,
  currentAddress,
  onAddressChange,
  error,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof google !== "undefined" && google.maps && google.maps.places) {
      // Reads the window-global google object on mount; deferred to effect to avoid SSR hydration mismatch
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn("Google Maps API key not found. Address autocomplete disabled.");
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      // Get country code for restrictions
      const countryData = europeanCountries[selectedCountry as EuropeanCountry];
      const countryCode = countryData?.code || "FR";

      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: countryCode.toLowerCase() },
        fields: ["address_components", "formatted_address"],
      });

      // Handle place selection
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.address_components) return;

        const components = place.address_components;
        const addressData: Partial<ShippingAddress> = {};

        // Extract address components
        components.forEach((component) => {
          const types = component.types;

          if (types.includes("street_number")) {
            addressData.address = component.long_name + (addressData.address || "");
          }
          if (types.includes("route")) {
            addressData.address = (addressData.address || "") + " " + component.long_name;
          }
          if (types.includes("locality") || types.includes("postal_town")) {
            addressData.city = component.long_name;
          }
          if (types.includes("postal_code")) {
            addressData.postalCode = component.long_name;
          }
          if (types.includes("country")) {
            // Map country code back to French name
            const countryEntry = Object.entries(europeanCountries).find(
              ([, data]) => data.code === component.short_name
            );
            if (countryEntry) {
              addressData.country = countryEntry[0];
            }
          }
        });

        // Update address field with formatted address or constructed address
        if (addressData.address) {
          onAddressChange(addressData.address.trim());
        }

        onAddressSelect(addressData);
      });
    } catch (error) {
      console.error("Error initializing address autocomplete:", error);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, selectedCountry, onAddressSelect, onAddressChange]);

  return (
    <div>
      <label
        htmlFor="address"
        className="block text-sm font-medium text-primary mb-1"
      >
        Adresse *
      </label>
      <input
        ref={inputRef}
        type="text"
        id="address"
        value={currentAddress}
        onChange={(e) => onAddressChange(e.target.value)}
        className={`w-full px-4 py-3 rounded-[--radius-button] border ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-background-secondary focus:ring-accent"
        } bg-background text-primary focus:outline-none focus:ring-2`}
        placeholder="123 Rue de la Paix"
        autoComplete="off"
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {isLoaded && (
        <p className="mt-1 text-xs text-muted">
          Commencez à taper pour voir les suggestions d&apos;adresses
        </p>
      )}
    </div>
  );
}
