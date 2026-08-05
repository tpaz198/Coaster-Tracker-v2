Coaster Tracker Project State
🏗️ Architecture & Data Model
•	Frontend: Single-file architecture (index.html) containing all HTML, CSS, and JavaScript. 
•	Storage: Data is handled client-side using browser local storage (localforage). 
•	Data Integration: There are no independent yearly .json files for the coaster tracker. The .json files are utilized strictly to integrate changes via the Import/Export functionality. 
•	Master Database: Relies on a master_coasters.json file for baseline coaster metadata, handling custom overrides via differential saves. 
•	Theme & Appearance: The website should always be booted up in dark mode. 
✅ Implemented Features & Recent Fixes
1. Data Table / Spreadsheet Tab
•	Sticky Headers: Fully functional. (Fixed by removing transform: translateZ(0) and will-change: transform to prevent stacking context overrides). 
•	Responsive Scrolling: Implemented a synchronized dual-scrollbar system (upper and lower) tied to the main table wrapper via JavaScript scroll event listeners. 
•	Functionality: Features custom column visibility toggles and multi-level data sorting. 
2. Statistics & Charts (Chart.js)
•	General & Specific Views: Supports robust statistical breakdowns including total credits, manufacturer/park breakdowns, age distributions, and rating vs. age correlation scatter plots. 
•	Chart Exporting: Charts can be downloaded as images (utilizing html2canvas). 
•	Code Correction: The export function relies on chartInstance.resize() (specifically corrected from chart.resize()) to ensure proper rendering before capture. 
3. Rankings & Credits
•	Rankings Tab: Features a drag-and-drop interface for ordering coasters, utilizing the MobileDragDrop polyfill for cross-device compatibility. Includes placeholder rendering and automatic ranking normalization. 
•	Credit Tracking: Supports logging new rides with metadata (rating, status, manufacturer, category, opening year, comments). Distinguishes "New Credits" visually. 
4. Data Import / Export Engine
•	Import Merging Logic: Fixed the JSON import function to perform a deep merge of the imported payload into the existing userProfile object instead of a destructive hard overwrite.
•	Empty Payload Bypass: Added an early exit validation check to prevent completely empty JSON payloads from bypassing error handlers and wiping the established local database.
⚠️ AI Agent Directives (Agy CLI)
•	Context Limit Precaution: Do not attempt to parse, cat, or read the entire index.html file into memory. 
•	Prohibited Tools: Do not use internal Search, Grep, or Read tools to navigate index.html due to chunking limits and pagination loop crashes. 
•	File Modifications: For all text replacements, write and execute a temporary Python script (e.g., apply_changes.py) using re or string.replace to modify the file directly. 
•	Find and Replace Format: When generating code modifications, use a strict 'Find and Replace' text format with sufficient surrounding context lines to uniquely identify the location. 
•	Browser & Testing Directive: The app should always be left open at the end of tests or browser interactions. 
