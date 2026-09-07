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

1. **Browse to any website** (e.g., `https://github.com`, `https://news.ycombinator.com`, or any docs).
2. Press **`Alt + D`** on your keyboard (or click the 📁 icon in your Chrome toolbar).
3. The **In-Page Injected Modal** pops up immediately:
   - **Name**: Pre-filled from the page's title.
   - **URL**: Pre-filled from the current address.
   - **Icon**: Automatically detected from the page's favicon / apple-touch-icon.
   - **Folder**: Select from your existing App Directory folders.
   - **Categories**: Select from existing tags or type new ones and press `Enter`.
   - **Favorites**: Toggle the star button.
4. Hit **Save to App** (or press **`Ctrl + Enter`**).
   - Press **`Escape`** or click outside to cancel at any time.

---

## 🔄 How Synchronization Works

- **If your local App Directory (`index.html`) is currently open in a tab:**
  The extension sends the new bookmark directly to that tab. It saves immediately into IndexedDB and refreshes the view in real-time.
- **If your local App Directory is closed:**
  The extension securely queues the bookmark in `chrome.storage.local`. As soon as you open your local `index.html`, it automatically ingests the queued bookmarks and notifies you with a toast!
