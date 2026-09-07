"use strict";
(() => {
  // src/extension/modal.css
  var modal_default = ":host {\n  all: initial;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n  color: #f1f5f9;\n  font-size: 14px;\n  line-height: 1.5;\n  box-sizing: border-box;\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.ad-modal-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(10, 14, 23, 0.68);\n  backdrop-filter: blur(8px);\n  -webkit-backdrop-filter: blur(8px);\n  z-index: 2147483647;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n  padding: 16px;\n}\n\n.ad-modal-backdrop.ad-visible {\n  opacity: 1;\n}\n\n.ad-modal-card {\n  width: 100%;\n  max-width: 480px;\n  background: rgba(22, 28, 42, 0.94);\n  backdrop-filter: blur(24px);\n  -webkit-backdrop-filter: blur(24px);\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  border-radius: 16px;\n  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);\n  overflow: hidden;\n  transform: scale(0.94) translateY(8px);\n  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;\n  display: flex;\n  flex-direction: column;\n}\n\n.ad-modal-backdrop.ad-visible .ad-modal-card {\n  transform: scale(1) translateY(0);\n}\n\n/* Header */\n.ad-modal-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px 20px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  background: rgba(255, 255, 255, 0.02);\n}\n\n.ad-modal-title-group {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.ad-app-icon {\n  width: 28px;\n  height: 28px;\n  border-radius: 7px;\n  background: linear-gradient(135deg, #0a84ff, #5e5ce6);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 15px;\n  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.35);\n}\n\n.ad-modal-title {\n  font-size: 16px;\n  font-weight: 700;\n  color: #ffffff;\n  letter-spacing: -0.2px;\n}\n\n.ad-badge-local {\n  font-size: 10px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  background: rgba(52, 199, 89, 0.18);\n  color: #34c759;\n  border: 1px solid rgba(52, 199, 89, 0.3);\n  padding: 2px 6px;\n  border-radius: 4px;\n}\n\n.ad-close-btn {\n  background: transparent;\n  border: none;\n  color: #94a3b8;\n  font-size: 18px;\n  cursor: pointer;\n  width: 28px;\n  height: 28px;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n}\n\n.ad-close-btn:hover {\n  background: rgba(255, 255, 255, 0.08);\n  color: #ffffff;\n}\n\n/* Body Form */\n.ad-modal-body {\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  max-height: 70vh;\n  overflow-y: auto;\n}\n\n.ad-field-row {\n  display: flex;\n  gap: 12px;\n  align-items: flex-start;\n}\n\n.ad-icon-preview-box {\n  width: 44px;\n  height: 44px;\n  border-radius: 10px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  overflow: hidden;\n  margin-top: 22px;\n}\n\n.ad-icon-preview-box img {\n  width: 26px;\n  height: 26px;\n  object-fit: contain;\n}\n\n.ad-form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  flex: 1;\n}\n\n.ad-form-label {\n  font-size: 12px;\n  font-weight: 600;\n  color: #94a3b8;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.ad-input, .ad-select, .ad-textarea {\n  background: rgba(15, 23, 42, 0.65);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 8px;\n  padding: 8px 12px;\n  font-size: 13.5px;\n  color: #f8fafc;\n  outline: none;\n  transition: border-color 0.15s ease, box-shadow 0.15s ease;\n  width: 100%;\n  font-family: inherit;\n}\n\n.ad-input:focus, .ad-select:focus, .ad-textarea:focus {\n  border-color: #0a84ff;\n  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);\n  background: rgba(15, 23, 42, 0.85);\n}\n\n.ad-textarea {\n  resize: vertical;\n  min-height: 52px;\n}\n\n.ad-two-col {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 12px;\n}\n\n/* Category Tags */\n.ad-categories-field {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n\n.ad-tags-wrapper {\n  background: rgba(15, 23, 42, 0.65);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 8px;\n  padding: 6px 8px;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 6px;\n  min-height: 40px;\n}\n\n.ad-tags-wrapper:focus-within {\n  border-color: #0a84ff;\n  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);\n}\n\n.ad-tag-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  background: rgba(10, 132, 255, 0.18);\n  border: 1px solid rgba(10, 132, 255, 0.35);\n  color: #60a5fa;\n  padding: 2px 7px;\n  border-radius: 5px;\n  font-size: 12px;\n  font-weight: 500;\n}\n\n.ad-tag-chip .ad-remove-tag {\n  cursor: pointer;\n  font-size: 13px;\n  opacity: 0.75;\n  transition: opacity 0.1s ease;\n  line-height: 1;\n}\n\n.ad-tag-chip .ad-remove-tag:hover {\n  opacity: 1;\n  color: #f87171;\n}\n\n.ad-tag-input {\n  border: none;\n  background: transparent;\n  color: #f8fafc;\n  font-size: 13px;\n  outline: none;\n  flex: 1;\n  min-width: 90px;\n  font-family: inherit;\n  padding: 2px 4px;\n}\n\n/* Category Suggestions Autocomplete Popup */\n.ad-suggestions-popup {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  right: 0;\n  margin-top: 4px;\n  background: rgba(15, 23, 42, 0.96);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 8px;\n  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);\n  max-height: 180px;\n  overflow-y: auto;\n  z-index: 50;\n  display: none;\n  flex-direction: column;\n  padding: 4px;\n}\n\n.ad-suggestions-popup.ad-show {\n  display: flex;\n}\n\n.ad-suggestion-item {\n  padding: 6px 10px;\n  font-size: 13px;\n  color: #cbd5e1;\n  cursor: pointer;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  transition: background 0.12s ease, color 0.12s ease;\n}\n\n.ad-suggestion-item:hover,\n.ad-suggestion-item.is-focused {\n  background: rgba(10, 132, 255, 0.25);\n  color: #ffffff;\n}\n\n.ad-suggestion-item .ad-suggest-tag-name {\n  font-weight: 500;\n}\n\n.ad-suggestion-item .ad-suggest-tag-hint {\n  font-size: 11px;\n  color: #64748b;\n}\n\n.ad-suggestion-item:hover .ad-suggest-tag-hint,\n.ad-suggestion-item.is-focused .ad-suggest-tag-hint {\n  color: #93c5fd;\n}\n\n/* Favorite toggle */\n.ad-fav-toggle {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  user-select: none;\n  font-size: 13px;\n  color: #cbd5e1;\n}\n\n.ad-fav-star {\n  font-size: 16px;\n  color: #64748b;\n  transition: color 0.15s ease, transform 0.15s ease;\n}\n\n.ad-fav-toggle.active .ad-fav-star {\n  color: #ffb800;\n  transform: scale(1.15);\n}\n\n/* Footer */\n.ad-modal-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 20px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n  background: rgba(255, 255, 255, 0.02);\n}\n\n.ad-shortcut-hint {\n  font-size: 11px;\n  color: #64748b;\n}\n\n.ad-shortcut-hint kbd {\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 4px;\n  padding: 1px 4px;\n  font-size: 10px;\n  color: #94a3b8;\n}\n\n.ad-btn-group {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.ad-btn {\n  padding: 7px 14px;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  font-family: inherit;\n}\n\n.ad-btn-secondary {\n  background: rgba(255, 255, 255, 0.07);\n  color: #cbd5e1;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n\n.ad-btn-secondary:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #ffffff;\n}\n\n.ad-btn-primary {\n  background: #0a84ff;\n  color: #ffffff;\n  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.35);\n}\n\n.ad-btn-primary:hover {\n  background: #0070e0;\n  box-shadow: 0 3px 12px rgba(10, 132, 255, 0.5);\n  transform: translateY(-1px);\n}\n\n.ad-btn-primary:active {\n  transform: translateY(0);\n}\n\n/* Success Banner */\n.ad-success-overlay {\n  position: absolute;\n  inset: 0;\n  background: rgba(15, 23, 42, 0.95);\n  backdrop-filter: blur(12px);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  border-radius: 16px;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 0.2s ease;\n  z-index: 10;\n}\n\n.ad-success-overlay.ad-show {\n  opacity: 1;\n  pointer-events: auto;\n}\n\n.ad-success-icon {\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  background: rgba(52, 199, 89, 0.18);\n  border: 2px solid #34c759;\n  color: #34c759;\n  font-size: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: adPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n}\n\n.ad-success-text {\n  font-size: 16px;\n  font-weight: 700;\n  color: #ffffff;\n}\n\n.ad-success-sub {\n  font-size: 12px;\n  color: #94a3b8;\n}\n\n@keyframes adPop {\n  0% { transform: scale(0.5); opacity: 0; }\n  70% { transform: scale(1.1); }\n  100% { transform: scale(1); opacity: 1; }\n}\n";

  // src/extension/content.ts
  function detectFavicon() {
    const links = Array.from(document.querySelectorAll('link[rel*="icon"]'));
    const appleIcon = links.find((l) => l.rel.includes("apple-touch-icon"));
    if (appleIcon && appleIcon.href) return appleIcon.href;
    for (const link of links) {
      if (link.href && !link.href.startsWith("data:")) {
        return link.href;
      }
    }
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
      window.location.origin
    )}&size=128`;
  }
  function detectDescription() {
    const metaDesc = document.querySelector('meta[name="description" i]')?.content || document.querySelector('meta[property="og:description" i]')?.content || document.querySelector('meta[name="twitter:description" i]')?.content;
    return (metaDesc || "").trim();
  }
  function isExtensionContextValid() {
    try {
      return typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined" && !!chrome.runtime.id;
    } catch {
      return false;
    }
  }
  function toggleModal() {
    if (!isExtensionContextValid()) {
      console.warn("[App Directory Companion] Extension was reloaded. Please refresh this page.");
      return;
    }
    const existingHost = document.getElementById("app-directory-modal-host");
    if (existingHost) {
      const backdrop = existingHost.shadowRoot?.querySelector(".ad-modal-backdrop");
      if (backdrop) {
        backdrop.classList.remove("ad-visible");
        setTimeout(() => existingHost.remove(), 200);
      } else {
        existingHost.remove();
      }
      return;
    }
    try {
      chrome.runtime.sendMessage({ type: "GET_APP_DIRECTORY_STATE" }, (response) => {
        try {
          if (!isExtensionContextValid()) return;
          if (chrome.runtime.lastError) return;
          const folders = response && response.folders || [];
          const categories = response && response.categories || [];
          renderModal(folders, categories);
        } catch (_) {
        }
      });
    } catch (_) {
    }
  }
  function renderModal(availableFolders, availableCategories) {
    const host = document.createElement("div");
    host.id = "app-directory-modal-host";
    const shadow = host.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");
    styleEl.textContent = modal_default;
    shadow.appendChild(styleEl);
    const initialTitle = document.title.trim() || window.location.hostname;
    const initialUrl = window.location.href;
    const initialIcon = detectFavicon();
    const initialDesc = detectDescription();
    const selectedCategories = [];
    let isFavorite = false;
    let suggestionHighlightedIndex = -1;
    const backdrop = document.createElement("div");
    backdrop.className = "ad-modal-backdrop";
    backdrop.innerHTML = `
    <div class="ad-modal-card">
      <div class="ad-modal-header">
        <div class="ad-modal-title-group">
          <div class="ad-app-icon">\u{1F4C1}</div>
          <span class="ad-modal-title">Add to App Directory</span>
          <span class="ad-badge-local">Local DB</span>
        </div>
        <button type="button" class="ad-close-btn" title="Close (Esc)">\u2715</button>
      </div>

      <div class="ad-modal-body">
        <div class="ad-field-row">
          <div class="ad-icon-preview-box" title="Website Icon">
            <img class="ad-icon-img" src="${escapeHtml(initialIcon)}" alt="" onerror="this.src='https://icons.duckduckgo.com/ip3/${window.location.hostname}.ico'">
          </div>
          <div class="ad-form-group">
            <label class="ad-form-label" for="ad-name-input">Website Name</label>
            <input type="text" id="ad-name-input" class="ad-input" value="${escapeHtml(initialTitle)}" spellcheck="false">
          </div>
        </div>

        <div class="ad-form-group">
          <label class="ad-form-label" for="ad-url-input">Website URL</label>
          <input type="url" id="ad-url-input" class="ad-input" value="${escapeHtml(initialUrl)}" spellcheck="false">
        </div>

        <div class="ad-two-col">
          <div class="ad-form-group">
            <label class="ad-form-label" for="ad-folder-select">Folder</label>
            <select id="ad-folder-select" class="ad-select">
              <option value="">(None / Root)</option>
              ${availableFolders.map((f) => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.icon || "\u{1F4C1}")} ${escapeHtml(f.name)}</option>`).join("")}
            </select>
          </div>

          <div class="ad-form-group" style="justify-content: flex-end;">
            <label class="ad-form-label">Pin to Favorites</label>
            <div class="ad-fav-toggle" id="ad-fav-toggle">
              <span class="ad-fav-star">\u2606</span>
              <span>Favorite</span>
            </div>
          </div>
        </div>

        <div class="ad-form-group ad-categories-field">
          <label class="ad-form-label">Categories</label>
          <div class="ad-tags-wrapper" id="ad-tags-wrapper">
            <input type="text" class="ad-tag-input" id="ad-tag-input" placeholder="Type category and press Enter..." autocomplete="off">
          </div>
          <div class="ad-suggestions-popup" id="ad-suggestions-popup"></div>
        </div>

        <div class="ad-form-group">
          <label class="ad-form-label" for="ad-desc-input">Description / Notes <span style="font-size:10px;text-transform:none;opacity:0.7;">(Auto-detected)</span></label>
          <textarea id="ad-desc-input" class="ad-textarea" placeholder="Add optional notes...">${escapeHtml(initialDesc)}</textarea>
        </div>
      </div>

      <div class="ad-modal-footer">
        <span class="ad-shortcut-hint"><kbd>Alt+A</kbd> / <kbd>Alt+S</kbd> to open &bull; <kbd>Ctrl+Enter</kbd> to save</span>
        <div class="ad-btn-group">
          <button type="button" class="ad-btn ad-btn-secondary" id="ad-cancel-btn">Cancel</button>
          <button type="button" class="ad-btn ad-btn-primary" id="ad-save-btn">\u2713 Save to App</button>
        </div>
      </div>

      <div class="ad-success-overlay" id="ad-success-overlay">
        <div class="ad-success-icon">\u2713</div>
        <div class="ad-success-text">Saved to App Directory!</div>
        <div class="ad-success-sub" id="ad-success-sub">Synced to your local database</div>
      </div>
    </div>
  `;
    shadow.appendChild(backdrop);
    document.body.appendChild(host);
    requestAnimationFrame(() => {
      backdrop.classList.add("ad-visible");
      const nameInput = shadow.getElementById("ad-name-input");
      if (nameInput) {
        nameInput.focus();
        nameInput.select();
      }
    });
    const closeModal = () => {
      backdrop.classList.remove("ad-visible");
      setTimeout(() => host.remove(), 200);
    };
    const closeBtn = shadow.querySelector(".ad-close-btn");
    const cancelBtn = shadow.getElementById("ad-cancel-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    const favToggle = shadow.getElementById("ad-fav-toggle");
    if (favToggle) {
      favToggle.addEventListener("click", () => {
        isFavorite = !isFavorite;
        favToggle.classList.toggle("active", isFavorite);
        const star = favToggle.querySelector(".ad-fav-star");
        if (star) star.textContent = isFavorite ? "\u2605" : "\u2606";
      });
    }
    const tagsWrapper = shadow.getElementById("ad-tags-wrapper");
    const tagInput = shadow.getElementById("ad-tag-input");
    const suggestionsPopup = shadow.getElementById("ad-suggestions-popup");
    const addCategoryChip = (catName) => {
      const trimmed = catName.trim();
      if (!trimmed || selectedCategories.includes(trimmed)) return;
      selectedCategories.push(trimmed);
      const chip = document.createElement("span");
      chip.className = "ad-tag-chip";
      chip.setAttribute("data-tag", trimmed);
      chip.innerHTML = `${escapeHtml(trimmed)} <span class="ad-remove-tag" title="Remove">\u2715</span>`;
      chip.querySelector(".ad-remove-tag")?.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = selectedCategories.indexOf(trimmed);
        if (idx !== -1) selectedCategories.splice(idx, 1);
        chip.remove();
        renderSuggestions();
      });
      if (tagInput && tagsWrapper) {
        tagsWrapper.insertBefore(chip, tagInput);
        tagInput.value = "";
      }
    };
    const renderSuggestions = () => {
      if (!suggestionsPopup || !tagInput) return;
      const query = tagInput.value.trim().toLowerCase();
      const unselected = availableCategories.filter((cat) => !selectedCategories.includes(cat));
      const matches = query ? unselected.filter((cat) => cat.toLowerCase().includes(query)) : unselected;
      suggestionsPopup.innerHTML = "";
      suggestionHighlightedIndex = -1;
      if (matches.length === 0) {
        suggestionsPopup.classList.remove("ad-show");
        return;
      }
      matches.slice(0, 8).forEach((cat) => {
        const item = document.createElement("div");
        item.className = "ad-suggestion-item";
        item.innerHTML = `
        <span class="ad-suggest-tag-name">${escapeHtml(cat)}</span>
        <span class="ad-suggest-tag-hint">Press Enter</span>
      `;
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          addCategoryChip(cat);
          tagInput.value = "";
          renderSuggestions();
          tagInput.focus();
        });
        suggestionsPopup.appendChild(item);
      });
      suggestionsPopup.classList.add("ad-show");
    };
    const updateSuggestionHighlight = (items) => {
      items.forEach((el, idx) => {
        el.classList.toggle("is-focused", idx === suggestionHighlightedIndex);
      });
      if (suggestionHighlightedIndex >= 0 && items[suggestionHighlightedIndex]) {
        items[suggestionHighlightedIndex].scrollIntoView({ block: "nearest" });
      }
    };
    if (tagInput) {
      tagInput.addEventListener("keydown", (e) => {
        const items = suggestionsPopup ? Array.from(suggestionsPopup.querySelectorAll(".ad-suggestion-item")) : [];
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (items.length > 0) {
            suggestionHighlightedIndex = (suggestionHighlightedIndex + 1) % items.length;
            updateSuggestionHighlight(items);
          }
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (items.length > 0) {
            suggestionHighlightedIndex = (suggestionHighlightedIndex - 1 + items.length) % items.length;
            updateSuggestionHighlight(items);
          }
          return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter")) {
          e.preventDefault();
          e.stopPropagation();
          doSave();
          return;
        }
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();
          if (suggestionHighlightedIndex >= 0 && items[suggestionHighlightedIndex]) {
            const selectedName = items[suggestionHighlightedIndex].querySelector(".ad-suggest-tag-name")?.textContent;
            if (selectedName) {
              addCategoryChip(selectedName);
            }
          } else if (tagInput.value.trim()) {
            addCategoryChip(tagInput.value.trim());
          }
          tagInput.value = "";
          renderSuggestions();
          return;
        }
        if (e.key === "Escape" && suggestionsPopup?.classList.contains("ad-show")) {
          e.stopPropagation();
          suggestionsPopup.classList.remove("ad-show");
          return;
        }
        if (e.key === "Backspace" && tagInput.value === "" && selectedCategories.length > 0) {
          selectedCategories.pop();
          const chips = tagsWrapper?.querySelectorAll(".ad-tag-chip");
          if (chips && chips.length > 0) {
            chips[chips.length - 1].remove();
          }
          renderSuggestions();
        }
      });
      tagInput.addEventListener("input", () => {
        renderSuggestions();
      });
      tagInput.addEventListener("focus", () => {
        renderSuggestions();
      });
      tagInput.addEventListener("blur", () => {
        setTimeout(() => {
          if (suggestionsPopup) suggestionsPopup.classList.remove("ad-show");
        }, 150);
      });
    }
    const saveBtn = shadow.getElementById("ad-save-btn");
    const doSave = () => {
      const nameInput = shadow.getElementById("ad-name-input");
      const urlInput = shadow.getElementById("ad-url-input");
      const folderSelect = shadow.getElementById("ad-folder-select");
      const descInput = shadow.getElementById("ad-desc-input");
      if (tagInput && tagInput.value.trim()) {
        addCategoryChip(tagInput.value.trim());
      }
      const name = nameInput?.value.trim() || initialTitle;
      const url = urlInput?.value.trim() || initialUrl;
      const folderId = folderSelect?.value || null;
      const description = descInput?.value.trim() || "";
      const newBookmark = {
        id: "entry_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9),
        name,
        url,
        iconUrl: initialIcon,
        folderId: folderId || void 0,
        categories: selectedCategories,
        description,
        isFavorite,
        dateAdded: (/* @__PURE__ */ new Date()).toISOString(),
        visitCount: 0
      };
      try {
        if (!isExtensionContextValid()) {
          alert("The extension was reloaded. Please refresh this page to save bookmarks.");
          return;
        }
        chrome.runtime.sendMessage({ type: "SAVE_BOOKMARK", entry: newBookmark }, (res) => {
          try {
            if (!isExtensionContextValid()) return;
            if (chrome.runtime.lastError) return;
            const successOverlay = shadow.getElementById("ad-success-overlay");
            const successSub = shadow.getElementById("ad-success-sub");
            if (successSub && res) {
              if (res.direct) {
                successSub.textContent = "Saved directly to your open App Directory tab!";
              } else if (res.queued) {
                successSub.textContent = `Queued (${res.pendingCount || 1} pending) \u2014 will sync when App Directory opens.`;
              }
            }
            if (successOverlay) successOverlay.classList.add("ad-show");
            setTimeout(() => {
              closeModal();
            }, 700);
          } catch (_) {
          }
        });
      } catch (_) {
      }
    };
    if (saveBtn) saveBtn.addEventListener("click", doSave);
    const keyHandler = (e) => {
      const isCtrlEnter = (e.ctrlKey || e.metaKey) && (e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter");
      if (isCtrlEnter) {
        e.preventDefault();
        e.stopPropagation();
        doSave();
        return;
      }
      if (e.key === "Escape" || e.code === "Escape") {
        const popup = shadow.getElementById("ad-suggestions-popup");
        if (popup && popup.classList.contains("ad-show")) {
          e.preventDefault();
          e.stopPropagation();
          popup.classList.remove("ad-show");
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      }
    };
    window.addEventListener("keydown", keyHandler, true);
  }
  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function handlePageShortcut(e) {
    if (!isExtensionContextValid()) {
      try {
        window.removeEventListener("keydown", handlePageShortcut, true);
        document.removeEventListener("keydown", handlePageShortcut, true);
      } catch (_) {
      }
      return;
    }
    if (!e.altKey || e.ctrlKey) return;
    const isA = e.code === "KeyA" || e.key === "a" || e.key === "A";
    const isS = e.code === "KeyS" || e.key === "s" || e.key === "S";
    const isB = e.code === "KeyB" || e.key === "b" || e.key === "B";
    const isD = e.code === "KeyD" || e.key === "d" || e.key === "D";
    if (isA || isS || isB || isD) {
      const existingHost = document.getElementById("app-directory-modal-host");
      if (!existingHost) {
        e.preventDefault();
        e.stopPropagation();
        toggleModal();
      }
    }
  }
  window.addEventListener("keydown", handlePageShortcut, true);
  document.addEventListener("keydown", handlePageShortcut, true);
  try {
    if (isExtensionContextValid() && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        try {
          if (!isExtensionContextValid()) return;
          if (message && message.type === "TOGGLE_INJECTED_MODAL") {
            toggleModal();
            sendResponse({ success: true });
          }
        } catch (_) {
        }
      });
    }
  } catch (_) {
  }
})();
//# sourceMappingURL=content.js.map
