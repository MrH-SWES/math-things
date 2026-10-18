# Protected Teaching Table gateway (staged, not live)

The source on this branch implements a Cloudflare Worker that protects **all** `/apps/teaching-table/*` requests with a cryptographically verified Cloudflare Access application JWT, including `/apps/teaching-table/books/*.epub`. Other Math Things routes remain public.

The nine i-Ready EPUBs are kept in **private** GitHub repository `MrH-SWES/teaching-table-books` as Git LFS objects. The Worker retrieves the LFS pointer, asks the authenticated GitHub LFS batch endpoint for a time-limited download action, and streams the binary body to the authorized browser. No book binary, access token, or signed download URL is embedded in this public source repository.

## What an operator must configure (requires Cloudflare access)

1. In Cloudflare Zero Trust, create a **self-hosted Access application** that protects the host and path `/apps/teaching-table/*`, including the base path without a trailing slash. Restrict Allow policy to the specific authorized staff identities or district-managed identity provider. Review district and publisher authorization before deployment. An Access login alone is insufficient without an appropriately restrictive policy.
2. Set Worker **plaintext environment variables**:
   - `ACCESS_TEAM_DOMAIN`: the actual team domain, e.g. `district-team.cloudflareaccess.com`, without `https://`.
   - `ACCESS_AUD`: the Access application audience tag (AUD) for this specific self-hosted application.
3. Create a **read-only, repository-scoped** GitHub credential with access only to `MrH-SWES/teaching-table-books` and read access to repository contents/LFS. Store it as a **Cloudflare Worker secret** named `GITHUB_BOOKS_READ_TOKEN`. Do **not** commit it, add it to plaintext vars, paste it into chats, or expose it in client JavaScript. Verify the chosen GitHub credential supports Git LFS download authorization.
4. Deploy this branch **to an access-controlled test Worker**, not the existing public production Worker. The `wrangler.jsonc` routes Teaching Table URLs through `worker/private-teaching-table.mjs` *before* static assets are served. Do not merge this draft PR into the production site until an authenticated test passes. Avoid a CI deployment that bypasses these settings.
5. Test with one authorized account and one unauthenticated browser. Verify an authorized Grade 4 EPUB returns actual binary ZIP/EPUB data, while unauthenticated requests for both the page and textbook return Access denial or Worker HTTP 403. Verify that public Math Things pages work as before.
6. Repeat for the other grades, confirm epub.js renders actual lesson contents and embedded assets, and test reload/IndexedDB cache.
7. After a successful verified deployment, retire the temporary OAuth and GitHub credentials on Cecily's box and remove the temporary textbook transfer directory. Keep original school-authorized source files in district Drive.

## Routing and security behavior

- JWT claims must match the configured Cloudflare Access issuer and application AUD, be current, and pass **RS256 signature verification** against Cloudflare Access published public keys.
- Missing/invalid auth fails closed with HTTP 403. Missing GitHub secret fails closed with 503. Arbitrary book filenames and unknown grades return 404.
- Only the nine expected book names are allowed. Each LFS pointer must include the expected publisher file size and SHA-256 OID.
- All protected responses use `Cache-Control: private, no-store`; browser-side IndexedDB book caching is handled by the existing Teaching Table loader.
- Book requests are streamed without buffering the ~100–260 MB EPUB in Worker memory. This **does not** bypass GitHub LFS bandwidth quotas, API limits, or publisher licensing restrictions.
- Because LFS pointers are only ~134 bytes in GitHub's source tree, a successful `contents/books` response **does not prove** the corresponding binary object can be downloaded; run an authenticated end-to-end test before relying on the deployment.

## Deployment limitations

No Cloudflare account access or Worker secrets are available through the connected tools in this session. The code is staged in a draft pull request but **has not been deployed, security-reviewed, or tested against actual GitHub LFS downloads**. A mocked local test cannot establish real Cloudflare Access policy correctness or confirm the browser will handle GitHub's LFS rate/stream behavior. Keep the PR unmerged until these checks pass.
