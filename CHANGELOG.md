# Changelog

## Version 2.1.0 (Current) - 2026-07-01

### General Statistics Dashboard
- Implemented a "General" versus "Specific" toggle within the Statistics tab.
- Added six new aggregate charts to the General view: Total Credits Over Time (Line), New Credits Per Year (Bar), Manufacturer Breakdown (Donut), New Credit Manufacturer Breakdown (Donut), Park Breakdown (Donut), and New Credit Park Breakdown (Donut).
- Integrated dynamic data binning for donut charts, restricting display to the top 5 or 10 entities and grouping remaining data into an "Other" slice. 
- Added an interactive tooltip to the "Other" slice to display the hidden sub-item breakdown.

### Batch Chart Export
- Integrated `JSZip` library to enable batch file archiving.
- Added a download button to the General tab that processes and exports all six charts simultaneously into a compressed `.zip` archive.
- Standardized export resolution and aspect ratios across all devices to prevent mobile legend clipping and canvas compression.

### Stability and Rendering Optimization
- Implemented an asynchronous `fetchWithRetry` loop during application initialization to mitigate empty page loads caused by CDN propagation delays for database JSON files.
- Fixed a Chart.js rendering glitch where canvases initialized with 0px dimensions when toggling between hidden tab views.
- Resolved a post-export rendering glitch where chart titles and legends lost their custom font configurations.

---

## Version 2.0.0 - 2026-06-01

### Major Architectural Overhaul
- **Hybrid Serverless Architecture:** Extracted the massive embedded coaster arrays from the main HTML file into separate `master_coasters.json` and `thomas_tracker_profile.json` files. This drastically reduces the size of `index.html` and eliminates blank-page load failures on mobile browsers.

### Mobile Interaction & Drag-and-Drop
- **Drag Handle Targeting:** Mobile drag-and-drop on the Rankings tab now correctly only triggers when interacting with the dedicated grip handle, preventing accidental drags when tapping cards.
- **Placeholder Pattern:** Implemented a dashed placeholder box during mobile dragging to prevent the browser from killing touch events and leaving cards "floating" unresponsive on the screen.
- **Overscroll Fix:** Fixed a visual glitch on mobile (especially iOS Safari) where rapid scrolling/rubber-banding exposed a bright white background. The HTML root now seamlessly matches the app's dynamic dark/light background gradients.

### Data Persistence & Editing Fixes
- **Manufacturer Autocomplete:** Converted the Manufacturer field in the "Add/Edit Credit" modal from a static dropdown to a free-text input with dynamic autocomplete, allowing for entirely new, custom manufacturers.
- **Custom Coaster Persistence:** Fixed a major bug where manually added custom coasters vanished upon page refresh. Custom coasters are now unconditionally saved to the `userProfile.customCoasters` object and persisted safely in local storage.
- **Default Coaster Edits:** Fixed a data-loss bug where editing the details (like Manufacturer or Status) of a default database coaster failed to save across reloads. These edits are now saved as custom overrides.
- **Duplicate Ranking Fix:** Fixed an issue where editing an existing coaster's ranking bypassed the adjustment math, creating duplicate rankings. The list now dynamically shifts other coasters up or down to make room when editing a rank.
- **Automated Merging:** Added logic to seamlessly merge custom coasters from imported JSON files back into the master dictionary upon load.

### UI & Quality of Life
- **Rankings Tab Styling:** Carried over the green ("New Credit") and red ("Defunct") card border and background stylings to the Rankings tab for better visual consistency across the app.
- **Smart Export Filenames:** Exporting data now automatically appends the current date (e.g., `thomas_tracker_profile_2026-06-01.json`) to the filename to help organize backups chronologically.

---

## Version 1.3.15 - 2026-03-10

### Improvement: Human-Readable Export Format for Overrides
- Previously, the `overrides` section of exported JSON files used raw numeric `m` index keys (e.g. `"35": { "Ranking": "5" }`), which were opaque and fragile — if coasterBase indices ever shifted, imported overrides would silently apply to the wrong rides
- Exported `overrides` now use `"Ride|||Park"` composite keys (e.g. `"Diamondback|||Kings Island": { "Ranking": "35" }`), making the file self-documenting and identity-stable
- On import, `"Ride|||Park"` keys are resolved back to the current `m` index at import time, so overrides always land on the correct coaster regardless of any index changes
- Full backward compatibility: v1 export files that still use numeric keys are detected and imported as-is
- Export `_version` bumped from `1` to `2` to reflect the format change

---

## Version 1.3.14 - 2026-03-10

### Bug Fix: Duplicate Rankings After Delete
- Adding a coaster with a specific Ranking and then deleting it caused multiple coasters to share the same Ranking value
- Three known duplicate pairs had formed in the live dataset: Diamondback/Hagrid's (both #35), Raptor/Great Bear (both #41), El Loco/Lightning Run (both #80)
- Root cause: the cascading rank-shift logic (bump up on add, shift down on delete) was correct in isolation but could accumulate small inconsistencies across localStorage round-trips between sessions
- Fix: added `normalizeRankings()` — re-sorts all ranked coasters by their current value and reassigns them sequentially (1, 2, 3…), making duplicates structurally impossible
- `normalizeRankings()` is called after every ranking mutation: add, edit (all branches), and delete
- Also called during `init()` and `switchYear()` after `applyOverrides()`, so the three existing duplicate pairs are healed automatically on next page load without any user action required

---

## Version 1.3.13 - 2026-02-24

### Bug Fix: Delete Collision on Duplicate Ride Names
- Deleting a ride removed ALL rides sharing that name across all parks (e.g., deleting "Batman The Ride" at Six Flags Great Adventure also deleted "Batman The Ride" at Six Flags Magic Mountain)
- Root cause: `saveDeleted()` stored only ride name; `filterDeleted()` matched on ride name alone
- Fix: Delete system now uses composite `Ride|||Park` keys for both storage and filtering
- 14 duplicate ride names affecting 29 entries are now safe to delete individually
- Backward compatible: old name-only localStorage entries harmlessly fail to match, causing deleted rides to reappear (user can re-delete to store the correct composite key)

### Bug Fix: Deleted Rides Leaking into Over Time Charts
- `filterDeleted()` only removed rides from `AppState.coasters`, not from `YearData.datasets`
- Deleted rides still appeared in Over Time chart top-N candidates, individual ride data, and yearly averages
- Deleted rides were also searchable and selectable in the Over Time ride search
- Fix: Added `Persistence.getDeletedIndices()` helper that maps deleted `Ride|||Park` keys to base indices
- `getFilteredTopRides()`, `getRideDataByIndex()`, `getYearlyAverages()`, and ride search dropdown now all filter by deleted index set

### Bug Fix: 2026 Overrides Bleeding into Past Year Views
- `applyToCoasterBase()` mutated the shared `coasterBase` array with 2026 user edits (Status, Last Ride, Type, Opening Year)
- `mergeWithBase()` spread from the same mutated `coasterBase`, so switching to any past year showed 2026 values for overridden fields
- Fix: `mergeWithBase(yearEntries)` → `mergeWithBase(yearEntries, year)` — now year-aware
- For non-2026 years, restores the four mutable base fields from `Persistence._originalBase` snapshot
- 2026 behavior unchanged; past year views now always reflect original compiled data

### Data Fix: Truncated Last Ride Fields
- Thunderbolt @ Kennywood: `lr:"204"` → `lr:"2024"`
- Cedar Creek Mine Ride @ Cedar Point: `lr:"204"` → `lr:"2024"`

### Data Fix: Category Whitespace
- Trimmed trailing space from Wing Coaster category (`"Wing Coaster "` → `"Wing Coaster"`)
- Affected Gatekeeper @ Cedar Point

---

## Version 1.3.12 - 2026-02-23

### Bug Fix: Data Corruption on Add Credit
- Fixed three root causes of data corruption when adding new credits:
  1. `syncAllToYearData()` was syncing all fields after ranking cascades — replaced with `syncRankingsToYearData()` which only syncs Rankings
  2. `Persistence.applyToCoasterBase()` was incorrectly called on every submit — now only runs during init/year-switch
  3. `Persistence.save()` was creating false overrides for user-added rides — added guard to skip user-added rides in overrides loop
- Users should clear `coasterOverrides2026` from localStorage to purge any previously corrupted overrides

### Data Fix: Racer at Kennywood Category
- Changed "Racer" at Kennywood from "Woodie" category to "Wooden Coaster"
- Removed unused "Woodie" category from category list

### Card Layout: Manufacturer Row Alignment
- Single-line manufacturer values now vertically align with two-line manufacturer values on credit cards
- Applied consistent min-height to manufacturer row for uniform card appearance

---

## Version 1.3.11 - 2026-02-22

### Rating Chart Y-Axis Minimum
- Comparison and Over Time charts in Rating mode now start at 1 instead of 0
- Applies to chart initialization, dynamic updates, and both Over Time code paths
- `beginAtZero` set to `false` for all Rating chart contexts

### Multi-Sort Table (Up to 3 Columns)
- Clicking a column header adds it to a sort stack (up to 3 active sorts)
- Clicking an already-sorted column toggles its direction (asc ↔ desc)
- Adding a 4th sort evicts the oldest sort (FIFO)
- Most recently clicked column is the primary sort; earlier sorts act as tiebreakers
- Priority badges (superscript ¹²³) appear on sorted headers when 2+ sorts are active
- Single-sort behavior unchanged (no badge shown)

### Bug Fix: Refresh Button with Multi-Sort
- Refresh button now resets `AppState.sort` to `[]` instead of the old single-sort object format
- Previously caused errors when multi-sort was active

### Ranking Sort: Empty Values Last
- Sorting by Ranking or Weighted Ranking now pushes empty/unranked coasters to the bottom
- Applies in both ascending and descending directions
- Ranked coasters (1–N) sort normally among themselves

### Comparison Chart: Wrapped X-Axis Labels
- Long coaster names now wrap across multiple lines instead of truncating with "..."
- Word-boundary wrapping at 20-character line limit
- Uses Chart.js native array label rendering
- Tooltips still display full ride names

### Comparison Chart Export: Reduced X-Axis Font
- X-axis label font size reduced by 2 base points on export (11pt → 22px at 2× scale)
- Over Time chart export font sizes unchanged

### Over Time Chart: Default Toggle Flipped
- "Ride / Filters" toggle now defaults to "Filters" instead of "Ride"
- Filters panel shown on load; Ride search panel hidden

### Deployment Updates
- Updated PWA icons (icon-192.png, icon-512.png) with new coaster silhouette design
- Added service worker (sw.js) for offline caching support
- Service worker registration added to index.html
- Updated manifest.json with corrected theme colors and maskable icon purpose
- Added apple-touch-icon link

---

## Version 1.3.9 - 2026-02-19

### Font Size Refinements (Desktop & Mobile)
- Card exterior: title 23px, park 20px, ranking badge 20px, detail rows 17px, rating number 22px, status badge 13px
- Detail modal: title 25px, labels 14px, values 15px, comments 16px
- Credits tab: Add Credit/Filters buttons 15px, filter labels/selects 15px
- Stats tab: toggle buttons ~14.6px, Top 5/10/15 buttons 15px, filter labels/selects 15px
- All font sizes now explicitly declared in mobile media query to ensure propagation

### Mobile Layout Spacing
- Credits/Avg stat boxes reduced 20%: font 1rem, padding 0.6rem 0.4rem, border 2.4px, gap 0.6rem
- `autoFitStatBoxes()` caps at 16px on mobile (down from 20px)
- Header row gap increased to 1.5rem (matching spacing between stat boxes and tabs)

### Stats Toggle Formatting
- "Over Time" text no longer wraps: `white-space: nowrap` on `.chart-type-btn`
- Toggle container widened from 17rem to 19rem for proper centering

### Over Time Chart Export: Legend Centering
- Legend items use `flexBasis: auto` and fixed 50px horizontal gap instead of percentage-based widths
- Legend canvas centered without pixel offset
- `justify-content: center` now works correctly during export capture

### Over Time Export Filename Convention
- Over Time chart exports now append `-over-time` before `.png` (e.g., `top-10-intamin-coasters-over-time.png`)
- Comparison chart filenames unchanged

### Bug Fix: Filters Not Updating After Delete
- All filter dropdowns (Park, Manufacturer, Category, Type) across Credits, Stats Comparison, and Stats Over Time tabs now repopulate after deleting a coaster
- Previously, deleted parks/manufacturers could remain in filter options

### Bug Fix: Edits to Status/Type/Last Ride/Opening Year Not Persisting
- Root cause: `applyToCoasterBase()` mutated `coasterBase` on load, so subsequent `save()` compared current values against already-mutated base and found no difference
- Fix: `snapshotBase()` captures original base field values before any overrides are applied; `save()` compares against the snapshot instead of the mutated `coasterBase`
- Affects all non-EDITABLE_FIELDS overrides: Status, Last Ride, Type, Opening Year

### Bug Fix: Stats Charts Not Reflecting Ranking Changes
- Tab switch to Stats now resizes and updates both Comparison and Over Time charts
- Chart sub-tab toggles (Comparison ↔ Over Time) now trigger chart refreshes
- `recalculateWeightedRankings()` moved before chart updates in edit flow
- Fixes stale ranking data appearing in charts after editing in Credits tab

---

## Version 1.3.8 - 2026-02-18

### Bug Fix: User-Added Rides in Charts
- Newly added rides now properly appear in both Comparison and Over Time charts
- Added `registerUserRide()`, `unregisterUserRide()`, and `syncRideToYearData()` helpers to sync user rides across `coasterBase`/`yearData2026` data layers
- Charts now refresh immediately after add/edit/delete operations
- Fixed weighted ranking recalculation to avoid double-counting user rides

### Bug Fix: Overrides Not Reaching Over Time Charts
- `Persistence.applyOverrides()` now syncs Rating, Ranking, and Comments to `yearData2026` entries (not just `AppState.coasters`)
- Previously, edited ratings/rankings were correct in Credits and Table tabs but stale in Stats charts
- Added `syncAllToYearData()` bulk sync to catch cascading ranking shifts after add/edit/delete operations
- Rides that gained a rating or ranking via edit now appear in Over Time Filters charts immediately

### Over Time Filters Chart: Stagger for Overlapping Data Points
- Data points sharing the same rating value are now vertically staggered so clusters are visible
- ±0.02 offset for clusters of 2–3 rides, ±0.01 for clusters of 4+
- Tooltips still display the true (unstaggered) value
- No stagger applied to single data points at a given value

### Rating Tooltip Precision
- All charts displaying "Rating" now show values to two decimal places (was one)
- Applies to Comparison chart, Over Time (Filters, Ride, and Averages views)

### Over Time Filters Chart: Legend Color Picker
- Clicking a legend swatch opens a 64-color selection palette (8×8 grid)
- Selected color updates the dataset line, points, and legend swatch instantly
- Color overrides persist across Top N toggle, filter changes, rating/ranking mode, and weighted ranking checkbox
- Overrides are keyed by ride identity (coasterBase index), not display position
- Picker auto-positions to stay within viewport; click-outside to dismiss
- Legend swatches show hover effect (scale + border) to signal interactivity

### Data Export / Import
- New 📤 Export and 📥 Import buttons in the header
- Export downloads a JSON file containing user-added rides, field overrides, and deleted rides
- Import reads the JSON, shows a confirmation summary, writes to localStorage, and reloads
- Enables syncing data changes across machines or browsers
- Desktop layout: Export/Import stacked vertically, aligned with Credits/Avg boxes
- Mobile layout: Export pinned left, Import pinned right, Year selector centered between them

### Modal UX Improvements
- Background blur (4px) applied when any modal is open (detail card, add/edit form, comments)
- Background scroll is locked while a modal is open; scroll position restored on close
- Status badge text now centered within its colored pill on both mobile and desktop

### Mobile UI Improvements
- Export/Import buttons and Year selector scale down to 0.9rem with tighter padding on mobile
- Tab buttons (Credits, Stats, Table) scale to 0.9rem on mobile (≤768px), smaller still on ≤480px
- Title font now uses Comic Neue (Google Font) as fallback for Android devices lacking Comic Sans MS
- Table tab: Refresh button moved below filter toggles to prevent column stacking on narrow screens

---

## Version 1.3.7 - 2026-02-10

### Mobile Loading & Reliability
- Deferred script execution to prevent blank page on mobile browsers (Chrome, Samsung Internet)
- Improved initial load reliability for the ~630KB single-file app

### Card UI Improvements
- Increased font size for Manufacturer, Type, and Status fields by 3px on cards (desktop & mobile)
- Detail modal maintains two-column layout on mobile

### Table Tab Improvements
- Constrained Ride column width on mobile (`max-width: 120px`) to prevent it from dominating viewport
- Tighter padding and smaller fonts for mobile table readability
- Rating/Ranking cells scaled down from 21px to 16px on mobile
- Comments column `min-width` reduced from 500px to 300px

### Sub-Toggle Styling
- Over Time sub-toggles (Ride|Filters, Rating|Ranking) now width-sync with parent Comparison|Over Time toggle
- Added `flex: 1` and `text-align: center` to sub-toggle buttons for even spacing

### Samsung Internet Compatibility
- Added `color-scheme: dark light` meta tags and CSS declarations to prevent Samsung Internet Night Mode from overriding app theming

### Data & Chart Fixes
- User-added coasters now properly appear in Over Time charts via `registerInBase()`
- `syncYearData()` keeps `yearData2026` in sync after add/edit/delete/rank operations
- Comparison chart sorts ranked coasters by ranking ascending (#1 first), then unranked by rating descending
- New coasters now appear in the Table tab after being added
- Replaced old "prepend saved coasters" approach with `mergeWithBase()` flow

### Deployment
- Added app icon (icon-192.png, icon-512.png) for PWA home screen
- Added apple-touch-icon support for iOS

---

## Version 1.1.17 - 2026-02-05

### Mobile PNG Export Parity
- Mobile chart downloads now produce identical PNGs to desktop exports
- Forces desktop canvas dimensions (1600px container width) on mobile before export
- Uses desktop baseline font sizes (title: 40px, y-title: 32px, ticks: 28px/26px) on all devices
- Consistent devicePixelRatio (4x) and aspect ratio (16:9) across all devices
- Applies to both Comparison and Over Time sub-tabs

### Legend Export Fixes
- Legend container temporarily set to 1600px on mobile (matching chart container)
- Legend font sizes doubled from 17px to 34px (matching chart's 2x scaling)
- Legend swatch sizes doubled from 12px to 24px
- Legend capture scale increased from 2.5 to 4 (matching devicePixelRatio)
- All legend styles restored after capture

---

## Version 1.1.16 - 2026-02-05

### UI Color Standardization
- Darkened cyan buttons/toggles from `#0891b2` to `#0e7490` for improved legibility
- Applied to all interactive elements: filter-group selects, column toggles, chart type buttons

### PNG Export Improvements
- White background with black text for all chart exports
- Medium gray gridlines (#808080) for better contrast on white background
- Doubled font sizes for chart title, axis titles,