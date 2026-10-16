# Private i-Ready textbook deployment

The Teaching Table loader fetches publisher EPUBs from `./books/<filename>.epub` on the **same origin** as the app. It loads a selected grade on demand and caches the EPUB in IndexedDB. No Google Drive sign-in is used.

## Deployment boundary

**Do not deploy the books to the public GitHub Pages site.** Making a GitHub repository private is not equivalent to making its built website or static assets private. The public Math Things application must remain free of licensed textbook binaries. Deploy the Teaching Table and `books/` together on a separately access-controlled site, behind school-staff authentication or an approved private server. Protect **both** the HTML application and all `/books/` URLs with the same authorization rules. A browser session that can access the Teaching Table must be able to fetch the EPUB files.

## Book files

`apps/teaching-table/books/` must contain these exact filenames in the protected deployment:

- `iRCM0K_NN_EN_SW.epub`
- `iRCM01_NN_EN_SW.epub`
- `iRCM02_NN_EN_SW.epub`
- `iRCM03_NN_EN_SW.epub`
- `iRCM04_NN_EN_SW.epub`
- `iRCM05_NN_EN_SW.epub`
- `iRCM06_NN_EN_SW.epub`
- `iRCM07_NN_EN_SW.epub`
- `iRCM08_NN_EN_SW.epub`

These 9 files total approximately 1.66 GiB. Each file exceeds GitHub's 100 MiB normal git blob limit. A private Git LFS repository can store the binaries but deployment must fetch the **actual** EPUB bytes; do not deploy Git LFS pointer files. GitHub Pages is not a substitute for protected file hosting.

The original EPUBs are presently stored in district Google Drive. Move them into a permitted, school-authorized private storage/deployment workflow only after checking the textbook license, district policy, Git LFS quota, and hosting limits. Don't put publisher EPUBs, private credentials, or student records in the public source repository.

## Smoke test

1. In an authenticated staff browser, open the protected Teaching Table and select Grade 4.
2. Confirm the network request `.../apps/teaching-table/books/iRCM04_NN_EN_SW.epub` succeeds and delivers binary ZIP/EPUB data (not HTML, an LFS pointer, or a login screen).
3. Confirm the lesson table of contents and embedded images render correctly, then refresh and confirm the cached copy opens.
4. Open the same `books/` URL in an unauthenticated/private browser and verify it is denied.
5. Test an uncached grade and repeat with a colleague's authorized account. Check private hosting, download size and caching capacity.

Until files are provisioned and the protected host is configured, the loader is code-only and the grade selections will return 404 on an unprovisioned deployment.
