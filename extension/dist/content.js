"use strict";
(() => {
  // src/extension/modal.css
  var modal_default = ":host {\n  all: initial;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n  color: #f1f5f9;\n  font-size: 14px;\n  line-height: 1.5;\n  box-sizing: border-box;\n}\n\n*, *::before, *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n.ad-modal-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(10, 14, 23, 0.68);\n  backdrop-filter: blur(8px);\n  -webkit-backdrop-filter: blur(8px);\n  z-index: 2147483647;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n  padding: 16px;\n}\n\n.ad-modal-backdrop.ad-visible {\n  opacity: 1;\n}\n\n.ad-modal-card {\n  width: 100%;\n  max-width: 480px;\n  background: rgba(22, 28, 42, 0.94);\n  backdrop-filter: blur(24px);\n  -webkit-backdrop-filter: blur(24px);\n  border: 1px solid rgba(255, 255, 255, 0.14);\n  border-radius: 16px;\n  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);\n  overflow: hidden;\n  transform: scale(0.94) translateY(8px);\n  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;\n  display: flex;\n  flex-direction: column;\n}\n\n.ad-modal-backdrop.ad-visible .ad-modal-card {\n  transform: scale(1) translateY(0);\n}\n\n/* Header */\n.ad-modal-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px 20px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n  background: rgba(255, 255, 255, 0.02);\n}\n\n.ad-modal-title-group {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.ad-app-icon {\n  width: 28px;\n  height: 28px;\n  border-radius: 7px;\n  background: linear-gradient(135deg, #0a84ff, #5e5ce6);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 15px;\n  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.35);\n}\n\n.ad-modal-title {\n  font-size: 16px;\n  font-weight: 700;\n  color: #ffffff;\n  letter-spacing: -0.2px;\n}\n\n.ad-badge-local {\n  font-size: 10px;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  background: rgba(52, 199, 89, 0.18);\n  color: #34c759;\n  border: 1px solid rgba(52, 199, 89, 0.3);\n  padding: 2px 6px;\n  border-radius: 4px;\n}\n\n.ad-header-actions {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.ad-icon-btn, .ad-close-btn {\n  background: transparent;\n  border: none;\n  color: #94a3b8;\n  font-size: 16px;\n  cursor: pointer;\n  width: 28px;\n  height: 28px;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n}\n\n.ad-icon-btn:hover, .ad-close-btn:hover {\n  background: rgba(255, 255, 255, 0.08);\n  color: #ffffff;\n}\n\n/* Body Form */\n.ad-modal-body {\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  max-height: 70vh;\n  overflow-y: auto;\n}\n\n.ad-field-row {\n  display: flex;\n  gap: 12px;\n  align-items: flex-start;\n}\n\n.ad-icon-preview-box {\n  width: 44px;\n  height: 44px;\n  border-radius: 10px;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  overflow: hidden;\n  margin-top: 22px;\n}\n\n.ad-icon-preview-box img {\n  width: 26px;\n  height: 26px;\n  object-fit: contain;\n}\n\n.ad-form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  flex: 1;\n}\n\n.ad-form-label {\n  font-size: 12px;\n  font-weight: 600;\n  color: #94a3b8;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.ad-input, .ad-select, .ad-textarea {\n  background: rgba(15, 23, 42, 0.65);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 8px;\n  padding: 8px 12px;\n  font-size: 13.5px;\n  color: #f8fafc;\n  outline: none;\n  transition: border-color 0.15s ease, box-shadow 0.15s ease;\n  width: 100%;\n  font-family: inherit;\n}\n\n.ad-input:focus, .ad-select:focus, .ad-textarea:focus {\n  border-color: #0a84ff;\n  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);\n  background: rgba(15, 23, 42, 0.85);\n}\n\n.ad-textarea {\n  resize: vertical;\n  min-height: 52px;\n}\n\n.ad-two-col {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 12px;\n}\n\n/* Category Tags */\n.ad-categories-field {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n}\n\n.ad-tags-wrapper {\n  background: rgba(15, 23, 42, 0.65);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 8px;\n  padding: 6px 8px;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 6px;\n  min-height: 40px;\n}\n\n.ad-tags-wrapper:focus-within {\n  border-color: #0a84ff;\n  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);\n}\n\n.ad-tag-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  background: rgba(10, 132, 255, 0.18);\n  border: 1px solid rgba(10, 132, 255, 0.35);\n  color: #60a5fa;\n  padding: 2px 7px;\n  border-radius: 5px;\n  font-size: 12px;\n  font-weight: 500;\n}\n\n.ad-tag-chip .ad-remove-tag {\n  cursor: pointer;\n  font-size: 13px;\n  opacity: 0.75;\n  transition: opacity 0.1s ease;\n  line-height: 1;\n}\n\n.ad-tag-chip .ad-remove-tag:hover {\n  opacity: 1;\n  color: #f87171;\n}\n\n.ad-tag-input {\n  border: none;\n  background: transparent;\n  color: #f8fafc;\n  font-size: 13px;\n  outline: none;\n  flex: 1;\n  min-width: 90px;\n  font-family: inherit;\n  padding: 2px 4px;\n}\n\n/* Category Suggestions Autocomplete Popup */\n.ad-suggestions-popup {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  right: 0;\n  margin-top: 4px;\n  background: rgba(15, 23, 42, 0.96);\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 8px;\n  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);\n  max-height: 180px;\n  overflow-y: auto;\n  z-index: 50;\n  display: none;\n  flex-direction: column;\n  padding: 4px;\n}\n\n.ad-suggestions-popup.ad-show {\n  display: flex;\n}\n\n.ad-suggestion-item {\n  padding: 6px 10px;\n  font-size: 13px;\n  color: #cbd5e1;\n  cursor: pointer;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  transition: background 0.12s ease, color 0.12s ease;\n}\n\n.ad-suggestion-item:hover,\n.ad-suggestion-item.is-focused {\n  background: rgba(10, 132, 255, 0.25);\n  color: #ffffff;\n}\n\n.ad-suggestion-item .ad-suggest-tag-name {\n  font-weight: 500;\n}\n\n.ad-suggestion-item .ad-suggest-tag-hint {\n  font-size: 11px;\n  color: #64748b;\n}\n\n.ad-suggestion-item:hover .ad-suggest-tag-hint,\n.ad-suggestion-item.is-focused .ad-suggest-tag-hint {\n  color: #93c5fd;\n}\n\n/* Favorite toggle */\n.ad-fav-toggle {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  cursor: pointer;\n  user-select: none;\n  font-size: 13px;\n  color: #cbd5e1;\n}\n\n.ad-fav-star {\n  font-size: 16px;\n  color: #64748b;\n  transition: color 0.15s ease, transform 0.15s ease;\n}\n\n.ad-fav-toggle.active .ad-fav-star {\n  color: #ffb800;\n  transform: scale(1.15);\n}\n\n/* Footer */\n.ad-modal-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 14px 20px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n  background: rgba(255, 255, 255, 0.02);\n}\n\n.ad-shortcut-hint {\n  font-size: 11px;\n  color: #64748b;\n}\n\n.ad-shortcut-hint kbd {\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 4px;\n  padding: 1px 4px;\n  font-size: 10px;\n  color: #94a3b8;\n}\n\n.ad-btn-group {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.ad-btn {\n  padding: 7px 14px;\n  border-radius: 8px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  font-family: inherit;\n}\n\n.ad-btn-secondary {\n  background: rgba(255, 255, 255, 0.07);\n  color: #cbd5e1;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n}\n\n.ad-btn-secondary:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #ffffff;\n}\n\n.ad-btn-primary {\n  background: #0a84ff;\n  color: #ffffff;\n  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.35);\n}\n\n.ad-btn-primary:hover {\n  background: #0070e0;\n  box-shadow: 0 3px 12px rgba(10, 132, 255, 0.5);\n  transform: translateY(-1px);\n}\n\n.ad-btn-primary:active {\n  transform: translateY(0);\n}\n\n/* Success Banner */\n.ad-success-overlay {\n  position: absolute;\n  inset: 0;\n  background: rgba(15, 23, 42, 0.95);\n  backdrop-filter: blur(12px);\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 10px;\n  border-radius: 16px;\n  opacity: 0;\n  pointer-events: none;\n  transition: opacity 0.2s ease;\n  z-index: 10;\n}\n\n.ad-success-overlay.ad-show {\n  opacity: 1;\n  pointer-events: auto;\n}\n\n.ad-success-icon {\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  background: rgba(52, 199, 89, 0.18);\n  border: 2px solid #34c759;\n  color: #34c759;\n  font-size: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  animation: adPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n}\n\n.ad-success-text {\n  font-size: 16px;\n  font-weight: 700;\n  color: #ffffff;\n}\n\n.ad-success-sub {\n  font-size: 12px;\n  color: #94a3b8;\n}\n\n@keyframes adPop {\n  0% { transform: scale(0.5); opacity: 0; }\n  70% { transform: scale(1.1); }\n  100% { transform: scale(1); opacity: 1; }\n}\n\n/* \u2500\u2500 Category Header & AI Classification Badges \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n.ad-category-header-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 3px;\n}\n\n.ad-ai-status-group {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.ad-classify-badge {\n  font-size: 11px;\n  font-weight: 600;\n  border-radius: 12px;\n  padding: 2px 8px;\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  letter-spacing: 0.2px;\n  user-select: none;\n  transition: all 0.2s ease;\n  max-width: 260px;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.ad-classify-badge.ad-badge-dom {\n  background: rgba(52, 199, 89, 0.16);\n  color: #34c759;\n  border: 1px solid rgba(52, 199, 89, 0.35);\n  cursor: pointer;\n}\n\n.ad-classify-badge.ad-badge-dom:hover {\n  background: rgba(52, 199, 89, 0.26);\n}\n\n.ad-classify-badge.ad-badge-fallback {\n  background: rgba(168, 85, 247, 0.16);\n  color: #c084fc;\n  border: 1px solid rgba(168, 85, 247, 0.35);\n  cursor: pointer;\n}\n\n.ad-classify-badge.ad-badge-fallback:hover {\n  background: rgba(168, 85, 247, 0.26);\n}\n\n.ad-classify-badge.ad-badge-brave {\n  background: rgba(255, 159, 10, 0.16);\n  color: #ff9f0a;\n  border: 1px solid rgba(255, 159, 10, 0.35);\n  cursor: pointer;\n}\n\n.ad-classify-badge.ad-badge-brave:hover {\n  background: rgba(255, 159, 10, 0.26);\n}\n\n.ad-classify-badge.ad-badge-loading {\n  background: rgba(10, 132, 255, 0.15);\n  color: #60a5fa;\n  border: 1px solid rgba(10, 132, 255, 0.3);\n}\n\n.ad-classify-badge.ad-badge-setup {\n  background: rgba(255, 255, 255, 0.08);\n  color: #cbd5e1;\n  border: 1px solid rgba(255, 255, 255, 0.18);\n  cursor: pointer;\n}\n\n.ad-classify-badge.ad-badge-setup:hover {\n  background: rgba(255, 255, 255, 0.16);\n  color: #ffffff;\n}\n\n.ad-classify-badge.ad-badge-error {\n  background: rgba(255, 59, 48, 0.16);\n  color: #ff453a;\n  border: 1px solid rgba(255, 59, 48, 0.35);\n  cursor: pointer;\n}\n\n.ad-reclassify-btn {\n  background: transparent;\n  border: none;\n  color: #94a3b8;\n  font-size: 13px;\n  cursor: pointer;\n  width: 22px;\n  height: 22px;\n  border-radius: 4px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n}\n\n.ad-reclassify-btn:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: #ffffff;\n}\n\n.ad-reclassify-btn.is-spinning {\n  animation: adSpin 0.75s linear infinite;\n}\n\n@keyframes adSpin {\n  100% { transform: rotate(360deg); }\n}\n\n.ad-spinner-dot {\n  display: inline-block;\n  width: 8px;\n  height: 8px;\n  border: 1.5px solid rgba(96, 165, 250, 0.3);\n  border-top-color: #60a5fa;\n  border-radius: 50%;\n  animation: adSpin 0.7s linear infinite;\n}\n\n/* AI Reasoning Card / Popover */\n.ad-reasoning-card {\n  margin-top: 4px;\n  padding: 6px 10px;\n  background: rgba(15, 23, 42, 0.85);\n  border: 1px solid rgba(255, 255, 255, 0.1);\n  border-left: 3px solid #0a84ff;\n  border-radius: 6px;\n  font-size: 11px;\n  color: #94a3b8;\n  line-height: 1.45;\n  display: none;\n}\n\n.ad-reasoning-card.ad-show {\n  display: block;\n}\n\n/* New Category Tag Chip highlight */\n.ad-tag-chip.ad-tag-chip-new {\n  background: linear-gradient(135deg, rgba(255, 214, 10, 0.22), rgba(255, 159, 10, 0.14));\n  border: 1px solid rgba(255, 214, 10, 0.55);\n  color: #ffd60a;\n  box-shadow: 0 0 10px rgba(255, 214, 10, 0.15);\n}\n\n.ad-tag-chip.ad-tag-chip-new .ad-remove-tag:hover {\n  color: #ff453a;\n}\n\n.ad-new-tags-notice {\n  font-size: 11px;\n  color: #ffd60a;\n  margin-top: 4px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-weight: 500;\n}\n\n/* Settings Drawer / View inside modal */\n.ad-settings-drawer {\n  position: absolute;\n  inset: 0;\n  background: rgba(18, 24, 38, 0.98);\n  backdrop-filter: blur(24px);\n  -webkit-backdrop-filter: blur(24px);\n  border-radius: 16px;\n  z-index: 20;\n  display: flex;\n  flex-direction: column;\n  transform: translateX(100%);\n  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n.ad-settings-drawer.ad-show {\n  transform: translateX(0);\n}\n\n.ad-settings-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px 20px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\n}\n\n.ad-settings-title {\n  font-size: 15px;\n  font-weight: 700;\n  color: #ffffff;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.ad-settings-body {\n  padding: 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  overflow-y: auto;\n  flex: 1;\n}\n\n.ad-settings-hint {\n  font-size: 12px;\n  color: #94a3b8;\n  line-height: 1.45;\n}\n\n.ad-settings-hint a {\n  color: #0a84ff;\n  text-decoration: none;\n}\n\n.ad-settings-hint a:hover {\n  text-decoration: underline;\n}\n\n.ad-checkbox-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  user-select: none;\n  font-size: 13px;\n  color: #cbd5e1;\n  margin-top: 4px;\n}\n\n.ad-checkbox-row input {\n  accent-color: #0a84ff;\n  width: 16px;\n  height: 16px;\n  cursor: pointer;\n}\n\n.ad-settings-footer {\n  padding: 14px 20px;\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 10px;\n  background: rgba(255, 255, 255, 0.02);\n}\n";

  // src/extension/domExtractor.ts
  function extractPageContext() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    const title = (document.title || hostname).trim();
    const metaDesc = document.querySelector('meta[name="description" i]')?.content || document.querySelector('meta[property="og:description" i]')?.content || document.querySelector('meta[name="twitter:description" i]')?.content || "";
    const ogTitle = document.querySelector('meta[property="og:title" i]')?.content;
    const ogDescription = document.querySelector('meta[property="og:description" i]')?.content;
    const keywordsMeta = document.querySelector('meta[name="keywords" i]')?.content || "";
    const keywords = keywordsMeta ? keywordsMeta.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 10) : [];
    const schemaTypes = [];
    const schemaSummaries = [];
    try {
      const jsonLdScripts = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]')
      );
      for (const s of jsonLdScripts.slice(0, 4)) {
        if (!s.textContent) continue;
        try {
          const parsed = JSON.parse(s.textContent);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          for (const item of items) {
            if (!item) continue;
            if (item["@type"]) {
              const types = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
              schemaTypes.push(...types);
            }
            if (item.name || item.description || item.applicationCategory) {
              schemaSummaries.push(
                `[${item["@type"] || "Item"}] ${item.name || ""} - ${item.applicationCategory || ""} - ${item.description || ""}`
              );
            }
          }
        } catch (_) {
        }
      }
    } catch (_) {
    }
    const headings = [];
    const headingElements = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, [role="heading"]')
    );
    for (const h of headingElements) {
      const text = (h.textContent || "").replace(/\s+/g, " ").trim();
      if (text && text.length > 2 && text.length < 120 && !headings.includes(text)) {
        headings.push(text);
        if (headings.length >= 8) break;
      }
    }
    let heroText = "";
    const heroCandidates = document.querySelectorAll(
      '[class*="hero" i] p, [id*="hero" i] p, main p, header p'
    );
    for (const p of Array.from(heroCandidates)) {
      const text = (p.textContent || "").replace(/\s+/g, " ").trim();
      if (text.length > 25 && text.length < 300) {
        heroText = text;
        break;
      }
    }
    const mainEl = document.querySelector("main");
    const targetEl = mainEl && (mainEl.textContent || "").trim().length > 150 ? mainEl : document.body;
    const clone = targetEl.cloneNode(true);
    const noisy = clone.querySelectorAll(
      "script, style, noscript, svg, nav, footer, iframe"
    );
    noisy.forEach((el) => el.remove());
    const rawText = (clone.textContent || "").replace(/\s+/g, " ").trim();
    const bodySummary = rawText.slice(0, 3e3);
    const wordCount = bodySummary.split(/\s+/).filter(Boolean).length;
    const isAuthTitle = /sign in|log in|login|welcome back|authentication/i.test(title);
    const isSparse = wordCount < 40 || isAuthTitle && wordCount < 80;
    return {
      url,
      hostname,
      title,
      description: metaDesc.trim(),
      keywords,
      ogTitle,
      ogDescription,
      headings,
      heroText,
      bodySummary,
      schemaTypes: Array.from(new Set(schemaTypes)),
      schemaSummary: schemaSummaries.slice(0, 2).join(" | "),
      isSparse
    };
  }

  // src/extension/content.ts
  if (typeof window.__APP_DIRECTORY_CLEANUP__ === "function") {
    try {
      window.__APP_DIRECTORY_CLEANUP__();
    } catch (_) {
    }
  }
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
  var isModalOpening = false;
  var lastToggleTimestamp = 0;
  function toggleModal() {
    if (!isExtensionContextValid()) {
      console.warn("[App Directory Companion] Extension was reloaded. Please refresh this page.");
      return;
    }
    const now = Date.now();
    if (now - lastToggleTimestamp < 400 || isModalOpening) {
      return;
    }
    lastToggleTimestamp = now;
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
    isModalOpening = true;
    try {
      chrome.runtime.sendMessage({ type: "GET_APP_DIRECTORY_STATE" }, (response) => {
        isModalOpening = false;
        try {
          if (!isExtensionContextValid()) return;
          if (chrome.runtime.lastError) return;
          if (document.getElementById("app-directory-modal-host")) {
            return;
          }
          const folders = response && response.folders || [];
          const categories = response && response.categories || [];
          renderModal(folders, categories);
        } catch (_) {
        }
      });
    } catch (_) {
      isModalOpening = false;
    }
  }
  function renderModal(availableFolders, availableCategories) {
    document.querySelectorAll("#app-directory-modal-host").forEach((node) => node.remove());
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
        <div class="ad-header-actions">
          <button type="button" class="ad-icon-btn" id="ad-settings-toggle-btn" title="Companion AI Settings">\u2699\uFE0F</button>
          <button type="button" class="ad-close-btn" id="ad-close-btn" title="Close (Esc)">\u2715</button>
        </div>
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
          <div class="ad-category-header-row">
            <label class="ad-form-label" style="margin-bottom:0;">Categories</label>
            <div class="ad-ai-status-group">
              <span class="ad-classify-badge ad-badge-setup" id="ad-classify-badge" title="AI Tagging status">\u2699\uFE0F Setup AI</span>
              <button type="button" class="ad-reclassify-btn" id="ad-reclassify-btn" title="Re-classify with AI (Alt+Click to force Brave Search)" style="display:none;">\u21BB</button>
            </div>
          </div>
          <div class="ad-tags-wrapper" id="ad-tags-wrapper">
            <input type="text" class="ad-tag-input" id="ad-tag-input" placeholder="Type category and press Enter..." autocomplete="off">
          </div>
          <div class="ad-reasoning-card" id="ad-reasoning-card"></div>
          <div class="ad-new-tags-notice" id="ad-new-tags-notice" style="display:none;"></div>
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

      <!-- Settings Drawer -->
      <div class="ad-settings-drawer" id="ad-settings-drawer">
        <div class="ad-settings-header">
          <div class="ad-settings-title">\u2699\uFE0F Companion AI Settings</div>
          <button type="button" class="ad-icon-btn" id="ad-settings-close-btn" title="Back">\u2715</button>
        </div>
        <div class="ad-settings-body">
          <div class="ad-form-group">
            <label class="ad-form-label" for="ad-gemini-key-input">Google Gemini API Key (Free)</label>
            <input type="password" id="ad-gemini-key-input" class="ad-input" placeholder="AIzaSy..." spellcheck="false">
            <div class="ad-settings-hint">
              Get a free API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio</a>. No credit card required.
            </div>
          </div>

          <div class="ad-form-group">
            <label class="ad-form-label" for="ad-gemini-model-select">Gemini Model</label>
            <select id="ad-gemini-model-select" class="ad-select">
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default - Fast & Free)</option>
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest Flash)</option>
            </select>
          </div>

          <div class="ad-form-group">
            <label class="ad-form-label" for="ad-brave-key-input">Brave Search API Key (Optional Fallback)</label>
            <input type="password" id="ad-brave-key-input" class="ad-input" placeholder="BSA..." spellcheck="false">
            <div class="ad-settings-hint">
              Used only when page text is sparse/auth-walled. Free tier (2,000 queries/mo) at <a href="https://brave.com/search/api/" target="_blank" rel="noopener">Brave Search API</a>.
            </div>
          </div>

          <label class="ad-checkbox-row">
            <input type="checkbox" id="ad-autoclassify-check" checked>
            <span>Auto-classify categories on opening modal</span>
          </label>
        </div>
        <div class="ad-settings-footer">
          <button type="button" class="ad-btn ad-btn-secondary" id="ad-settings-cancel-btn">Cancel</button>
          <button type="button" class="ad-btn ad-btn-primary" id="ad-settings-save-btn">Save Settings</button>
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
    let closeTimer = null;
    let keyHandler = null;
    const closeModal = () => {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      if (keyHandler) {
        window.removeEventListener("keydown", keyHandler, true);
      }
      backdrop.classList.remove("ad-visible");
      setTimeout(() => host.remove(), 200);
    };
    const closeBtn = shadow.getElementById("ad-close-btn");
    const cancelBtn = shadow.getElementById("ad-cancel-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
    const stopKeyboardPropagation = (e) => {
      e.stopPropagation();
    };
    backdrop.addEventListener("keydown", stopKeyboardPropagation);
    backdrop.addEventListener("keyup", stopKeyboardPropagation);
    backdrop.addEventListener("keypress", stopKeyboardPropagation);
    host.addEventListener("keydown", stopKeyboardPropagation);
    host.addEventListener("keyup", stopKeyboardPropagation);
    host.addEventListener("keypress", stopKeyboardPropagation);
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
    const newTagsNotice = shadow.getElementById("ad-new-tags-notice");
    const updateNewTagsNotice = () => {
      if (!newTagsNotice) return;
      const newTags = selectedCategories.filter((c) => !availableCategories.includes(c));
      if (newTags.length > 0) {
        newTagsNotice.style.display = "flex";
        newTagsNotice.textContent = `\u2726 ${newTags.length} new ${newTags.length === 1 ? "category" : "categories"} (${newTags.join(", ")}) will be added to your directory`;
      } else {
        newTagsNotice.style.display = "none";
        newTagsNotice.textContent = "";
      }
    };
    const addCategoryChip = (catName, isNewTag = false) => {
      const trimmed = catName.trim();
      if (!trimmed || selectedCategories.includes(trimmed)) return;
      selectedCategories.push(trimmed);
      const chip = document.createElement("span");
      chip.className = isNewTag ? "ad-tag-chip ad-tag-chip-new" : "ad-tag-chip";
      chip.setAttribute("data-tag", trimmed);
      if (isNewTag) {
        chip.setAttribute("title", "New category (does not exist in App Directory yet)");
        chip.innerHTML = `<span style="font-weight:700;font-size:11px;opacity:0.9;">\u2726 NEW:</span> ${escapeHtml(trimmed)} <span class="ad-remove-tag" title="Remove">\u2715</span>`;
      } else {
        chip.innerHTML = `${escapeHtml(trimmed)} <span class="ad-remove-tag" title="Remove">\u2715</span>`;
      }
      chip.querySelector(".ad-remove-tag")?.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = selectedCategories.indexOf(trimmed);
        if (idx !== -1) selectedCategories.splice(idx, 1);
        chip.remove();
        updateNewTagsNotice();
        renderSuggestions();
      });
      if (tagInput && tagsWrapper) {
        tagsWrapper.insertBefore(chip, tagInput);
        tagInput.value = "";
      }
      updateNewTagsNotice();
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
          addCategoryChip(cat, false);
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
          if (items.length > 0) {
            e.preventDefault();
            suggestionHighlightedIndex = (suggestionHighlightedIndex + 1) % items.length;
            updateSuggestionHighlight(items);
          }
        } else if (e.key === "ArrowUp") {
          if (items.length > 0) {
            e.preventDefault();
            suggestionHighlightedIndex = (suggestionHighlightedIndex - 1 + items.length) % items.length;
            updateSuggestionHighlight(items);
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (suggestionHighlightedIndex >= 0 && items[suggestionHighlightedIndex]) {
            items[suggestionHighlightedIndex].dispatchEvent(new MouseEvent("mousedown"));
          } else if (tagInput.value.trim()) {
            const val = tagInput.value.trim();
            const isNew = !availableCategories.includes(val);
            addCategoryChip(val, isNew);
            tagInput.value = "";
            renderSuggestions();
          }
        } else if (e.key === "Backspace" && !tagInput.value && selectedCategories.length > 0) {
          const removed = selectedCategories.pop();
          if (removed && tagsWrapper) {
            const chips = tagsWrapper.querySelectorAll(".ad-tag-chip");
            if (chips.length > 0) chips[chips.length - 1].remove();
          }
          updateNewTagsNotice();
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
    const settingsDrawer = shadow.getElementById("ad-settings-drawer");
    const settingsToggleBtn = shadow.getElementById("ad-settings-toggle-btn");
    const settingsCloseBtn = shadow.getElementById("ad-settings-close-btn");
    const settingsCancelBtn = shadow.getElementById("ad-settings-cancel-btn");
    const settingsSaveBtn = shadow.getElementById("ad-settings-save-btn");
    const geminiKeyInput = shadow.getElementById("ad-gemini-key-input");
    const geminiModelSelect = shadow.getElementById("ad-gemini-model-select");
    const braveKeyInput = shadow.getElementById("ad-brave-key-input");
    const autoclassifyCheck = shadow.getElementById("ad-autoclassify-check");
    let lastLoadedSettings = null;
    const openSettings = () => {
      if (!settingsDrawer) return;
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (s) => {
        lastLoadedSettings = s;
        if (geminiKeyInput && s) geminiKeyInput.value = s.geminiApiKey || "";
        if (geminiModelSelect && s) {
          const models = Array.isArray(s.discoveredModels) && s.discoveredModels.length > 0 ? s.discoveredModels : [
            { name: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash" },
            { name: "gemini-2.5-flash-lite", displayName: "Gemini 2.5 Flash Lite" },
            { name: "gemini-2.0-flash", displayName: "Gemini 2.0 Flash" },
            { name: "gemini-2.0-flash-lite", displayName: "Gemini 2.0 Flash Lite" },
            { name: "gemini-3.8-flash", displayName: "Gemini 3.8 Flash" }
          ];
          geminiModelSelect.innerHTML = "";
          models.forEach((m) => {
            const opt = document.createElement("option");
            opt.value = m.name;
            opt.textContent = `${m.displayName || m.name} (${m.name})`;
            if (m.name === (s.geminiModel || "gemini-2.5-flash")) {
              opt.selected = true;
            }
            geminiModelSelect.appendChild(opt);
          });
        }
        if (braveKeyInput && s) braveKeyInput.value = s.braveApiKey || "";
        if (autoclassifyCheck && s) autoclassifyCheck.checked = s.autoClassify !== false;
        settingsDrawer.classList.add("ad-show");
      });
    };
    const closeSettings = () => {
      if (settingsDrawer) settingsDrawer.classList.remove("ad-show");
    };
    if (settingsToggleBtn) settingsToggleBtn.addEventListener("click", openSettings);
    if (settingsCloseBtn) settingsCloseBtn.addEventListener("click", closeSettings);
    if (settingsCancelBtn) settingsCancelBtn.addEventListener("click", closeSettings);
    if (settingsSaveBtn) {
      settingsSaveBtn.addEventListener("click", () => {
        const newSettings = {
          geminiApiKey: geminiKeyInput?.value.trim() || "",
          geminiModel: geminiModelSelect?.value || "gemini-2.5-flash",
          geminiFallbackModels: lastLoadedSettings?.geminiFallbackModels || ["gemini-2.5-flash-lite"],
          discoveredModels: lastLoadedSettings?.discoveredModels,
          braveApiKey: braveKeyInput?.value.trim() || "",
          autoClassify: autoclassifyCheck?.checked ?? true
        };
        chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", settings: newSettings }, () => {
          closeSettings();
          if (newSettings.geminiApiKey) {
            if (selectedCategories.length === 0) {
              runClassification(false);
            }
          }
        });
      });
    }
    const classifyBadge = shadow.getElementById("ad-classify-badge");
    const reclassifyBtn = shadow.getElementById("ad-reclassify-btn");
    const reasoningCard = shadow.getElementById("ad-reasoning-card");
    const handleClassificationResult = (res) => {
      if (!classifyBadge) return;
      if (!res || !res.success) {
        if (res?.error === "NO_API_KEY") {
          classifyBadge.className = "ad-classify-badge ad-badge-setup";
          classifyBadge.innerHTML = "\u2699\uFE0F Setup AI";
          classifyBadge.title = "Click to set up your free Gemini API key";
          if (reclassifyBtn) reclassifyBtn.style.display = "none";
        } else if (res?.error === "RATE_LIMIT_EXCEEDED") {
          classifyBadge.className = "ad-classify-badge ad-badge-error";
          classifyBadge.innerHTML = "\u26A0\uFE0F Rate Limit (429)";
          classifyBadge.title = "All configured models exceeded rate limits. Add fallback models in Settings.";
        } else if (res?.error === "SERVICE_OVERLOADED_503") {
          classifyBadge.className = "ad-classify-badge ad-badge-error";
          classifyBadge.innerHTML = "\u26A0\uFE0F Overloaded (503)";
          classifyBadge.title = "Gemini service overloaded. Add a fallback model (e.g. 2.5 Flash Lite) in Settings.";
        } else if (res?.error === "INVALID_API_KEY") {
          classifyBadge.className = "ad-classify-badge ad-badge-error";
          classifyBadge.innerHTML = "\u26A0\uFE0F Invalid Key";
          classifyBadge.title = "The Gemini API key provided is invalid or inactive.";
        } else {
          classifyBadge.className = "ad-classify-badge ad-badge-error";
          classifyBadge.innerHTML = "\u26A0\uFE0F AI Failed";
          classifyBadge.title = res?.error || "Classification failed";
        }
        return;
      }
      if (reclassifyBtn) reclassifyBtn.style.display = "inline-flex";
      const cleanModel = (res.modelUsed || "").replace(/^models\//, "");
      const hadFailover = res.auditChain && res.auditChain.some((a) => a.status === "FAILED");
      let tooltip = "";
      if (res.auditChain && res.auditChain.length > 0) {
        const chainLines = res.auditChain.map(
          (a) => `\u2022 ${a.model.replace(/^models\//, "")}: ${a.status === "SUCCESS" ? `\u2713 Success (${a.latencyMs}ms)` : `\u2717 ${a.error} (${a.latencyMs}ms)`}`
        ).join("\n");
        tooltip = `Execution Cascade:
${chainLines}

`;
      }
      if (res.reasoning) {
        tooltip += `Reasoning: ${res.reasoning}`;
      }
      if (hadFailover) {
        classifyBadge.className = "ad-classify-badge ad-badge-fallback";
        classifyBadge.innerHTML = `\u{1FAB6} AI: ${escapeHtml(cleanModel)} [Fallback]`;
        classifyBadge.title = tooltip || `Recovered via fallback model ${cleanModel} (Click to toggle reasoning)`;
      } else if (res.method === "BRAVE_GROUNDED") {
        classifyBadge.className = "ad-classify-badge ad-badge-brave";
        classifyBadge.innerHTML = `\u{1F50D} AI: Brave (${escapeHtml(cleanModel || "Search")})`;
        classifyBadge.title = tooltip || "Classified using Brave Search grounding (Click to toggle reasoning)";
      } else {
        classifyBadge.className = "ad-classify-badge ad-badge-dom";
        classifyBadge.innerHTML = `\u2728 AI: ${escapeHtml(cleanModel || "Direct DOM")}`;
        classifyBadge.title = tooltip || "Classified directly from page text (Click to toggle reasoning)";
      }
      if (reasoningCard && res.reasoning) {
        reasoningCard.textContent = `\u{1F4A1} [${cleanModel || "AI"}] ${res.reasoning}`;
      }
      const tagsToAdd = [];
      if (Array.isArray(res.recommendedTags)) {
        for (const t of res.recommendedTags) {
          const trimmed = String(t).trim();
          if (trimmed && !tagsToAdd.includes(trimmed)) tagsToAdd.push(trimmed);
        }
      }
      if (Array.isArray(res.newTags)) {
        for (const t of res.newTags) {
          const trimmed = String(t).trim();
          if (trimmed && !tagsToAdd.includes(trimmed)) tagsToAdd.push(trimmed);
        }
      }
      if (res.suggestedNewTag) {
        const trimmed = String(res.suggestedNewTag).trim();
        if (trimmed && trimmed.toLowerCase() !== "null" && trimmed.toLowerCase() !== "none" && !tagsToAdd.includes(trimmed)) {
          tagsToAdd.push(trimmed);
        }
      }
      if (tagsToAdd.length === 0) {
        classifyBadge.className = "ad-classify-badge ad-badge-dom";
        classifyBadge.innerHTML = "\u2728 AI: No Tags Matched";
        classifyBadge.title = tooltip || res.reasoning || "No existing or new categories matched this website.";
        if (reasoningCard && res.reasoning) {
          reasoningCard.textContent = `\u{1F4A1} ${res.reasoning}`;
          reasoningCard.classList.add("ad-show");
        }
      } else {
        for (const tag of tagsToAdd) {
          const isNew = !availableCategories.includes(tag) || res.newTags && res.newTags.includes(tag) || tag === res.suggestedNewTag;
          addCategoryChip(tag, isNew);
        }
      }
    };
    const runClassification = (forceSearch = false) => {
      if (!classifyBadge) return;
      classifyBadge.className = "ad-classify-badge ad-badge-loading";
      classifyBadge.innerHTML = `<span class="ad-spinner-dot"></span> AI initializing...`;
      classifyBadge.title = "Starting classification workflow...";
      if (reclassifyBtn) {
        reclassifyBtn.classList.add("is-spinning");
        reclassifyBtn.style.display = "inline-flex";
      }
      const pageContext = extractPageContext();
      try {
        const port = chrome.runtime.connect({ name: "ad-classify" });
        port.onMessage.addListener((msg) => {
          if (!isExtensionContextValid()) return;
          if (msg.type === "PROGRESS" && msg.progress) {
            const prog = msg.progress;
            const isFallback = prog.stage === "FALLBACK_SWITCH";
            classifyBadge.className = isFallback ? "ad-classify-badge ad-badge-fallback ad-badge-loading" : "ad-classify-badge ad-badge-loading";
            classifyBadge.innerHTML = `<span class="ad-spinner-dot"></span> ${escapeHtml(prog.message)}`;
            classifyBadge.title = prog.message;
            return;
          }
          if (msg.type === "RESULT" && msg.result) {
            if (reclassifyBtn) reclassifyBtn.classList.remove("is-spinning");
            const res = msg.result;
            handleClassificationResult(res);
            try {
              port.disconnect();
            } catch (_) {
            }
          }
        });
        port.onDisconnect.addListener(() => {
          if (reclassifyBtn) reclassifyBtn.classList.remove("is-spinning");
        });
        port.postMessage({
          type: "START_CLASSIFY",
          pageContext,
          availableCategories,
          forceSearch
        });
      } catch (_) {
        try {
          chrome.runtime.sendMessage(
            {
              type: "CLASSIFY_WEBSITE",
              pageContext,
              availableCategories,
              forceSearch
            },
            (res) => {
              if (reclassifyBtn) reclassifyBtn.classList.remove("is-spinning");
              if (!isExtensionContextValid()) return;
              handleClassificationResult(res);
            }
          );
        } catch (err) {
          if (reclassifyBtn) reclassifyBtn.classList.remove("is-spinning");
          if (classifyBadge) {
            classifyBadge.className = "ad-classify-badge ad-badge-error";
            classifyBadge.innerHTML = "\u26A0\uFE0F Error";
          }
        }
      }
    };
    if (classifyBadge) {
      classifyBadge.addEventListener("click", () => {
        if (classifyBadge.classList.contains("ad-badge-setup") || classifyBadge.classList.contains("ad-badge-error")) {
          openSettings();
        } else if (reasoningCard && reasoningCard.textContent) {
          reasoningCard.classList.toggle("ad-show");
        }
      });
    }
    if (reclassifyBtn) {
      reclassifyBtn.addEventListener("click", (e) => {
        const forceSearch = e.altKey || e.shiftKey;
        runClassification(forceSearch);
      });
    }
    try {
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (s) => {
        if (!isExtensionContextValid()) return;
        if (s && s.geminiApiKey) {
          if (reclassifyBtn) reclassifyBtn.style.display = "inline-flex";
          if (s.autoClassify !== false) {
            runClassification(false);
          } else if (classifyBadge) {
            classifyBadge.className = "ad-classify-badge ad-badge-dom";
            classifyBadge.innerHTML = "\u2728 Run AI Tagging";
            classifyBadge.title = "Click to classify categories using AI";
            classifyBadge.addEventListener("click", () => runClassification(false), { once: true });
          }
        } else if (classifyBadge) {
          classifyBadge.className = "ad-classify-badge ad-badge-setup";
          classifyBadge.innerHTML = "\u2699\uFE0F Setup AI";
          classifyBadge.title = "Click to enter your free Gemini API key";
        }
      });
    } catch (_) {
    }
    const saveBtn = shadow.getElementById("ad-save-btn");
    let isSaving = false;
    const doSave = () => {
      if (isSaving) return;
      try {
        if (!isExtensionContextValid()) {
          alert("The extension was reloaded. Please refresh this page to save bookmarks.");
          return;
        }
      } catch (_) {
        return;
      }
      const nameInput = shadow.getElementById("ad-name-input");
      const urlInput = shadow.getElementById("ad-url-input");
      const folderSelect = shadow.getElementById("ad-folder-select");
      const descInput = shadow.getElementById("ad-desc-input");
      if (tagInput && tagInput.value.trim()) {
        const val = tagInput.value.trim();
        addCategoryChip(val, !availableCategories.includes(val));
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
      isSaving = true;
      const successOverlay = shadow.getElementById("ad-success-overlay");
      const successSub = shadow.getElementById("ad-success-sub");
      if (successOverlay) {
        successOverlay.classList.add("ad-show");
      }
      closeTimer = setTimeout(() => {
        closeModal();
      }, 750);
      try {
        chrome.runtime.sendMessage({ type: "SAVE_BOOKMARK", entry: newBookmark }, (res) => {
          try {
            if (!isExtensionContextValid()) return;
            if (chrome.runtime.lastError || res && res.success === false) {
              if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
              }
              if (successOverlay) successOverlay.classList.remove("ad-show");
              isSaving = false;
              const errorMsg = chrome.runtime.lastError?.message || res?.error || "Failed to save bookmark";
              alert(`App Directory: ${errorMsg}`);
              return;
            }
            if (successSub && res) {
              if (res.direct) {
                successSub.textContent = "Saved directly to your open App Directory tab!";
              } else if (res.queued) {
                successSub.textContent = `Queued (${res.pendingCount || 1} pending) \u2014 will sync when App Directory opens.`;
              }
            }
          } catch (_) {
          }
        });
      } catch (err) {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        if (successOverlay) successOverlay.classList.remove("ad-show");
        isSaving = false;
        alert(`App Directory: ${err?.message || "Failed to send save request"}`);
      }
    };
    if (saveBtn) saveBtn.addEventListener("click", doSave);
    keyHandler = (e) => {
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
        if (settingsDrawer && settingsDrawer.classList.contains("ad-show")) {
          e.preventDefault();
          e.stopPropagation();
          closeSettings();
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
  window.__APP_DIRECTORY_CLEANUP__ = () => {
    try {
      window.removeEventListener("keydown", handlePageShortcut, true);
      document.querySelectorAll("#app-directory-modal-host").forEach((node) => node.remove());
    } catch (_) {
    }
  };
  function handlePageShortcut(e) {
    if (!isExtensionContextValid()) {
      if (typeof window.__APP_DIRECTORY_CLEANUP__ === "function") {
        window.__APP_DIRECTORY_CLEANUP__();
      }
      return;
    }
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const isA = e.code === "KeyA" || e.key === "a" || e.key === "A";
    const isS = e.code === "KeyS" || e.key === "s" || e.key === "S";
    const isB = e.code === "KeyB" || e.key === "b" || e.key === "B";
    const isD = e.code === "KeyD" || e.key === "d" || e.key === "D";
    if (isA || isS || isB || isD) {
      e.preventDefault();
      e.stopPropagation();
      toggleModal();
    }
  }
  window.addEventListener("keydown", handlePageShortcut, true);
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
