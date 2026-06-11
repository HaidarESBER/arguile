/**
 * TypeScript declarations for Google Maps JavaScript API
 */

declare global {
  interface Window {
    google?: typeof google;
  }

  namespace google {
    namespace maps {
      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      namespace places {
        class Autocomplete {
          constructor(
            input: HTMLInputElement,
            options?: AutocompleteOptions
          );
          addListener(event: string, handler: () => void): void;
          getPlace(): PlaceResult;
        }

        interface AutocompleteOptions {
          types?: string[];
          componentRestrictions?: ComponentRestrictions;
          fields?: string[];
        }

        interface ComponentRestrictions {
          country: string | string[];
        }

        interface PlaceResult {
          address_components?: AddressComponent[];
          formatted_address?: string;
        }

        interface AddressComponent {
          long_name: string;
          short_name: string;
          types: string[];
        }
      }

      namespace event {
        function clearInstanceListeners(instance: object): void;
      }
    }
  }
}

export {};
