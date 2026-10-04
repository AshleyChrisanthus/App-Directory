# App Directory Companion — Chrome Extension

A lightweight Manifest V3 Chrome companion extension that injects an **Add Website** modal directly into any webpage to save bookmarks straight to your local App Directory database.

---

## 🚀 How to Install in Chrome

### Step 1: Build the Extension
In your App Directory project folder, run:
```bash
npm run build:extension
```
*(Or `npm run build:all` to build both the web app and extension).*

### Step 2: Load Unpacked in Chrome
1. Open Google Chrome and navigate to `chrome://extensions/` in your address bar.
2. In the top-right corner, toggle **Developer mode** to **ON**.
3. Click the **Load unpacked** button in the top-left.
4. Select the `extension` folder inside this repository:
   ```
   c:\Antigravity Projects\App Directory\extension
   ```
5. You should now see **App Directory Companion** in your extensions list!

### Step 3: Enable Local File Access (Crucial for `file://` index.html)
Because Chrome restricts extensions from interacting with local `file://` URLs by default:
1. On the **App Directory Companion** extension card, click **Details**.
2. Scroll down and turn **ON** the switch for **Allow access to file URLs**.

---

## 🎯 How to Use

1. **Browse to any website** (e.g., `https://github.com`, `https://news.ycombinator.com`, or any documentation).
2. Press **`Alt + A`** or **`Alt + S`** on your keyboard (or click the 📁 icon in your Chrome toolbar).
   > **Note on Shortcuts**:
   > - `Alt + D` is hardcoded in Chrome to focus the Omnibox / address bar.
   > - `Alt + Shift` is intercepted by Windows to toggle keyboard languages.
   > - Therefore, **`Alt + A`** (Add) and **`Alt + S`** (Save) are used as fast, conflict-free hotkeys that work instantly.
   > - You can also customize your preferred shortcut in Chrome anytime at `chrome://extensions/shortcuts`.
3. The **In-Page Injected Modal** pops up immediately:
   - **Name**: Pre-filled from the page's title.
   - **URL**: Pre-filled from the current address.
   - **Icon**: Automatically detected from the page's favicon / apple-touch-icon.
   - **Description**: Automatically extracted from the page's `<meta name="description">` or `<meta property="og:description">`.
   - **Folder**: Select from your existing App Directory folders.
   - **Categories**: Type to see **interactive autocomplete suggestions** from your existing categories, navigate with `ArrowUp` / `ArrowDown`, and press `Enter` to add!
   - **Favorites**: Toggle the star button.
4. Hit **Save to App** (or press **`Ctrl + Enter`**).
   - Press **`Escape`** or click outside to cancel at any time.

---

## ✨ Automated AI Category Classification

The Companion extension includes an automated **AI Website Taxonomy Classifier** powered by Google Gemini (Free Tier) and an optional Brave Search API fallback:

### ⚙️ Quick Setup (Inside the Modal)
1. Press `Alt + A` on any website to bring up the modal.
2. Click the **⚙️** icon in the modal header (or the `⚙️ Setup AI` button next to Categories).
3. Paste your free Google AI Studio key:
   - Get one free at [Google AI Studio](https://aistudio.google.com/app/apikey) (no credit card required).
4. *(Optional)* Paste a Brave Search API key from [Brave Search API](https://brave.com/search/api/) (2,000 free queries/month) for grounding on sparse/auth-walled pages.
5. Click **Save Settings**.

### 🏷️ How Automated Tagging Works
* **Zero-Click Auto-Classification:** Whenever you open the modal on any webpage, the extension extracts the page's headings, meta tags, schema.org data, and visible text, feeding it to Gemini Flash in ~500ms.
* **Method Attribution Badge:**
  - `✨ AI: Direct DOM`: Inferred directly from the live page text and metadata.
  - `🔍 AI: Brave Search`: Grounded via Brave Search (for sparse landing pages or when forced).
  - Hover or click the badge to view the AI's 1-line taxonomy rationale!
* **New Category Distinction:**
  - If a recommended tag already exists in your directory, it renders as a regular tag chip.
  - If a recommended tag is brand new, it is highlighted as `[ ✦ NEW: TagName ✕ ]` with a clear notice.
* **Instant Continuity:** Saving any website with a new category immediately syncs it to the extension's cached categories, so it is automatically included in the prompt for all subsequent websites!
* **Manual Re-Run / Force Search:** Click the `↻` button to re-run AI tagging, or `Alt+Click` `↻` to force Brave Search grounding.

---

## 🔄 How Synchronization Works

- **If your local App Directory (`index.html`) is currently open in a tab:**
  The extension sends the new bookmark directly to that tab. It saves immediately into IndexedDB and refreshes the view in real-time.
- **If your local App Directory is closed:**
  The extension securely queues the bookmark in `chrome.storage.local`. As soon as you open your local `index.html`, it automatically ingests the queued bookmarks and notifies you with a toast!

