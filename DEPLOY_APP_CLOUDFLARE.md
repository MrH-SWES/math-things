# Math Things app migration to Cloudflare (staged)

Target: **https://app.maththingsedtech.com/**. The existing company homepage at **https://maththingsedtech.com/** stays on its separate Worker. The full public Math Things application suite is hosted from this repository's root; the Teaching Table is the sole protected path.

## 1. Wire up an independent Worker

In the Cloudflare dashboard, open **Workers & Pages** and create/import a Worker from GitHub repository `MrH-SWES/math-things`. Select the staged `feature/teaching-table-private-epub-loader-20261016` branch for a test deployment if supported; do not link the existing `jolly-...` company homepage Worker to this repository. Configure the build to deploy with **Wrangler**, using this branch's `wrangler.jsonc`. The Worker name is `math-things-app`.

This configuration declares `app.maththingsedtech.com` as a custom domain, which requires Cloudflare control of that DNS zone. Review the custom domain association in the dashboard. If Cloudflare cannot attach the custom domain automatically, configure the Worker domain under **Settings → Domains & Routes → Add → Custom Domain**. Do not repurpose or replace the existing apex-domain Worker.

**Important:** Cloudflare access to the account and deployment credentials is required to execute this; adding source files to GitHub does **not** deploy the Worker.

## 2. Retarget the existing Access application

In **Zero Trust → Access controls → Applications**, edit **Math Things - Teaching Table**.

Change its public hostname from `maththingsedtech.com` to `app.maththingsedtech.com` (subdomain `app`, domain `maththingsedtech.com`), keeping path `apps/teaching-table`. Leave the two exact-email Allow policies (staff and approved substitutes) and One-time PIN authentication in place. Confirm the policy protects both the root and all nested paths, including `/apps/teaching-table/books/`.

Protecting the app URL in Access does **not** publish the app or upload textbooks. Policy applies only if Cloudflare routes the hostname through the protected Access application.

## 3. Set the Worker configuration (before testing the protected route)

In **Workers & Pages → math-things-app → Settings → Variables and Secrets**, add:

- `ACCESS_TEAM_DOMAIN` — your Cloudflare Zero Trust team domain, e.g. `your-team.cloudflareaccess.com`, without `https://`.
- `ACCESS_AUD` — the Application Audience (AUD) Tag from the Teaching Table Access application, as an ordinary environment variable.
- `GITHUB_BOOKS_READ_TOKEN` — **Secret**, a GitHub fine-grained token restricted to the private `MrH-SWES/teaching-table-books` repository, with read-only contents access and Git LFS download permission. Do not paste this token into chat or put it in GitHub source.

Until these values are populated, the Teaching Table Worker denies requests. The private textbook binaries remain outside the public repository.

## 4. Confirm both public and protected routes

1. Open `https://app.maththingsedtech.com/` in a private/incognito window: the Math Things app homepage should load **without** staff login.
2. Open a public app such as `https://app.maththingsedtech.com/apps/array-builder/`: it should load.
3. Open `https://app.maththingsedtech.com/apps/teaching-table/`: it should request Cloudflare Access authentication.
4. Confirm an approved staff email and a preapproved substitute email can sign in by One-time PIN.
5. Confirm an unapproved email cannot sign in. From an entirely unauthenticated session, direct requests to `/apps/teaching-table/index.html`, `/apps/teaching-table/curriculum.js`, and `/apps/teaching-table/books/iRCM04_NN_EN_SW.epub` must all fail authentication.
6. Sign in as an approved user and load the Grade 4 textbook. Confirm the browser receives ZIP/EPUB data (not an HTML login page or a 134-byte Git LFS pointer); inspect the lesson table of contents, render images, then reload to check IndexedDB caching. The original Grade 4 EPUB is 113912690 bytes.
7. Only after all checks pass, finalize the PR and the production deployment. Explicitly review any district/publisher permissions needed for substitute access and storage.

## Safety boundaries and limitations

- Public GitHub Pages remains separate and does not contain licensed book files. The protected Worker proxies private Git LFS responses; it is not a public textbook mirror.
- Worker static assets have an individual file-size limit; none of the EPUBs should be added to Workers Static Assets.
- Cloudflare Access policy protection and server-side JWT verification must *both* function; source code by itself is not sufficient evidence of a secure deployment.
- GitHub LFS serves large binary assets subject to bandwidth/quota constraints. The streaming proxy requires an end-to-end test and may need adjustment if GitHub limits download throughput.
- This configuration is staged in a **draft pull request**, not deployed to the custom hostname. No claim of working production textbook delivery is warranted before the smoke tests.
