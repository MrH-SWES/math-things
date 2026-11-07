# Math Things → Google Sites | first working pilot

**State:** source code is staged on this prototype branch; no Google Apps Script deployment or Google Site is created by this GitHub commit.

## What is in the pilot
- A Math Things launcher (Home.html).
- Real, intact Array Architect and Ten Frame code, ported from the Math Things apps by removing only the relative GitHub-pages homepage helper script.
- Google Apps Script routes: `/exec` and `/exec?app=array-architect`, `/exec?app=ten-frame`.
- No Google Sheets registry, student login, scoring, or learner data. Keep the initial pilot small.

## Deploy in the district Google account (one-time)
1. Open [Apps Script](https://script.google.com/) while signed into the district account and create `Math Things — Sites Pilot`.
2. Add `Code.gs`, `Home.html`, `App_ArrayArchitect.html`, `App_TenFrame.html`, and `appsscript.json` from this folder. For many files, use the official `clasp` CLI with the project script ID if approved by IT.
3. Deploy > New deployment > type **Web app**. Execute as the project owner; restrict access to the intended district audience, with no student records stored.
4. Open the generated `/exec` address in the browser. Make sure BOTH cards open actual manipulatives, not the old GitHub Pages URLs.
5. Test the `/exec` link as a district student account on a managed Chromebook.
6. In district [Google Sites](https://sites.google.com/), create a Site; Pages > + > **Full page embed**; paste the deployed `/exec` URL. Publish and test the published Site.
7. Remove/compact the Sites header and native navigation using supported editor options only.

## Important caveats
- We do not currently have a connected tool to create the Google Site or deploy Google Apps Script automatically. Those steps require an authenticated district Google user.
- GitHub is source control **only**. Do not embed `github.io` as the hosted activity.
- Apps Script and Google Sites are distinct Google services; district policy must explicitly allow the former.
- The original math app markup still requests **Google Fonts**. If zero network dependencies are required, replace the fonts with local system fallbacks.
- Apps Script iframe containment can affect touch gestures and resizing. QA on Chromebooks is a release gate.
- The apps contain no student-specific data. Never put IEP information, credentials or student records in public or anonymous app files.

## Next
After actual student-account QA passes: add Volume Space, audit its Three.js import dependencies, add app registry and single-command `clasp` deployment, then fork the layout for Kerry’s classroom.
