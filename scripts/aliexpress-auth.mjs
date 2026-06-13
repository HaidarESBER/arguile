// ----------------------------------------------------------------------------
// AliExpress Open Platform — one-time OAuth helper (Dropshipping / DS track)
//
// Mints the access_token + refresh_token the DS APIs require. Run it twice:
//
//   1) Print the authorization URL (open it in your browser, log in, Authorize):
//        node --env-file=.env.local scripts/aliexpress-auth.mjs
//
//   2) After authorizing you land on your callback URL with `?code=XXXX` in the
//      address bar. Copy that code and exchange it for tokens:
//        node --env-file=.env.local scripts/aliexpress-auth.mjs XXXX
//
//   The printed access_token / refresh_token go into .env.local as
//   ALIEXPRESS_ACCESS_TOKEN / ALIEXPRESS_REFRESH_TOKEN.
//
// Requires in .env.local: ALIEXPRESS_APP_KEY, ALIEXPRESS_APP_SECRET,
// ALIEXPRESS_CALLBACK_URL (must match the callback registered in the app).
// ----------------------------------------------------------------------------

import crypto from "node:crypto";

const BASE = "https://api-sg.aliexpress.com";
const TOKEN_PATH = "/auth/token/security/create"; // IOP /rest system endpoint

const APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;
const CALLBACK = process.env.ALIEXPRESS_CALLBACK_URL;

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!APP_KEY || !APP_SECRET) {
  fail(
    "ALIEXPRESS_APP_KEY and ALIEXPRESS_APP_SECRET must be set.\n" +
      "  Run with:  node --env-file=.env.local scripts/aliexpress-auth.mjs"
  );
}

/**
 * IOP signature: sort params by key (ASCII asc), concat key+value with no
 * separators, prepend the API path, then HMAC-SHA256 with the app secret,
 * hex, uppercase.
 */
function sign(path, params) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  const base = path + sorted;
  return crypto
    .createHmac("sha256", APP_SECRET)
    .update(base, "utf8")
    .digest("hex")
    .toUpperCase();
}

const code = process.argv[2];

// -------- Step 1: no code yet → print the authorization URL --------
if (!code) {
  if (!CALLBACK) fail("ALIEXPRESS_CALLBACK_URL must be set (must match the app's registered callback).");
  const authUrl =
    `${BASE}/oauth/authorize?response_type=code&force_auth=true` +
    `&client_id=${encodeURIComponent(APP_KEY)}` +
    `&redirect_uri=${encodeURIComponent(CALLBACK)}`;
  console.log(
    `\nStep 1 — open this URL in your browser, log in to the AliExpress\n` +
      `account you dropship with, and click Authorize:\n\n${authUrl}\n\n` +
      `You'll be redirected to:\n  ${CALLBACK}?code=XXXX...\n\n` +
      `Copy the value of "code" from the address bar, then run:\n` +
      `  node --env-file=.env.local scripts/aliexpress-auth.mjs <code>\n`
  );
  process.exit(0);
}

// -------- Step 2: exchange the code for tokens --------
const params = {
  app_key: APP_KEY,
  code,
  sign_method: "sha256",
  timestamp: Date.now().toString(), // epoch millis (IOP gateway)
};
params.sign = sign(TOKEN_PATH, params);

const url = `${BASE}/rest${TOKEN_PATH}?${new URLSearchParams(params).toString()}`;

console.log(`\nExchanging code for tokens…\n`);

const res = await fetch(url, { method: "POST" });
const text = await res.text();

let json;
try {
  json = JSON.parse(text);
} catch {
  fail(`Non-JSON response (HTTP ${res.status}):\n${text}`);
}

// Surface the full payload so we can see exact field names / errors.
console.log("Raw response:\n" + JSON.stringify(json, null, 2) + "\n");

const accessToken = json.access_token || json.data?.access_token;
const refreshToken = json.refresh_token || json.data?.refresh_token;

if (!accessToken) {
  fail(
    "No access_token in response. If you see an InvalidSignature / IncompleteSignature\n" +
      "error, the signing variant needs adjusting — paste the raw response above back to Claude."
  );
}

console.log(
  `✓ Success — add these to .env.local:\n\n` +
    `ALIEXPRESS_ACCESS_TOKEN=${accessToken}\n` +
    (refreshToken ? `ALIEXPRESS_REFRESH_TOKEN=${refreshToken}\n` : "") +
    `\n`
);
