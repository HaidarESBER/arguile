# Address Autocomplete Setup Guide

This guide explains how to enable address autocomplete functionality in the checkout process.

## Overview

The checkout form now includes:
- **Country-specific postal code validation** for all 27 EU countries
- **Google Places Autocomplete** for address suggestions
- **Automatic form filling** based on selected address

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API** for your project:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Configure the API Key

1. Copy `.env.example` to `.env.local` if you haven't already:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Maps API key to `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server

### 3. Restrict API Key (Production)

For security in production:

1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add your domain(s): `https://yourdomain.com/*`
4. Under "API restrictions":
   - Select "Restrict key"
   - Choose "Places API"
5. Save changes

## Features

### Country-Specific Validation

The system validates postal codes according to each country's format:

| Country | Format | Example |
|---------|--------|---------|
| France | 5 digits | 75001 |
| Germany | 5 digits | 10115 |
| Netherlands | 4 digits + 2 letters | 1012 AB |
| Poland | 2 digits - 3 digits | 00-950 |
| Ireland | 3-4 alphanumeric | D01 F5P2 |
| ... and 22 more countries |

### Address Autocomplete

When users type in the address field:
1. Google Places suggests addresses based on the selected country
2. When an address is selected:
   - Street address auto-fills
   - City auto-fills
   - Postal code auto-fills
   - Country updates if different

### Graceful Degradation

The autocomplete feature:
- ✅ Works when API key is configured
- ✅ Falls back to manual input if API is unavailable
- ✅ Still validates addresses without the API
- ✅ No errors shown to users if API is not configured

## Testing

To test the autocomplete:

1. Go to checkout: `/panier` (add items to cart first)
2. Select a country from the dropdown
3. Start typing an address in the "Adresse" field
4. Select from the suggested addresses
5. Verify that city and postal code are auto-filled

## Troubleshooting

### Autocomplete not appearing

- Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Verify Places API is enabled in Google Cloud Console
- Check browser console for errors
- Restart your development server after adding the API key

### API quota exceeded

- Google provides 28,000 free requests per month
- Monitor usage in Google Cloud Console
- Consider implementing server-side caching for production

### Postal code validation failing

- Check that the correct country is selected
- Verify the postal code matches the country's format
- See the format examples in the table above

## Cost Considerations

**Free Tier:**
- Google Places Autocomplete: Free for first 28,000 requests/month
- After that: $2.83 per 1,000 requests

**Recommendations:**
- Use autocomplete only on checkout page (not on all forms)
- The implementation already restricts requests by country
- Monitor usage in Google Cloud Console
- Set up billing alerts

## Alternative Solutions

If you prefer not to use Google Maps API, you can:

1. **Manual validation only**: The system works without the API, just without autocomplete
2. **Use a different provider**:
   - [Loqate](https://www.loqate.com/)
   - [Mapbox](https://www.mapbox.com/)
   - [HERE Maps](https://www.here.com/)
3. **Build your own**: Use postal code databases per country

## Security Notes

- ✅ API key is public (safe for client-side use)
- ✅ MUST restrict API key to your domain in production
- ✅ MUST enable only necessary APIs (Places API)
- ✅ Monitor usage to prevent abuse
- ✅ Set up billing alerts

## Support

For issues related to:
- **Google Maps API**: [Google Maps Support](https://developers.google.com/maps/support)
- **This implementation**: Check browser console for errors
