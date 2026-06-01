# Deployment Notes

## GitHub Pages Deployment

### Initial Setup

1. Create a new public repository on GitHub (e.g., `coaster-tracker`)
2. Clone the repo locally or upload files via the GitHub web interface
3. Ensure the following files are in the repo root:
   - `index.html` — Main application UI and logic
   - `master_coasters.json` — Core database containing default coaster parameters
   - `thomas_tracker_profile.json` — Default/fallback user profile and logs
   - `manifest.json` — PWA manifest for home screen install
   - `sw.js` — Service worker for offline caching
   - `icon-192.png` — App icon (192×192)
   - `icon-512.png` — App icon (512×512)
   - `.nojekyll` — Prevents Jekyll processing on GitHub Pages
   - `README.md` — Repository documentation
   - `CHANGELOG.md` — Version history
4. Go to **Settings → Pages** in the GitHub repo
5. Set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`
6. Save — the site will be live at `https://<username>.github.io/coaster-tracker/` within a couple of minutes

### Updating the App

1. Replace `index.html`, `master_coasters.json`, or `thomas_tracker_profile.json` with the updated versions. Note that updating global coaster stats only requires an update to `master_coasters.json`.
2. If updating the service worker, bump the `CACHE_NAME` version string in `sw.js` (e.g., `coaster-tracker-v3`) to force a cache refresh.
3. Commit and push to `main`
4. GitHub Pages will automatically redeploy (typically within 1-2 minutes)

### Syncing Data Across Machines

User data (custom coasters, custom override details, edited ratings/rankings, deleted rides) is stored in `localStorage` and is local to each browser. To transfer data between machines:

1. Click **📤 Export** in the header to download a JSON file (the file will now auto-append the current date for easy version control).
2. Transfer the file to the target machine
3. Click **📥 Import** and select the file — it will automatically merge custom custom coasters into the master database, overwrite local changes, and reload.

### Adding to Home Screen (PWA)

**Android (Chrome):**
- Visit the site → tap the three-dot menu → "Add to Home screen"
- The app icon (icon-512.png) will be used

**Android (Samsung Internet):**
- Visit the site → tap the menu → "Add page to" → "Home screen"

**iOS (Safari):**
- Visit the site → tap the share button → "Add to Home Screen"
- The apple-touch-icon (icon-192.png) will be used

### Architecture Notes

- The app utilizes a **Hybrid Serverless Architecture**. 
- Base coaster data is fetched asynchronously from `master_coasters.json` rather than being hardcoded into the HTML.
- User data (custom coasters, ratings, rankings) is stored in `localStorage` and falls back to fetching `thomas_tracker_profile.json` on initial load if no local storage is found.
- Chart rendering uses Chart.js (loaded from CDN)
- PNG export uses html2canvas (loaded from CDN)
- Service worker caches core assets for offline use (stale-while-revalidate strategy)
- The app works fully offline once cached by the browser/service worker

### File Size Considerations

The HTML file has been drastically reduced in size in V2.0.0 by extracting the coaster data into external JSON files. This resolves previous issues with blank page loads or timeout errors on resource-constrained mobile browsers (like Samsung Internet).