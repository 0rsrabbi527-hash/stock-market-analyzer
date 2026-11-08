# Stock Market Analyzer

A deployable Next.js starter for a personal Adobe Stock research dashboard.

## Included
- Responsive analytics dashboard and keyword search UI
- Results table and CSV export
- Apify server-side integration (token is never exposed to the browser)
- Demo mode when API credentials are not configured
- Configurable JSON input passed to your Apify Actor

## Run locally
1. Install Node.js 20+.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add `APIFY_TOKEN` and `APIFY_ACTOR_ID` to `.env.local`.
5. Run `npm run dev` and open http://localhost:3000.

Without API credentials, the app runs in demo mode.

## Connect a real Apify Actor
- Set `APIFY_TOKEN` to your Apify API token.
- Set `APIFY_ACTOR_ID` to `automation-lab/adobe-stock-search-metadata` (or another compatible Actor ID).
- The dashboard default input is configured for `automation-lab/adobe-stock-search-metadata`: `{ "searchTerms": ["{{query}}"], "sortBy": "nb_downloads", "maxItems": 100 }`. The app replaces `{{query}}` with the entered search phrase.
- Change the Actor input JSON in the dashboard settings to match the selected Actor's input schema.
- The Actor must be permitted to retrieve the data you need and should return dataset items as JSON.

## Deploy online
Deploy this folder as a Next.js app on Vercel or another Node.js host. Add `APIFY_TOKEN` and `APIFY_ACTOR_ID` as server-side environment variables in the hosting dashboard, then redeploy.

## Important data limitations
This starter does not scrape Adobe Stock by itself. Real download counts, revenue, contributor metrics, and opportunity scores are only available if your connected Actor returns reliable data for those fields. The dashboard deliberately shows "Not provided" instead of fabricating sales numbers. Respect Adobe Stock and Apify terms and applicable laws.
