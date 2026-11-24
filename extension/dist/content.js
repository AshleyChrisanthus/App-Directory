"use strict";
(() => {
  // src/extension/modal.css
  var modal_default = ":host {\r\n  all: initial;\r\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\r\n  color: #f1f5f9;\r\n  font-size: 14px;\r\n  line-height: 1.5;\r\n  box-sizing: border-box;\r\n}\r\n\r\n*, *::before, *::after {\r\n  box-sizing: border-box;\r\n  margin: 0;\r\n  padding: 0;\r\n}\r\n\r\n.ad-modal-backdrop {\r\n  position: fixed;\r\n  inset: 0;\r\n  background: rgba(10, 14, 23, 0.68);\r\n  backdrop-filter: blur(8px);\r\n  -webkit-backdrop-filter: blur(8px);\r\n  z-index: 2147483647;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  opacity: 0;\r\n  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);\r\n  padding: 16px;\r\n}\r\n\r\n.ad-modal-backdrop.ad-visible {\r\n  opacity: 1;\r\n}\r\n\r\n.ad-modal-card {\r\n  width: 100%;\r\n  max-width: 480px;\r\n  background: rgba(22, 28, 42, 0.94);\r\n  backdrop-filter: blur(24px);\r\n  -webkit-backdrop-filter: blur(24px);\r\n  border: 1px solid rgba(255, 255, 255, 0.14);\r\n  border-radius: 16px;\r\n  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);\r\n  overflow: hidden;\r\n  transform: scale(0.94) translateY(8px);\r\n  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.ad-modal-backdrop.ad-visible .ad-modal-card {\r\n  transform: scale(1) translateY(0);\r\n}\r\n\r\n/* Header */\r\n.ad-modal-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: 16px 20px;\r\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\r\n  background: rgba(255, 255, 255, 0.02);\r\n}\r\n\r\n.ad-modal-title-group {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 10px;\r\n}\r\n\r\n.ad-app-icon {\r\n  width: 28px;\r\n  height: 28px;\r\n  border-radius: 7px;\r\n  background: linear-gradient(135deg, #0a84ff, #5e5ce6);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-size: 15px;\r\n  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.35);\r\n}\r\n\r\n.ad-modal-title {\r\n  font-size: 16px;\r\n  font-weight: 700;\r\n  color: #ffffff;\r\n  letter-spacing: -0.2px;\r\n}\r\n\r\n.ad-badge-local {\r\n  font-size: 10px;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  background: rgba(52, 199, 89, 0.18);\r\n  color: #34c759;\r\n  border: 1px solid rgba(52, 199, 89, 0.3);\r\n  padding: 2px 6px;\r\n  border-radius: 4px;\r\n}\r\n\r\n.ad-header-actions {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n}\r\n\r\n.ad-icon-btn, .ad-close-btn {\r\n  background: transparent;\r\n  border: none;\r\n  color: #94a3b8;\r\n  font-size: 16px;\r\n  cursor: pointer;\r\n  width: 28px;\r\n  height: 28px;\r\n  border-radius: 6px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  transition: all 0.15s ease;\r\n}\r\n\r\n.ad-icon-btn:hover, .ad-close-btn:hover {\r\n  background: rgba(255, 255, 255, 0.08);\r\n  color: #ffffff;\r\n}\r\n\r\n/* Body Form */\r\n.ad-modal-body {\r\n  padding: 20px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 14px;\r\n  max-height: 70vh;\r\n  overflow-y: auto;\r\n}\r\n\r\n.ad-field-row {\r\n  display: flex;\r\n  gap: 12px;\r\n  align-items: flex-start;\r\n}\r\n\r\n.ad-icon-preview-box {\r\n  width: 44px;\r\n  height: 44px;\r\n  border-radius: 10px;\r\n  background: rgba(255, 255, 255, 0.06);\r\n  border: 1px solid rgba(255, 255, 255, 0.12);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  flex-shrink: 0;\r\n  overflow: hidden;\r\n  margin-top: 22px;\r\n}\r\n\r\n.ad-icon-preview-box img {\r\n  width: 26px;\r\n  height: 26px;\r\n  object-fit: contain;\r\n}\r\n\r\n.ad-form-group {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 5px;\r\n  flex: 1;\r\n}\r\n\r\n.ad-form-label {\r\n  font-size: 12px;\r\n  font-weight: 600;\r\n  color: #94a3b8;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n}\r\n\r\n.ad-input, .ad-select, .ad-textarea {\r\n  background: rgba(15, 23, 42, 0.65);\r\n  border: 1px solid rgba(255, 255, 255, 0.12);\r\n  border-radius: 8px;\r\n  padding: 8px 12px;\r\n  font-size: 13.5px;\r\n  color: #f8fafc;\r\n  outline: none;\r\n  transition: border-color 0.15s ease, box-shadow 0.15s ease;\r\n  width: 100%;\r\n  font-family: inherit;\r\n}\r\n\r\n.ad-input:focus, .ad-select:focus, .ad-textarea:focus {\r\n  border-color: #0a84ff;\r\n  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);\r\n  background: rgba(15, 23, 42, 0.85);\r\n}\r\n\r\n.ad-textarea {\r\n  resize: vertical;\r\n  min-height: 52px;\r\n}\r\n\r\n.ad-two-col {\r\n  display: grid;\r\n  grid-template-columns: 1fr 1fr;\r\n  gap: 12px;\r\n}\r\n\r\n/* Category Tags */\r\n.ad-categories-field {\r\n  position: relative;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 5px;\r\n}\r\n\r\n.ad-tags-wrapper {\r\n  background: rgba(15, 23, 42, 0.65);\r\n  border: 1px solid rgba(255, 255, 255, 0.12);\r\n  border-radius: 8px;\r\n  padding: 6px 8px;\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  align-items: center;\r\n  gap: 6px;\r\n  min-height: 40px;\r\n}\r\n\r\n.ad-tags-wrapper:focus-within {\r\n  border-color: #0a84ff;\r\n  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);\r\n}\r\n\r\n.ad-tag-chip {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n  background: rgba(10, 132, 255, 0.18);\r\n  border: 1px solid rgba(10, 132, 255, 0.35);\r\n  color: #60a5fa;\r\n  padding: 2px 7px;\r\n  border-radius: 5px;\r\n  font-size: 12px;\r\n  font-weight: 500;\r\n}\r\n\r\n.ad-tag-chip .ad-remove-tag {\r\n  cursor: pointer;\r\n  font-size: 13px;\r\n  opacity: 0.75;\r\n  transition: opacity 0.1s ease;\r\n  line-height: 1;\r\n}\r\n\r\n.ad-tag-chip .ad-remove-tag:hover {\r\n  opacity: 1;\r\n  color: #f87171;\r\n}\r\n\r\n.ad-tag-input {\r\n  border: none;\r\n  background: transparent;\r\n  color: #f8fafc;\r\n  font-size: 13px;\r\n  outline: none;\r\n  flex: 1;\r\n  min-width: 90px;\r\n  font-family: inherit;\r\n  padding: 2px 4px;\r\n}\r\n\r\n/* Category Suggestions Autocomplete Popup */\r\n.ad-suggestions-popup {\r\n  position: absolute;\r\n  top: 100%;\r\n  left: 0;\r\n  right: 0;\r\n  margin-top: 4px;\r\n  background: rgba(15, 23, 42, 0.96);\r\n  backdrop-filter: blur(20px);\r\n  -webkit-backdrop-filter: blur(20px);\r\n  border: 1px solid rgba(255, 255, 255, 0.16);\r\n  border-radius: 8px;\r\n  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);\r\n  max-height: 180px;\r\n  overflow-y: auto;\r\n  z-index: 50;\r\n  display: none;\r\n  flex-direction: column;\r\n  padding: 4px;\r\n}\r\n\r\n.ad-suggestions-popup.ad-show {\r\n  display: flex;\r\n}\r\n\r\n.ad-suggestion-item {\r\n  padding: 6px 10px;\r\n  font-size: 13px;\r\n  color: #cbd5e1;\r\n  cursor: pointer;\r\n  border-radius: 6px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  transition: background 0.12s ease, color 0.12s ease;\r\n}\r\n\r\n.ad-suggestion-item:hover,\r\n.ad-suggestion-item.is-focused {\r\n  background: rgba(10, 132, 255, 0.25);\r\n  color: #ffffff;\r\n}\r\n\r\n.ad-suggestion-item .ad-suggest-tag-name {\r\n  font-weight: 500;\r\n}\r\n\r\n.ad-suggestion-item .ad-suggest-tag-hint {\r\n  font-size: 11px;\r\n  color: #64748b;\r\n}\r\n\r\n.ad-suggestion-item:hover .ad-suggest-tag-hint,\r\n.ad-suggestion-item.is-focused .ad-suggest-tag-hint {\r\n  color: #93c5fd;\r\n}\r\n\r\n/* Favorite toggle */\r\n.ad-fav-toggle {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n  cursor: pointer;\r\n  user-select: none;\r\n  font-size: 13px;\r\n  color: #cbd5e1;\r\n}\r\n\r\n.ad-fav-star {\r\n  font-size: 16px;\r\n  color: #64748b;\r\n  transition: color 0.15s ease, transform 0.15s ease;\r\n}\r\n\r\n.ad-fav-toggle.active .ad-fav-star {\r\n  color: #ffb800;\r\n  transform: scale(1.15);\r\n}\r\n\r\n/* Footer */\r\n.ad-modal-footer {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: 14px 20px;\r\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\r\n  background: rgba(255, 255, 255, 0.02);\r\n}\r\n\r\n.ad-shortcut-hint {\r\n  font-size: 11px;\r\n  color: #64748b;\r\n}\r\n\r\n.ad-shortcut-hint kbd {\r\n  background: rgba(255, 255, 255, 0.08);\r\n  border: 1px solid rgba(255, 255, 255, 0.15);\r\n  border-radius: 4px;\r\n  padding: 1px 4px;\r\n  font-size: 10px;\r\n  color: #94a3b8;\r\n}\r\n\r\n.ad-btn-group {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.ad-btn {\r\n  padding: 7px 14px;\r\n  border-radius: 8px;\r\n  font-size: 13px;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  border: none;\r\n  transition: all 0.15s ease;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 5px;\r\n  font-family: inherit;\r\n}\r\n\r\n.ad-btn-secondary {\r\n  background: rgba(255, 255, 255, 0.07);\r\n  color: #cbd5e1;\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n}\r\n\r\n.ad-btn-secondary:hover {\r\n  background: rgba(255, 255, 255, 0.12);\r\n  color: #ffffff;\r\n}\r\n\r\n.ad-btn-primary {\r\n  background: #0a84ff;\r\n  color: #ffffff;\r\n  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.35);\r\n}\r\n\r\n.ad-btn-primary:hover {\r\n  background: #0070e0;\r\n  box-shadow: 0 3px 12px rgba(10, 132, 255, 0.5);\r\n  transform: translateY(-1px);\r\n}\r\n\r\n.ad-btn-primary:active {\r\n  transform: translateY(0);\r\n}\r\n\r\n/* Success Banner */\r\n.ad-success-overlay {\r\n  position: absolute;\r\n  inset: 0;\r\n  background: rgba(15, 23, 42, 0.95);\r\n  backdrop-filter: blur(12px);\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  justify-content: center;\r\n  gap: 10px;\r\n  border-radius: 16px;\r\n  opacity: 0;\r\n  pointer-events: none;\r\n  transition: opacity 0.2s ease;\r\n  z-index: 10;\r\n}\r\n\r\n.ad-success-overlay.ad-show {\r\n  opacity: 1;\r\n  pointer-events: auto;\r\n}\r\n\r\n.ad-success-icon {\r\n  width: 48px;\r\n  height: 48px;\r\n  border-radius: 50%;\r\n  background: rgba(52, 199, 89, 0.18);\r\n  border: 2px solid #34c759;\r\n  color: #34c759;\r\n  font-size: 24px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  animation: adPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);\r\n}\r\n\r\n.ad-success-text {\r\n  font-size: 16px;\r\n  font-weight: 700;\r\n  color: #ffffff;\r\n}\r\n\r\n.ad-success-sub {\r\n  font-size: 12px;\r\n  color: #94a3b8;\r\n}\r\n\r\n@keyframes adPop {\r\n  0% { transform: scale(0.5); opacity: 0; }\r\n  70% { transform: scale(1.1); }\r\n  100% { transform: scale(1); opacity: 1; }\r\n}\r\n\r\n/* \u2500\u2500 Category Header & AI Classification Badges \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r\n.ad-category-header-row {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  margin-bottom: 3px;\r\n}\r\n\r\n.ad-ai-status-group {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n}\r\n\r\n.ad-classify-badge {\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  border-radius: 12px;\r\n  padding: 2px 8px;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n  letter-spacing: 0.2px;\r\n  user-select: none;\r\n  transition: all 0.2s ease;\r\n  max-width: 260px;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n\r\n.ad-classify-badge.ad-badge-dom {\r\n  background: rgba(52, 199, 89, 0.16);\r\n  color: #34c759;\r\n  border: 1px solid rgba(52, 199, 89, 0.35);\r\n  cursor: pointer;\r\n}\r\n\r\n.ad-classify-badge.ad-badge-dom:hover {\r\n  background: rgba(52, 199, 89, 0.26);\r\n}\r\n\r\n.ad-classify-badge.ad-badge-fallback {\r\n  background: rgba(168, 85, 247, 0.16);\r\n  color: #c084fc;\r\n  border: 1px solid rgba(168, 85, 247, 0.35);\r\n  cursor: pointer;\r\n}\r\n\r\n.ad-classify-badge.ad-badge-fallback:hover {\r\n  background: rgba(168, 85, 247, 0.26);\r\n}\r\n\r\n.ad-classify-badge.ad-badge-brave {\r\n  background: rgba(255, 159, 10, 0.16);\r\n  color: #ff9f0a;\r\n  border: 1px solid rgba(255, 159, 10, 0.35);\r\n  cursor: pointer;\r\n}\r\n\r\n.ad-classify-badge.ad-badge-brave:hover {\r\n  background: rgba(255, 159, 10, 0.26);\r\n}\r\n\r\n.ad-classify-badge.ad-badge-loading {\r\n  background: rgba(10, 132, 255, 0.15);\r\n  color: #60a5fa;\r\n  border: 1px solid rgba(10, 132, 255, 0.3);\r\n}\r\n\r\n.ad-classify-badge.ad-badge-setup {\r\n  background: rgba(255, 255, 255, 0.08);\r\n  color: #cbd5e1;\r\n  border: 1px solid rgba(255, 255, 255, 0.18);\r\n  cursor: pointer;\r\n}\r\n\r\n.ad-classify-badge.ad-badge-setup:hover {\r\n  background: rgba(255, 255, 255, 0.16);\r\n  color: #ffffff;\r\n}\r\n\r\n.ad-classify-badge.ad-badge-error {\r\n  background: rgba(255, 59, 48, 0.16);\r\n  color: #ff453a;\r\n  border: 1px solid rgba(255, 59, 48, 0.35);\r\n  cursor: pointer;\r\n}\r\n\r\n.ad-classify-badge.ad-badge-duplicate {\r\n  background: rgba(255, 159, 10, 0.16);\r\n  color: #ff9f0a;\r\n  border: 1px solid rgba(255, 159, 10, 0.35);\r\n  cursor: pointer;\r\n}\r\n\r\n.ad-classify-badge.ad-badge-duplicate:hover {\r\n  background: rgba(255, 159, 10, 0.26);\r\n}\r\n\r\n.ad-reclassify-btn {\r\n  background: transparent;\r\n  border: none;\r\n  color: #94a3b8;\r\n  font-size: 13px;\r\n  cursor: pointer;\r\n  width: 22px;\r\n  height: 22px;\r\n  border-radius: 4px;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  transition: all 0.15s ease;\r\n}\r\n\r\n.ad-reclassify-btn:hover {\r\n  background: rgba(255, 255, 255, 0.1);\r\n  color: #ffffff;\r\n}\r\n\r\n.ad-reclassify-btn.is-spinning {\r\n  animation: adSpin 0.75s linear infinite;\r\n}\r\n\r\n@keyframes adSpin {\r\n  100% { transform: rotate(360deg); }\r\n}\r\n\r\n.ad-spinner-dot {\r\n  display: inline-block;\r\n  width: 8px;\r\n  height: 8px;\r\n  border: 1.5px solid rgba(96, 165, 250, 0.3);\r\n  border-top-color: #60a5fa;\r\n  border-radius: 50%;\r\n  animation: adSpin 0.7s linear infinite;\r\n}\r\n\r\n/* AI Reasoning Card / Popover */\r\n.ad-reasoning-card {\r\n  margin-top: 4px;\r\n  padding: 6px 10px;\r\n  background: rgba(15, 23, 42, 0.85);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  border-left: 3px solid #0a84ff;\r\n  border-radius: 6px;\r\n  font-size: 11px;\r\n  color: #94a3b8;\r\n  line-height: 1.45;\r\n  display: none;\r\n}\r\n\r\n.ad-reasoning-card.ad-show {\r\n  display: block;\r\n}\r\n\r\n/* New Category Tag Chip highlight */\r\n.ad-tag-chip.ad-tag-chip-new {\r\n  background: linear-gradient(135deg, rgba(255, 214, 10, 0.22), rgba(255, 159, 10, 0.14));\r\n  border: 1px solid rgba(255, 214, 10, 0.55);\r\n  color: #ffd60a;\r\n  box-shadow: 0 0 10px rgba(255, 214, 10, 0.15);\r\n}\r\n\r\n.ad-tag-chip.ad-tag-chip-new .ad-remove-tag:hover {\r\n  color: #ff453a;\r\n}\r\n\r\n.ad-new-tags-notice {\r\n  font-size: 11px;\r\n  color: #ffd60a;\r\n  margin-top: 4px;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n  font-weight: 500;\r\n}\r\n\r\n/* Settings Drawer / View inside modal */\r\n.ad-settings-drawer {\r\n  position: absolute;\r\n  inset: 0;\r\n  background: rgba(18, 24, 38, 0.98);\r\n  backdrop-filter: blur(24px);\r\n  -webkit-backdrop-filter: blur(24px);\r\n  border-radius: 16px;\r\n  z-index: 20;\r\n  display: flex;\r\n  flex-direction: column;\r\n  transform: translateX(100%);\r\n  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);\r\n}\r\n\r\n.ad-settings-drawer.ad-show {\r\n  transform: translateX(0);\r\n}\r\n\r\n.ad-settings-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: 16px 20px;\r\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\r\n}\r\n\r\n.ad-settings-title {\r\n  font-size: 15px;\r\n  font-weight: 700;\r\n  color: #ffffff;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.ad-settings-body {\r\n  padding: 20px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 14px;\r\n  overflow-y: auto;\r\n  flex: 1;\r\n}\r\n\r\n.ad-settings-hint {\r\n  font-size: 12px;\r\n  color: #94a3b8;\r\n  line-height: 1.45;\r\n}\r\n\r\n.ad-settings-hint a {\r\n  color: #0a84ff;\r\n  text-decoration: none;\r\n}\r\n\r\n.ad-settings-hint a:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.ad-checkbox-row {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n  cursor: pointer;\r\n  user-select: none;\r\n  font-size: 13px;\r\n  color: #cbd5e1;\r\n  margin-top: 4px;\r\n}\r\n\r\n.ad-checkbox-row input {\r\n  accent-color: #0a84ff;\r\n  width: 16px;\r\n  height: 16px;\r\n  cursor: pointer;\r\n}\r\n\r\n.ad-settings-footer {\r\n  padding: 14px 20px;\r\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: flex-end;\r\n  gap: 10px;\r\n  background: rgba(255, 255, 255, 0.02);\r\n}\r\n\r\n/* Duplicate Suggestion Drawer (Slides in from the right) */\r\n.ad-duplicate-drawer {\r\n  position: absolute;\r\n  top: 0;\r\n  right: 0;\r\n  bottom: 0;\r\n  width: 100%;\r\n  background: rgba(18, 24, 38, 0.98);\r\n  backdrop-filter: blur(24px);\r\n  -webkit-backdrop-filter: blur(24px);\r\n  border-radius: 16px;\r\n  z-index: 15;\r\n  display: flex;\r\n  flex-direction: column;\r\n  transform: translateX(100%);\r\n  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);\r\n  box-shadow: -8px 0 25px rgba(0, 0, 0, 0.4);\r\n}\r\n\r\n.ad-duplicate-drawer.ad-show {\r\n  transform: translateX(0);\r\n}\r\n\r\n.ad-duplicate-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  padding: 14px 18px;\r\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\r\n  background: rgba(255, 159, 10, 0.06);\r\n}\r\n\r\n.ad-duplicate-title {\r\n  font-size: 14px;\r\n  font-weight: 700;\r\n  color: #ff9f0a;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.ad-duplicate-badge {\r\n  font-size: 10px;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  background: rgba(255, 159, 10, 0.18);\r\n  color: #ff9f0a;\r\n  border: 1px solid rgba(255, 159, 10, 0.35);\r\n  padding: 2px 6px;\r\n  border-radius: 4px;\r\n}\r\n\r\n.ad-duplicate-body {\r\n  padding: 18px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 14px;\r\n  overflow-y: auto;\r\n  flex: 1;\r\n}\r\n\r\n.ad-duplicate-notice {\r\n  font-size: 12.5px;\r\n  line-height: 1.5;\r\n  color: #cbd5e1;\r\n}\r\n\r\n.ad-duplicate-card {\r\n  background: rgba(15, 23, 42, 0.7);\r\n  border: 1px solid rgba(255, 159, 10, 0.25);\r\n  border-radius: 10px;\r\n  padding: 14px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 10px;\r\n}\r\n\r\n.ad-duplicate-card-header {\r\n  display: flex;\r\n  align-items: flex-start;\r\n  gap: 10px;\r\n}\r\n\r\n.ad-duplicate-card-icon {\r\n  width: 32px;\r\n  height: 32px;\r\n  border-radius: 8px;\r\n  background: rgba(255, 255, 255, 0.06);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  flex-shrink: 0;\r\n  font-size: 16px;\r\n  overflow: hidden;\r\n}\r\n\r\n.ad-duplicate-card-icon img {\r\n  width: 20px;\r\n  height: 20px;\r\n  object-fit: contain;\r\n}\r\n\r\n.ad-duplicate-card-meta {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n  min-width: 0;\r\n  flex: 1;\r\n}\r\n\r\n.ad-duplicate-entry-title {\r\n  font-size: 13.5px;\r\n  font-weight: 600;\r\n  color: #f8fafc;\r\n  word-break: break-word;\r\n}\r\n\r\n.ad-duplicate-entry-url {\r\n  font-size: 11.5px;\r\n  color: #38bdf8;\r\n  text-decoration: none;\r\n  word-break: break-all;\r\n  line-height: 1.35;\r\n}\r\n\r\n.ad-duplicate-entry-url:hover {\r\n  text-decoration: underline;\r\n}\r\n\r\n.ad-duplicate-details {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 6px;\r\n  font-size: 11.5px;\r\n  color: #94a3b8;\r\n  padding-top: 8px;\r\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\r\n}\r\n\r\n.ad-duplicate-detail-row {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 8px;\r\n}\r\n\r\n.ad-duplicate-detail-label {\r\n  color: #64748b;\r\n  font-size: 11px;\r\n}\r\n\r\n.ad-duplicate-detail-value {\r\n  color: #e2e8f0;\r\n  font-weight: 500;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n  white-space: nowrap;\r\n}\r\n\r\n.ad-duplicate-tags {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  gap: 4px;\r\n  margin-top: 2px;\r\n}\r\n\r\n.ad-duplicate-tag {\r\n  background: rgba(10, 132, 255, 0.14);\r\n  border: 1px solid rgba(10, 132, 255, 0.28);\r\n  color: #93c5fd;\r\n  padding: 1px 6px;\r\n  border-radius: 4px;\r\n  font-size: 10.5px;\r\n}\r\n\r\n.ad-duplicate-footer {\r\n  padding: 12px 18px;\r\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 10px;\r\n  background: rgba(255, 255, 255, 0.02);\r\n}\r\n\r\n.ad-duplicate-footer-hint {\r\n  font-size: 11px;\r\n  color: #94a3b8;\r\n  flex: 1;\r\n}\r\n\r\n.ad-duplicate-banner-trigger {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n  padding: 3px 8px;\r\n  border-radius: 5px;\r\n  background: rgba(255, 159, 10, 0.14);\r\n  border: 1px solid rgba(255, 159, 10, 0.3);\r\n  color: #ff9f0a;\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  transition: all 0.15s ease;\r\n}\r\n\r\n.ad-duplicate-banner-trigger:hover {\r\n  background: rgba(255, 159, 10, 0.22);\r\n  border-color: rgba(255, 159, 10, 0.5);\r\n  color: #ffb340;\r\n}\r\n\r\n/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\r\n   Command Palette Modal Styles (Alt+K)\r\n   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\r\n\r\n.ad-palette-card {\r\n  width: 100%;\r\n  max-width: 580px;\r\n  background: rgba(22, 28, 42, 0.94);\r\n  backdrop-filter: blur(24px);\r\n  -webkit-backdrop-filter: blur(24px);\r\n  border: 1px solid rgba(255, 255, 255, 0.14);\r\n  border-radius: 16px;\r\n  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08);\r\n  overflow: hidden;\r\n  transform: scale(0.95) translateY(8px);\r\n  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n.ad-modal-backdrop.ad-visible .ad-palette-card {\r\n  transform: scale(1) translateY(0);\r\n}\r\n\r\n/* Search Bar */\r\n.ad-palette-search-bar {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n  padding: 14px 18px;\r\n  border-bottom: 1px solid rgba(255, 255, 255, 0.08);\r\n  background: rgba(255, 255, 255, 0.02);\r\n}\r\n\r\n.ad-palette-search-icon {\r\n  font-size: 17px;\r\n  color: #94a3b8;\r\n  flex-shrink: 0;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n}\r\n\r\n.ad-palette-input {\r\n  flex: 1;\r\n  background: transparent;\r\n  border: none;\r\n  outline: none;\r\n  color: #ffffff;\r\n  font-size: 15px;\r\n  font-family: inherit;\r\n}\r\n\r\n.ad-palette-input::placeholder {\r\n  color: #64748b;\r\n}\r\n\r\n.ad-palette-counter {\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  color: #94a3b8;\r\n  background: rgba(255, 255, 255, 0.08);\r\n  padding: 2px 8px;\r\n  border-radius: 12px;\r\n  white-space: nowrap;\r\n}\r\n\r\n.ad-palette-esc-badge {\r\n  font-size: 10px;\r\n  font-weight: 700;\r\n  padding: 3px 6px;\r\n  border-radius: 5px;\r\n  background: rgba(255, 255, 255, 0.08);\r\n  border: 1px solid rgba(255, 255, 255, 0.12);\r\n  color: #94a3b8;\r\n  cursor: pointer;\r\n  transition: all 0.15s ease;\r\n}\r\n\r\n.ad-palette-esc-badge:hover {\r\n  background: rgba(255, 255, 255, 0.15);\r\n  color: #ffffff;\r\n}\r\n\r\n/* Results List */\r\n.ad-palette-results {\r\n  padding: 8px 10px;\r\n  max-height: 400px;\r\n  overflow-y: auto;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 3px;\r\n}\r\n\r\n.ad-palette-results::-webkit-scrollbar {\r\n  width: 6px;\r\n}\r\n\r\n.ad-palette-results::-webkit-scrollbar-thumb {\r\n  background: rgba(255, 255, 255, 0.15);\r\n  border-radius: 3px;\r\n}\r\n\r\n.ad-palette-section-title {\r\n  font-size: 11px;\r\n  font-weight: 700;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n  color: #64748b;\r\n  padding: 8px 10px 4px 10px;\r\n}\r\n\r\n.ad-palette-empty {\r\n  padding: 36px 16px;\r\n  text-align: center;\r\n  color: #94a3b8;\r\n  font-size: 13.5px;\r\n  display: flex;\r\n  flex-direction: column;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.ad-palette-empty-icon {\r\n  font-size: 28px;\r\n  opacity: 0.7;\r\n}\r\n\r\n/* Result Row Item */\r\n.ad-palette-item {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n  padding: 9px 12px;\r\n  border-radius: 10px;\r\n  cursor: pointer;\r\n  transition: all 0.12s ease;\r\n  border: 1px solid transparent;\r\n}\r\n\r\n.ad-palette-item:hover,\r\n.ad-palette-item.is-selected {\r\n  background: rgba(10, 132, 255, 0.15);\r\n  border-color: rgba(10, 132, 255, 0.35);\r\n}\r\n\r\n.ad-palette-item-icon {\r\n  width: 32px;\r\n  height: 32px;\r\n  border-radius: 8px;\r\n  background: rgba(255, 255, 255, 0.06);\r\n  border: 1px solid rgba(255, 255, 255, 0.1);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-size: 15px;\r\n  flex-shrink: 0;\r\n  overflow: hidden;\r\n}\r\n\r\n.ad-palette-item-icon img {\r\n  width: 20px;\r\n  height: 20px;\r\n  object-fit: contain;\r\n}\r\n\r\n.ad-palette-item-info {\r\n  flex: 1;\r\n  min-width: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n}\r\n\r\n.ad-palette-item-title-row {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n}\r\n\r\n.ad-palette-item-title {\r\n  font-size: 13.5px;\r\n  font-weight: 600;\r\n  color: #f8fafc;\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.ad-palette-fav-star {\r\n  color: #f59e0b;\r\n  font-size: 12px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.ad-palette-item-subtitle {\r\n  font-size: 12px;\r\n  color: #94a3b8;\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.ad-palette-item-badges {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 5px;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.ad-palette-tag {\r\n  font-size: 10.5px;\r\n  padding: 2px 6px;\r\n  border-radius: 4px;\r\n  background: rgba(255, 255, 255, 0.08);\r\n  color: #cbd5e1;\r\n}\r\n\r\n.ad-palette-folder-badge {\r\n  font-size: 10.5px;\r\n  padding: 2px 6px;\r\n  border-radius: 4px;\r\n  font-weight: 600;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 3px;\r\n  background: rgba(10, 132, 255, 0.18);\r\n  color: #0a84ff;\r\n  border: 1px solid rgba(10, 132, 255, 0.3);\r\n}\r\n\r\n/* Quick Action Buttons on hover/selected */\r\n.ad-palette-quick-actions {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n  opacity: 0;\r\n  transition: opacity 0.15s ease;\r\n  flex-shrink: 0;\r\n}\r\n\r\n.ad-palette-item:hover .ad-palette-quick-actions,\r\n.ad-palette-item.is-selected .ad-palette-quick-actions {\r\n  opacity: 1;\r\n}\r\n\r\n.ad-palette-quick-btn {\r\n  width: 26px;\r\n  height: 26px;\r\n  border-radius: 6px;\r\n  background: rgba(255, 255, 255, 0.08);\r\n  border: 1px solid rgba(255, 255, 255, 0.12);\r\n  color: #cbd5e1;\r\n  font-size: 12px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  cursor: pointer;\r\n  transition: all 0.12s ease;\r\n}\r\n\r\n.ad-palette-quick-btn:hover {\r\n  background: #0a84ff;\r\n  color: #ffffff;\r\n  border-color: #0a84ff;\r\n  transform: scale(1.08);\r\n}\r\n\r\n/* Footer */\r\n.ad-palette-footer {\r\n  padding: 10px 18px;\r\n  border-top: 1px solid rgba(255, 255, 255, 0.08);\r\n  background: rgba(255, 255, 255, 0.02);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  font-size: 11px;\r\n  color: #94a3b8;\r\n}\r\n\r\n.ad-palette-footer-shortcuts {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n  flex-wrap: wrap;\r\n}\r\n\r\n.ad-palette-footer-shortcuts span {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n}\r\n\r\n/* \u2500\u2500 Action Chooser View \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r\n.ad-palette-action-view {\r\n  display: flex;\r\n  flex-direction: column;\r\n  padding: 18px 20px;\r\n  gap: 14px;\r\n}\r\n\r\n.ad-palette-action-header {\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: space-between;\r\n  gap: 10px;\r\n}\r\n\r\n.ad-palette-back-btn {\r\n  background: rgba(255, 255, 255, 0.06);\r\n  border: 1px solid rgba(255, 255, 255, 0.12);\r\n  color: #cbd5e1;\r\n  padding: 5px 10px;\r\n  border-radius: 6px;\r\n  font-size: 12px;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 6px;\r\n  transition: all 0.15s ease;\r\n}\r\n\r\n.ad-palette-back-btn:hover {\r\n  background: rgba(255, 255, 255, 0.12);\r\n  color: #ffffff;\r\n}\r\n\r\n.ad-palette-target-info {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 12px;\r\n  padding: 12px 14px;\r\n  border-radius: 12px;\r\n  background: rgba(255, 255, 255, 0.03);\r\n  border: 1px solid rgba(255, 255, 255, 0.08);\r\n}\r\n\r\n.ad-palette-target-icon {\r\n  width: 38px;\r\n  height: 38px;\r\n  border-radius: 9px;\r\n  background: rgba(255, 255, 255, 0.08);\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-size: 18px;\r\n  flex-shrink: 0;\r\n  overflow: hidden;\r\n}\r\n\r\n.ad-palette-target-icon img {\r\n  width: 22px;\r\n  height: 22px;\r\n  object-fit: contain;\r\n}\r\n\r\n.ad-palette-target-meta {\r\n  flex: 1;\r\n  min-width: 0;\r\n}\r\n\r\n.ad-palette-target-title {\r\n  font-size: 14px;\r\n  font-weight: 700;\r\n  color: #ffffff;\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.ad-palette-target-url {\r\n  font-size: 12px;\r\n  color: #60a5fa;\r\n  white-space: nowrap;\r\n  overflow: hidden;\r\n  text-overflow: ellipsis;\r\n}\r\n\r\n.ad-palette-prompt {\r\n  font-size: 11px;\r\n  font-weight: 700;\r\n  color: #94a3b8;\r\n  text-transform: uppercase;\r\n  letter-spacing: 0.5px;\r\n}\r\n\r\n.ad-palette-choices-list {\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 8px;\r\n}\r\n\r\n.ad-palette-choice-card {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 14px;\r\n  padding: 12px 16px;\r\n  border-radius: 12px;\r\n  background: rgba(15, 23, 42, 0.65);\r\n  border: 1px solid rgba(255, 255, 255, 0.12);\r\n  cursor: pointer;\r\n  transition: all 0.15s ease;\r\n}\r\n\r\n.ad-palette-choice-card:hover,\r\n.ad-palette-choice-card.is-selected {\r\n  background: rgba(10, 132, 255, 0.2);\r\n  border-color: rgba(10, 132, 255, 0.55);\r\n  box-shadow: 0 4px 16px rgba(10, 132, 255, 0.25);\r\n  transform: translateY(-1px);\r\n}\r\n\r\n.ad-palette-choice-icon {\r\n  width: 40px;\r\n  height: 40px;\r\n  border-radius: 10px;\r\n  display: flex;\r\n  align-items: center;\r\n  justify-content: center;\r\n  font-size: 18px;\r\n  flex-shrink: 0;\r\n  background: rgba(255, 255, 255, 0.06);\r\n  border: 1px solid rgba(255, 255, 255, 0.08);\r\n}\r\n\r\n.ad-palette-choice-text {\r\n  flex: 1;\r\n  min-width: 0;\r\n  display: flex;\r\n  flex-direction: column;\r\n  gap: 2px;\r\n}\r\n\r\n.ad-palette-choice-title {\r\n  font-size: 13.5px;\r\n  font-weight: 600;\r\n  color: #ffffff;\r\n}\r\n\r\n.ad-palette-choice-desc {\r\n  font-size: 12px;\r\n  color: #94a3b8;\r\n}\r\n\r\n.ad-palette-choice-kbd {\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n}\r\n\r\n.ad-palette-kbd {\r\n  padding: 3px 6px;\r\n  font-size: 11px;\r\n  font-weight: 700;\r\n  border-radius: 5px;\r\n  background: rgba(255, 255, 255, 0.08);\r\n  border: 1px solid rgba(255, 255, 255, 0.14);\r\n  color: #cbd5e1;\r\n}\r\n\r\n/* Floating Confirmation Toast */\r\n.ad-palette-toast {\r\n  position: fixed;\r\n  bottom: 24px;\r\n  left: 50%;\r\n  transform: translateX(-50%) translateY(20px);\r\n  opacity: 0;\r\n  background: rgba(16, 185, 129, 0.95);\r\n  backdrop-filter: blur(12px);\r\n  -webkit-backdrop-filter: blur(12px);\r\n  color: #ffffff;\r\n  padding: 8px 16px;\r\n  border-radius: 24px;\r\n  font-size: 12.5px;\r\n  font-weight: 600;\r\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);\r\n  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);\r\n  z-index: 2147483647;\r\n  pointer-events: none;\r\n  display: flex;\r\n  align-items: center;\r\n  gap: 8px;\r\n}\r\n\r\n.ad-palette-toast.ad-show {\r\n  opacity: 1;\r\n  transform: translateX(-50%) translateY(0);\r\n}\r\n\r\n/* Multi-Collection Picker & Hidden Controls in Extension */\r\n.ad-fav-toggle-compact {\r\n  padding: 4px 10px;\r\n  font-size: 12px;\r\n  border-radius: 999px;\r\n}\r\n\r\n.ad-collections-picker {\r\n  display: flex;\r\n  flex-wrap: wrap;\r\n  gap: 6px;\r\n  padding: 7px 9px;\r\n  background: rgba(15, 23, 42, 0.65);\r\n  border: 1px solid rgba(255, 255, 255, 0.12);\r\n  border-radius: 8px;\r\n  min-height: 36px;\r\n  align-items: center;\r\n}\r\n\r\n.ad-collections-empty {\r\n  font-size: 12px;\r\n  color: #64748b;\r\n  font-style: italic;\r\n}\r\n\r\n.ad-collection-pill {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 5px;\r\n  padding: 4px 9px;\r\n  border-radius: 999px;\r\n  border: 1px solid rgba(255, 255, 255, 0.14);\r\n  background: rgba(255, 255, 255, 0.05);\r\n  color: #cbd5e1;\r\n  font-size: 12px;\r\n  font-weight: 500;\r\n  cursor: pointer;\r\n  font-family: inherit;\r\n  transition: all 0.14s ease;\r\n}\r\n\r\n.ad-collection-pill:hover {\r\n  background: rgba(255, 255, 255, 0.11);\r\n  color: #ffffff;\r\n}\r\n\r\n.ad-collection-pill.active {\r\n  background: color-mix(in srgb, var(--ad-col-color, #0a84ff) 24%, transparent);\r\n  border-color: color-mix(in srgb, var(--ad-col-color, #0a84ff) 60%, transparent);\r\n  color: #ffffff;\r\n  font-weight: 600;\r\n}\r\n\r\n.ad-hidden-main-group {\r\n  padding: 7px 10px;\r\n  border-radius: 8px;\r\n  background: rgba(15, 23, 42, 0.55);\r\n  border: 1px dashed rgba(255, 255, 255, 0.18);\r\n}\r\n\r\n.ad-palette-hidden-toggle {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 4px;\r\n  padding: 3px 9px;\r\n  border-radius: 999px;\r\n  border: 1px solid rgba(255, 255, 255, 0.14);\r\n  background: rgba(255, 255, 255, 0.06);\r\n  color: #94a3b8;\r\n  font-size: 11.5px;\r\n  font-weight: 600;\r\n  cursor: pointer;\r\n  font-family: inherit;\r\n  flex-shrink: 0;\r\n  transition: all 0.14s ease;\r\n}\r\n\r\n.ad-palette-hidden-toggle:hover {\r\n  color: #f8fafc;\r\n  background: rgba(255, 255, 255, 0.12);\r\n}\r\n\r\n.ad-palette-hidden-toggle.active {\r\n  background: rgba(10, 132, 255, 0.22);\r\n  border-color: rgba(10, 132, 255, 0.55);\r\n  color: #93c5fd;\r\n}\r\n\r\n.ad-palette-hidden-badge {\r\n  display: inline-flex;\r\n  align-items: center;\r\n  gap: 3px;\r\n  padding: 2px 7px;\r\n  border-radius: 999px;\r\n  font-size: 11px;\r\n  font-weight: 600;\r\n  background: rgba(148, 163, 184, 0.14);\r\n  border: 1px dashed rgba(148, 163, 184, 0.35);\r\n  color: #cbd5e1;\r\n}\r\n\r\n\r\n";

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

  // src/utils/collections.ts
  function getEntryFolderIds(entry) {
    if (!entry) return [];
    if (Array.isArray(entry.folderIds)) {
      const seen = /* @__PURE__ */ new Set();
      const clean = [];
      for (const raw of entry.folderIds) {
        if (typeof raw === "string") {
          const trimmed = raw.trim();
          if (trimmed && !seen.has(trimmed)) {
            seen.add(trimmed);
            clean.push(trimmed);
          }
        }
      }
      return clean;
    }
    if (typeof entry.folderId === "string" && entry.folderId.trim()) {
      return [entry.folderId.trim()];
    }
    return [];
  }

  // src/extension/paletteModal.ts
  function isExtensionContextValid() {
    try {
      return typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined" && !!chrome.runtime.id;
    } catch {
      return false;
    }
  }
  function escapeHtml(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function getDomain(rawUrl) {
    try {
      const u = new URL(rawUrl);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return rawUrl;
    }
  }
  var isPaletteOpening = false;
  var lastPaletteToggleTimestamp = 0;
  function togglePaletteModal() {
    if (!isExtensionContextValid()) {
      console.warn("[App Directory Companion] Extension was reloaded. Please refresh this page.");
      return;
    }
    const now = Date.now();
    if (now - lastPaletteToggleTimestamp < 350 || isPaletteOpening) {
      return;
    }
    lastPaletteToggleTimestamp = now;
    const existingHost = document.getElementById("app-directory-palette-host");
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
    const addModalHost = document.getElementById("app-directory-modal-host");
    if (addModalHost) {
      addModalHost.remove();
    }
    isPaletteOpening = true;
    try {
      chrome.runtime.sendMessage({ type: "GET_APP_DIRECTORY_STATE" }, (response) => {
        isPaletteOpening = false;
        try {
          if (!isExtensionContextValid()) return;
          if (chrome.runtime.lastError) return;
          if (document.getElementById("app-directory-palette-host")) {
            return;
          }
          const folders = response && response.folders || [];
          const categories = response && response.categories || [];
          const entries = response && response.entries || [];
          renderPaletteModal(folders, categories, entries);
        } catch (_) {
        }
      });
    } catch (_) {
      isPaletteOpening = false;
    }
  }
  var ACTION_CHOICES = [
    {
      id: "current",
      title: "Open in Current Tab",
      desc: "Navigate active tab to this website",
      icon: "\u{1F4C4}",
      kbd: "Enter",
      numberKey: "1"
    },
    {
      id: "new-tab",
      title: "Open in New Tab",
      desc: "Open in a foreground tab & switch to it",
      icon: "\u2197\uFE0F",
      kbd: "Ctrl+Enter",
      numberKey: "2"
    },
    {
      id: "background-tab",
      title: "Open in New Background Tab",
      desc: "Open silently in background without leaving this page",
      icon: "\u29C9",
      kbd: "Shift+Enter",
      numberKey: "3"
    }
  ];
  function renderPaletteModal(availableFolders, _availableCategories, cachedEntries = []) {
    document.querySelectorAll("#app-directory-palette-host").forEach((node) => node.remove());
    const host = document.createElement("div");
    host.id = "app-directory-palette-host";
    const shadow = host.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");
    styleEl.textContent = modal_default;
    shadow.appendChild(styleEl);
    const folderMap = /* @__PURE__ */ new Map();
    availableFolders.forEach((f) => folderMap.set(f.id, f));
    const allBookmarks = [...cachedEntries].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      const aVisits = a.visitCount || 0;
      const bVisits = b.visitCount || 0;
      if (bVisits !== aVisits) return bVisits - aVisits;
      const aTime = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
      const bTime = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
      return bTime - aTime;
    });
    let currentView = "search";
    let includeHidden = false;
    let selectedBookmark = null;
    let filteredBookmarks = allBookmarks.filter((e) => !e.hiddenFromMain);
    let searchSelectedIndex = 0;
    let actionSelectedIndex = 0;
    let closeTimer = null;
    let toastTimer = null;
    let keyHandler = null;
    const backdrop = document.createElement("div");
    backdrop.className = "ad-modal-backdrop";
    backdrop.innerHTML = `
    <div class="ad-palette-card">
      <!-- Search View -->
      <div id="ad-palette-search-container" style="display:flex; flex-direction:column;">
        <div class="ad-palette-search-bar">
          <span class="ad-palette-search-icon">\u{1F50D}</span>
          <input
            type="text"
            id="ad-palette-input"
            class="ad-palette-input"
            placeholder="Search saved websites (Alt+K)..."
            autocomplete="off"
            spellcheck="false"
          >
          <span id="ad-palette-counter" class="ad-palette-counter">${filteredBookmarks.length} sites</span>
          <button type="button" id="ad-palette-hidden-toggle" class="ad-palette-hidden-toggle" aria-pressed="false" title="Include hidden collection webpages in search">\u{1F648} Hidden</button>
          <span id="ad-palette-esc-btn" class="ad-palette-esc-badge" title="Close">ESC</span>
        </div>

        <div id="ad-palette-results" class="ad-palette-results"></div>

        <div class="ad-palette-footer">
          <div class="ad-palette-footer-shortcuts">
            <span><kbd class="ad-palette-kbd">\u2191\u2193</kbd> Navigate</span>
            <span><kbd class="ad-palette-kbd">\u21B5</kbd> Select</span>
            <span><kbd class="ad-palette-kbd">Ctrl+\u21B5</kbd> New Tab</span>
            <span><kbd class="ad-palette-kbd">Shift+\u21B5</kbd> Background Tab</span>
            <span><kbd class="ad-palette-kbd">Esc</kbd> Close</span>
          </div>
        </div>
      </div>

      <!-- Action Chooser View -->
      <div id="ad-palette-action-container" class="ad-palette-action-view" style="display:none;">
        <div class="ad-palette-action-header">
          <button type="button" class="ad-palette-back-btn" id="ad-palette-back-btn">
            \u2190 Back to search
          </button>
          <span id="ad-palette-action-esc-btn" class="ad-palette-esc-badge" title="Close">ESC</span>
        </div>

        <div class="ad-palette-target-info" id="ad-palette-target-info">
          <!-- Filled dynamically -->
        </div>

        <div class="ad-palette-prompt">Choose how to open this website:</div>

        <div class="ad-palette-choices-list" id="ad-palette-choices-list">
          ${ACTION_CHOICES.map(
      (choice, idx) => `
            <div class="ad-palette-choice-card ${idx === 0 ? "is-selected" : ""}" data-choice="${choice.id}" data-index="${idx}">
              <div class="ad-palette-choice-icon">${choice.icon}</div>
              <div class="ad-palette-choice-text">
                <div class="ad-palette-choice-title">${escapeHtml(choice.title)}</div>
                <div class="ad-palette-choice-desc">${escapeHtml(choice.desc)}</div>
              </div>
              <div class="ad-palette-choice-kbd">
                <span class="ad-palette-kbd">${choice.kbd}</span>
              </div>
            </div>
          `
    ).join("")}
        </div>

        <div class="ad-palette-footer" style="padding: 10px 0 0 0; border-top: 1px solid rgba(255,255,255,0.08); background: transparent;">
          <div class="ad-palette-footer-shortcuts">
            <span><kbd class="ad-palette-kbd">1</kbd>/<kbd class="ad-palette-kbd">2</kbd>/<kbd class="ad-palette-kbd">3</kbd> Quick Choice</span>
            <span><kbd class="ad-palette-kbd">\u2191\u2193</kbd> Select</span>
            <span><kbd class="ad-palette-kbd">\u21B5</kbd> Open</span>
            <span><kbd class="ad-palette-kbd">Esc</kbd> Back</span>
          </div>
        </div>
      </div>

      <!-- Floating Confirmation Toast -->
      <div class="ad-palette-toast" id="ad-palette-toast">
        <span>\u2713</span>
        <span id="ad-palette-toast-msg">Opened in background tab</span>
      </div>
    </div>
  `;
    shadow.appendChild(backdrop);
    document.body.appendChild(host);
    requestAnimationFrame(() => {
      backdrop.classList.add("ad-visible");
      const input = shadow.getElementById("ad-palette-input");
      if (input) {
        input.focus();
      }
    });
    const searchContainer = shadow.getElementById("ad-palette-search-container");
    const actionContainer = shadow.getElementById("ad-palette-action-container");
    const searchInput = shadow.getElementById("ad-palette-input");
    const resultsContainer = shadow.getElementById("ad-palette-results");
    const counterEl = shadow.getElementById("ad-palette-counter");
    const targetInfoEl = shadow.getElementById("ad-palette-target-info");
    const choicesListEl = shadow.getElementById("ad-palette-choices-list");
    const toastEl = shadow.getElementById("ad-palette-toast");
    const toastMsg = shadow.getElementById("ad-palette-toast-msg");
    const closePalette = () => {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
      }
      if (keyHandler) {
        window.removeEventListener("keydown", keyHandler, true);
      }
      backdrop.classList.remove("ad-visible");
      setTimeout(() => host.remove(), 200);
    };
    const escBtn = shadow.getElementById("ad-palette-esc-btn");
    const actionEscBtn = shadow.getElementById("ad-palette-action-esc-btn");
    const backBtn = shadow.getElementById("ad-palette-back-btn");
    if (escBtn) escBtn.addEventListener("click", closePalette);
    if (actionEscBtn) actionEscBtn.addEventListener("click", closePalette);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closePalette();
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
    const selectBookmarkForAction = (bookmark) => {
      selectedBookmark = bookmark;
      currentView = "actions";
      actionSelectedIndex = 0;
      if (searchContainer) searchContainer.style.display = "none";
      if (actionContainer) actionContainer.style.display = "flex";
      if (targetInfoEl) {
        const entryFolders = getEntryFolderIds(bookmark).map((fid) => folderMap.get(fid)).filter((f) => Boolean(f));
        const domain = getDomain(bookmark.url);
        const iconSrc = bookmark.iconUrl || bookmark.icon || "";
        const isImg = iconSrc.startsWith("http") || iconSrc.startsWith("data:");
        targetInfoEl.innerHTML = `
        <div class="ad-palette-target-icon">
          ${isImg ? `<img src="${escapeHtml(iconSrc)}" alt="" onerror="this.parentElement.textContent='\u{1F310}'">` : iconSrc || "\u{1F4C1}"}
        </div>
        <div class="ad-palette-target-meta">
          <div class="ad-palette-target-title">${escapeHtml(bookmark.name || "Untitled")}</div>
          <div class="ad-palette-target-url">${escapeHtml(domain)}${bookmark.description ? ` &bull; ${escapeHtml(bookmark.description)}` : ""}</div>
        </div>
        <div class="ad-palette-item-badges">
          ${bookmark.hiddenFromMain ? `<span class="ad-palette-hidden-badge" title="Hidden from Main view">\u{1F648} Hidden</span>` : ""}
          ${entryFolders.map((folder) => `<span class="ad-palette-folder-badge" style="${folder.color ? `background:${folder.color}1c; color:${folder.color}; border-color:${folder.color}40;` : ""}">${escapeHtml(folder.icon || "\u{1F4C1}")} ${escapeHtml(folder.name)}</span>`).join("")}
        </div>
      `;
      }
      updateActionSelection();
    };
    const backToSearchView = () => {
      currentView = "search";
      selectedBookmark = null;
      if (actionContainer) actionContainer.style.display = "none";
      if (searchContainer) searchContainer.style.display = "flex";
      if (searchInput) {
        searchInput.focus();
      }
    };
    if (backBtn) backBtn.addEventListener("click", backToSearchView);
    const executeAction = (bookmark, mode) => {
      if (!bookmark || !bookmark.url) return;
      try {
        chrome.runtime.sendMessage({
          type: "OPEN_BOOKMARK_URL",
          url: bookmark.url,
          mode,
          id: bookmark.id
        });
      } catch (_) {
      }
      if (mode === "background-tab") {
        if (toastEl && toastMsg) {
          toastMsg.textContent = `Opened "${bookmark.name}" in background tab \u2713`;
          toastEl.classList.add("ad-show");
          if (toastTimer) clearTimeout(toastTimer);
          toastTimer = setTimeout(() => {
            toastEl.classList.remove("ad-show");
          }, 2200);
        }
        if (currentView === "actions") {
          backToSearchView();
        }
      } else {
        closePalette();
      }
    };
    const updateActionSelection = () => {
      if (!choicesListEl) return;
      const cards = choicesListEl.querySelectorAll(".ad-palette-choice-card");
      cards.forEach((card, idx) => {
        card.classList.toggle("is-selected", idx === actionSelectedIndex);
      });
    };
    if (choicesListEl) {
      const cards = choicesListEl.querySelectorAll(".ad-palette-choice-card");
      cards.forEach((card, idx) => {
        card.addEventListener("mouseenter", () => {
          actionSelectedIndex = idx;
          updateActionSelection();
        });
        card.addEventListener("click", () => {
          if (!selectedBookmark) return;
          const choice = ACTION_CHOICES[idx];
          if (choice) {
            executeAction(selectedBookmark, choice.id);
          }
        });
      });
    }
    const updateSearchSelection = () => {
      if (!resultsContainer) return;
      const items = resultsContainer.querySelectorAll(".ad-palette-item");
      items.forEach((item, idx) => {
        const isSelected = idx === searchSelectedIndex;
        item.classList.toggle("is-selected", isSelected);
        if (isSelected) {
          item.scrollIntoView({ block: "nearest" });
        }
      });
    };
    const renderResults = (query) => {
      if (!resultsContainer) return;
      const searchableBookmarks = includeHidden ? allBookmarks : allBookmarks.filter((e) => !e.hiddenFromMain);
      const q = query.trim().toLowerCase();
      if (!q) {
        filteredBookmarks = searchableBookmarks;
      } else {
        filteredBookmarks = searchableBookmarks.filter((entry) => {
          const nameMatch = (entry.name || "").toLowerCase().includes(q);
          const urlMatch = (entry.url || "").toLowerCase().includes(q);
          const descMatch = (entry.description || "").toLowerCase().includes(q);
          const catMatch = (entry.categories || []).some((c) => c.toLowerCase().includes(q));
          const folderMatch = getEntryFolderIds(entry).some((fid) => {
            const folder = folderMap.get(fid);
            return folder ? folder.name.toLowerCase().includes(q) : false;
          });
          return nameMatch || urlMatch || descMatch || catMatch || folderMatch;
        });
      }
      if (counterEl) {
        counterEl.textContent = `${filteredBookmarks.length} site${filteredBookmarks.length !== 1 ? "s" : ""}`;
      }
      resultsContainer.innerHTML = "";
      if (filteredBookmarks.length === 0) {
        resultsContainer.innerHTML = `
        <div class="ad-palette-empty">
          <div class="ad-palette-empty-icon">\u{1F50D}</div>
          <div>${q ? `No matching websites found for "<strong>${escapeHtml(query)}</strong>"` : "No visible websites found"}</div>
        </div>
      `;
        return;
      }
      if (!q) {
        const secHeader = document.createElement("div");
        secHeader.className = "ad-palette-section-title";
        secHeader.textContent = "\u2605 Frequently Visited & Starred";
        resultsContainer.appendChild(secHeader);
      }
      filteredBookmarks.forEach((entry, idx) => {
        const entryFolders = getEntryFolderIds(entry).map((fid) => folderMap.get(fid)).filter((f) => Boolean(f));
        const domain = getDomain(entry.url);
        const iconSrc = entry.iconUrl || entry.icon || "";
        const isImg = iconSrc.startsWith("http") || iconSrc.startsWith("data:");
        const folderBadgesHtml = entryFolders.slice(0, 2).map(
          (folder) => `<span class="ad-palette-folder-badge" ${folder.color ? `style="background:${folder.color}1c; color:${folder.color}; border-color:${folder.color}40;"` : ""}>${escapeHtml(folder.icon || "\u{1F4C1}")} ${escapeHtml(folder.name)}</span>`
        ).join("") + (entryFolders.length > 2 ? `<span class="ad-palette-folder-badge">+${entryFolders.length - 2}</span>` : "");
        const row = document.createElement("div");
        row.className = `ad-palette-item ${idx === searchSelectedIndex ? "is-selected" : ""}`;
        row.setAttribute("data-index", String(idx));
        row.innerHTML = `
        <div class="ad-palette-item-icon">
          ${isImg ? `<img src="${escapeHtml(iconSrc)}" alt="" onerror="this.parentElement.textContent='\u{1F310}'">` : iconSrc || "\u{1F4C1}"}
        </div>
        <div class="ad-palette-item-info">
          <div class="ad-palette-item-title-row">
            <span class="ad-palette-item-title">${escapeHtml(entry.name || "Untitled")}</span>
            ${entry.isFavorite ? `<span class="ad-palette-fav-star" title="Favorite">\u2605</span>` : ""}
          </div>
          <div class="ad-palette-item-subtitle">${escapeHtml(domain)}${entry.description ? ` &bull; ${escapeHtml(entry.description)}` : ""}</div>
        </div>
        <div class="ad-palette-item-badges">
          ${entry.hiddenFromMain ? `<span class="ad-palette-hidden-badge" title="Hidden from Main view">\u{1F648}</span>` : ""}
          ${folderBadgesHtml}
          ${Array.isArray(entry.categories) && entry.categories[0] ? `<span class="ad-palette-tag">${escapeHtml(entry.categories[0])}</span>` : ""}
        </div>
        <div class="ad-palette-quick-actions">
          <button type="button" class="ad-palette-quick-btn" data-mode="current" title="Open in Current Tab (Enter)">\u{1F4C4}</button>
          <button type="button" class="ad-palette-quick-btn" data-mode="new-tab" title="Open in New Tab (Ctrl+Enter)">\u2197\uFE0F</button>
          <button type="button" class="ad-palette-quick-btn" data-mode="background-tab" title="Open in Background Tab (Shift+Enter)">\u29C9</button>
        </div>
      `;
        row.querySelectorAll(".ad-palette-quick-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const mode = btn.getAttribute("data-mode");
            executeAction(entry, mode);
          });
        });
        row.addEventListener("mouseenter", () => {
          searchSelectedIndex = idx;
          updateSearchSelection();
        });
        row.addEventListener("click", () => {
          selectBookmarkForAction(entry);
        });
        resultsContainer.appendChild(row);
      });
      if (searchSelectedIndex >= filteredBookmarks.length) {
        searchSelectedIndex = 0;
      }
      updateSearchSelection();
    };
    renderResults("");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchSelectedIndex = 0;
        renderResults(searchInput.value);
      });
    }
    const hiddenToggleBtn = shadow.getElementById("ad-palette-hidden-toggle");
    if (hiddenToggleBtn) {
      hiddenToggleBtn.addEventListener("click", () => {
        includeHidden = !includeHidden;
        hiddenToggleBtn.classList.toggle("active", includeHidden);
        hiddenToggleBtn.setAttribute("aria-pressed", String(includeHidden));
        hiddenToggleBtn.textContent = includeHidden ? "\u{1F441}\uFE0F Hidden" : "\u{1F648} Hidden";
        hiddenToggleBtn.title = includeHidden ? "Including hidden webpages in search (click to exclude)" : "Include hidden collection webpages in search";
        searchSelectedIndex = 0;
        renderResults(searchInput?.value || "");
        searchInput?.focus();
      });
    }
    keyHandler = (e) => {
      if (currentView === "actions") {
        if (e.key === "Escape" || e.key === "Backspace") {
          e.preventDefault();
          e.stopPropagation();
          backToSearchView();
          return;
        }
        if (e.key === "1") {
          e.preventDefault();
          e.stopPropagation();
          if (selectedBookmark) executeAction(selectedBookmark, "current");
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          e.stopPropagation();
          if (selectedBookmark) executeAction(selectedBookmark, "new-tab");
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          e.stopPropagation();
          if (selectedBookmark) executeAction(selectedBookmark, "background-tab");
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          actionSelectedIndex = (actionSelectedIndex + 1) % ACTION_CHOICES.length;
          updateActionSelection();
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          actionSelectedIndex = (actionSelectedIndex - 1 + ACTION_CHOICES.length) % ACTION_CHOICES.length;
          updateActionSelection();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          if (selectedBookmark) {
            const choice = ACTION_CHOICES[actionSelectedIndex];
            if (choice) {
              executeAction(selectedBookmark, choice.id);
            }
          }
          return;
        }
        return;
      }
      if (currentView === "search") {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          closePalette();
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          if (filteredBookmarks.length > 0) {
            searchSelectedIndex = (searchSelectedIndex + 1) % filteredBookmarks.length;
            updateSearchSelection();
          }
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          if (filteredBookmarks.length > 0) {
            searchSelectedIndex = (searchSelectedIndex - 1 + filteredBookmarks.length) % filteredBookmarks.length;
            updateSearchSelection();
          }
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          const selected = filteredBookmarks[searchSelectedIndex];
          if (!selected) return;
          if (e.ctrlKey || e.metaKey) {
            executeAction(selected, "new-tab");
            return;
          }
          if (e.shiftKey) {
            executeAction(selected, "background-tab");
            return;
          }
          selectBookmarkForAction(selected);
          return;
        }
      }
    };
    window.addEventListener("keydown", keyHandler, true);
  }

  // src/extension/content.ts
  if (typeof window.__APP_DIRECTORY_CLEANUP__ === "function") {
    try {
      window.__APP_DIRECTORY_CLEANUP__();
    } catch (_) {
    }
  }
  function normalizeUrlForExactComparison(rawUrl) {
    try {
      const trimmed = (rawUrl || "").trim();
      if (!trimmed) return "";
      const parsed = new URL(trimmed);
      const host = parsed.host.toLowerCase().replace(/^www\./, "");
      let pathname = parsed.pathname.replace(/\/+/g, "/");
      if (pathname.length > 1 && pathname.endsWith("/")) {
        pathname = pathname.slice(0, -1);
      }
      const searchParams = new URLSearchParams(parsed.search);
      const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "ref"];
      for (const p of trackingParams) {
        searchParams.delete(p);
      }
      searchParams.sort();
      const search = searchParams.toString();
      const queryPart = search ? `?${search}` : "";
      return `${parsed.protocol}//${host}${pathname}${queryPart}`.toLowerCase();
    } catch {
      return (rawUrl || "").trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");
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
  function isExtensionContextValid2() {
    try {
      return typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined" && !!chrome.runtime.id;
    } catch {
      return false;
    }
  }
  var isModalOpening = false;
  var lastToggleTimestamp = 0;
  function toggleModal() {
    if (!isExtensionContextValid2()) {
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
          if (!isExtensionContextValid2()) return;
          if (chrome.runtime.lastError) return;
          if (document.getElementById("app-directory-modal-host")) {
            return;
          }
          const folders = response && response.folders || [];
          const categories = response && response.categories || [];
          const entries = response && response.entries || [];
          renderModal(folders, categories, entries);
        } catch (_) {
        }
      });
    } catch (_) {
      isModalOpening = false;
    }
  }
  function renderModal(availableFolders, availableCategories, cachedEntries = []) {
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
    const currentNormalizedUrl = normalizeUrlForExactComparison(initialUrl);
    const matchedEntry = cachedEntries.find((entry) => {
      if (!entry || !entry.url) return false;
      return normalizeUrlForExactComparison(entry.url) === currentNormalizedUrl;
    });
    const selectedCategories = [];
    const selectedFolderIds = [];
    let hiddenFromMain = false;
    let isFavorite = false;
    let suggestionHighlightedIndex = -1;
    const matchedFolders = matchedEntry ? getEntryFolderIds(matchedEntry).map((fid) => availableFolders.find((f) => f.id === fid)).filter((f) => Boolean(f)) : [];
    const backdrop = document.createElement("div");
    backdrop.className = "ad-modal-backdrop";
    backdrop.innerHTML = `
    <div class="ad-modal-card">
      <div class="ad-modal-header">
        <div class="ad-modal-title-group">
          <div class="ad-app-icon">\u{1F4C1}</div>
          <span class="ad-modal-title">Add to App Directory</span>
          <span class="ad-badge-local">Local DB</span>
          ${matchedEntry ? `<button type="button" class="ad-duplicate-banner-trigger" id="ad-duplicate-banner-btn" title="View already saved bookmark details">\u26A0\uFE0F Saved in Database</button>` : ""}
        </div>
        <div class="ad-header-actions">
          <button type="button" class="ad-icon-btn" id="ad-settings-toggle-btn" title="Companion AI Settings">\u2699\uFE0F</button>
          <button type="button" class="ad-close-btn" id="ad-close-btn" title="Close (Esc)">\u2715</button>
        </div>
      </div>

      <div class="ad-modal-body">
        <div class="ad-field-row">
          <div class="ad-icon-preview-box" title="Website Icon">
            <img class="ad-icon-img" src="${escapeHtml2(initialIcon)}" alt="" onerror="this.src='https://icons.duckduckgo.com/ip3/${window.location.hostname}.ico'">
          </div>
          <div class="ad-form-group">
            <label class="ad-form-label" for="ad-name-input">Website Name</label>
            <input type="text" id="ad-name-input" class="ad-input" value="${escapeHtml2(initialTitle)}" spellcheck="false">
          </div>
        </div>

        <div class="ad-form-group">
          <label class="ad-form-label" for="ad-url-input">Website URL</label>
          <input type="url" id="ad-url-input" class="ad-input" value="${escapeHtml2(initialUrl)}" spellcheck="false">
        </div>

        <div class="ad-form-group">
          <div class="ad-category-header-row">
            <label class="ad-form-label" style="margin-bottom:0;">Collections <span style="font-weight:400;text-transform:none;opacity:0.7;">(optional)</span></label>
            <div class="ad-fav-toggle ad-fav-toggle-compact" id="ad-fav-toggle" title="Pin to Favorites">
              <span class="ad-fav-star">\u2606</span>
              <span>Favorite</span>
            </div>
          </div>
          <div class="ad-collections-picker" id="ad-collections-picker">
            ${availableFolders.length > 0 ? availableFolders.map((f) => `<button type="button" class="ad-collection-pill" data-folder-id="${escapeHtml2(f.id)}" style="${f.color ? `--ad-col-color:${escapeHtml2(f.color)};` : ""}"><span>${escapeHtml2(f.icon || "\u{1F4C1}")}</span><span>${escapeHtml2(f.name)}</span></button>`).join("") : '<span class="ad-collections-empty">No collections created yet</span>'}
          </div>
        </div>

        <div class="ad-hidden-main-group" id="ad-hidden-from-main-group" style="display: none;">
          <label class="ad-checkbox-row">
            <input type="checkbox" id="ad-hidden-from-main-check">
            <span>\u{1F648} Hide from Main view (visible only in selected collections)</span>
          </label>
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
          <textarea id="ad-desc-input" class="ad-textarea" placeholder="Add optional notes...">${escapeHtml2(initialDesc)}</textarea>
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

          <label class="ad-checkbox-row">
            <input type="checkbox" id="ad-decision-fastpath-check" checked>
            <span>Use Gemini Decision 1 fast-path before Flash</span>
          </label>
        </div>
        <div class="ad-settings-footer">
          <button type="button" class="ad-btn ad-btn-secondary" id="ad-settings-cancel-btn">Cancel</button>
          <button type="button" class="ad-btn ad-btn-primary" id="ad-settings-save-btn">Save Settings</button>
        </div>
      </div>

      <!-- Duplicate Suggestion Drawer (Right Side Panel) -->
      ${matchedEntry ? `
      <div class="ad-duplicate-drawer" id="ad-duplicate-drawer">
        <div class="ad-duplicate-header">
          <div class="ad-duplicate-title">
            <span>\u26A0\uFE0F</span> Already Saved in Database
          </div>
          <button type="button" class="ad-icon-btn" id="ad-duplicate-close-btn" title="Dismiss / Back">\u2715</button>
        </div>
        <div class="ad-duplicate-body">
          <div class="ad-duplicate-notice">
            This webpage is already registered in your App Directory database. You can still save it as a new entry if you wish.
          </div>
          <div class="ad-duplicate-card">
            <div class="ad-duplicate-card-header">
              <div class="ad-duplicate-card-icon">
                ${matchedEntry.iconUrl ? `<img src="${escapeHtml2(matchedEntry.iconUrl)}" alt="" onerror="this.src='https://icons.duckduckgo.com/ip3/${window.location.hostname}.ico'">` : matchedEntry.icon || "\u{1F4C1}"}
              </div>
              <div class="ad-duplicate-card-meta">
                <div class="ad-duplicate-entry-title">${escapeHtml2(matchedEntry.name || "Untitled")}</div>
                <a class="ad-duplicate-entry-url" href="${escapeHtml2(matchedEntry.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml2(matchedEntry.url)}</a>
              </div>
            </div>
            <div class="ad-duplicate-details">
              ${matchedFolders.length > 0 ? `
              <div class="ad-duplicate-detail-row">
                <span class="ad-duplicate-detail-label">Collections</span>
                <span class="ad-duplicate-detail-value">${matchedFolders.map((f) => escapeHtml2(`${f.icon || "\u{1F4C1}"} ${f.name}`)).join(", ")}</span>
              </div>` : ""}
              ${matchedEntry.hiddenFromMain ? `
              <div class="ad-duplicate-detail-row">
                <span class="ad-duplicate-detail-label">Visibility</span>
                <span class="ad-duplicate-detail-value">\u{1F648} Hidden from Main</span>
              </div>` : ""}
              ${Array.isArray(matchedEntry.categories) && matchedEntry.categories.length > 0 ? `
              <div class="ad-duplicate-detail-row" style="flex-direction: column; align-items: flex-start;">
                <span class="ad-duplicate-detail-label">Categories</span>
                <div class="ad-duplicate-tags">
                  ${matchedEntry.categories.map((c) => `<span class="ad-duplicate-tag">${escapeHtml2(c)}</span>`).join("")}
                </div>
              </div>` : ""}
              ${matchedEntry.dateAdded ? `
              <div class="ad-duplicate-detail-row">
                <span class="ad-duplicate-detail-label">Date Saved</span>
                <span class="ad-duplicate-detail-value">${new Date(matchedEntry.dateAdded).toLocaleDateString()}</span>
              </div>` : ""}
            </div>
          </div>
        </div>
        <div class="ad-duplicate-footer">
          <span class="ad-duplicate-footer-hint">Save to add another entry anyway</span>
          <button type="button" class="ad-btn ad-btn-secondary" id="ad-duplicate-dismiss-btn">Dismiss</button>
        </div>
      </div>
      ` : ""}

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
    const collectionsPicker = shadow.getElementById("ad-collections-picker");
    const hiddenGroup = shadow.getElementById("ad-hidden-from-main-group");
    const hiddenCheck = shadow.getElementById("ad-hidden-from-main-check");
    const updateExtensionHiddenVisibility = () => {
      const hasCollections = selectedFolderIds.length > 0;
      if (hiddenGroup) {
        hiddenGroup.style.display = hasCollections ? "block" : "none";
      }
      if (!hasCollections) {
        hiddenFromMain = false;
        if (hiddenCheck) hiddenCheck.checked = false;
      }
    };
    if (hiddenCheck) {
      hiddenCheck.addEventListener("change", () => {
        hiddenFromMain = hiddenCheck.checked && selectedFolderIds.length > 0;
      });
    }
    if (collectionsPicker) {
      collectionsPicker.querySelectorAll(".ad-collection-pill").forEach((pill) => {
        pill.addEventListener("click", () => {
          const fid = pill.getAttribute("data-folder-id");
          if (!fid) return;
          const idx = selectedFolderIds.indexOf(fid);
          if (idx >= 0) {
            selectedFolderIds.splice(idx, 1);
            pill.classList.remove("active");
          } else {
            selectedFolderIds.push(fid);
            pill.classList.add("active");
          }
          updateExtensionHiddenVisibility();
        });
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
        chip.innerHTML = `<span style="font-weight:700;font-size:11px;opacity:0.9;">\u2726 NEW:</span> ${escapeHtml2(trimmed)} <span class="ad-remove-tag" title="Remove">\u2715</span>`;
      } else {
        chip.innerHTML = `${escapeHtml2(trimmed)} <span class="ad-remove-tag" title="Remove">\u2715</span>`;
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
        <span class="ad-suggest-tag-name">${escapeHtml2(cat)}</span>
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
    const duplicateDrawer = shadow.getElementById("ad-duplicate-drawer");
    const duplicateBannerBtn = shadow.getElementById("ad-duplicate-banner-btn");
    const duplicateCloseBtn = shadow.getElementById("ad-duplicate-close-btn");
    const duplicateDismissBtn = shadow.getElementById("ad-duplicate-dismiss-btn");
    const closeDuplicateDrawer = () => {
      if (duplicateDrawer) duplicateDrawer.classList.remove("ad-show");
    };
    const openDuplicateDrawer = () => {
      closeSettings();
      if (duplicateDrawer) duplicateDrawer.classList.add("ad-show");
    };
    if (duplicateBannerBtn) duplicateBannerBtn.addEventListener("click", openDuplicateDrawer);
    if (duplicateCloseBtn) duplicateCloseBtn.addEventListener("click", closeDuplicateDrawer);
    if (duplicateDismissBtn) duplicateDismissBtn.addEventListener("click", closeDuplicateDrawer);
    if (matchedEntry && duplicateDrawer) {
      setTimeout(() => {
        if (!settingsDrawer?.classList.contains("ad-show")) {
          openDuplicateDrawer();
        }
      }, 280);
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
    const decisionFastPathCheck = shadow.getElementById("ad-decision-fastpath-check");
    let lastLoadedSettings = null;
    const openSettings = () => {
      closeDuplicateDrawer();
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
        if (decisionFastPathCheck && s) decisionFastPathCheck.checked = s.useDecisionFastPath !== false;
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
          autoClassify: autoclassifyCheck?.checked ?? true,
          useDecisionFastPath: decisionFastPathCheck?.checked ?? true,
          decisionConfidenceThreshold: lastLoadedSettings?.decisionConfidenceThreshold ?? 0.75
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
        classifyBadge.innerHTML = `\u{1FAB6} AI: ${escapeHtml2(cleanModel)} [Fallback]`;
        classifyBadge.title = tooltip || `Recovered via fallback model ${cleanModel} (Click to toggle reasoning)`;
      } else if (res.method === "BRAVE_GROUNDED") {
        classifyBadge.className = "ad-classify-badge ad-badge-brave";
        classifyBadge.innerHTML = `\u{1F50D} AI: Brave (${escapeHtml2(cleanModel || "Search")})`;
        classifyBadge.title = tooltip || "Classified using Brave Search grounding (Click to toggle reasoning)";
      } else {
        classifyBadge.className = "ad-classify-badge ad-badge-dom";
        classifyBadge.innerHTML = `\u2728 AI: ${escapeHtml2(cleanModel || "Direct DOM")}`;
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
          if (!isExtensionContextValid2()) return;
          if (msg.type === "PROGRESS" && msg.progress) {
            const prog = msg.progress;
            const isFallback = prog.stage === "FALLBACK_SWITCH";
            classifyBadge.className = isFallback ? "ad-classify-badge ad-badge-fallback ad-badge-loading" : "ad-classify-badge ad-badge-loading";
            classifyBadge.innerHTML = `<span class="ad-spinner-dot"></span> ${escapeHtml2(prog.message)}`;
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
              if (!isExtensionContextValid2()) return;
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
        if (!isExtensionContextValid2()) return;
        if (s && s.geminiApiKey) {
          if (reclassifyBtn) reclassifyBtn.style.display = "inline-flex";
          if (matchedEntry) {
            if (classifyBadge) {
              classifyBadge.className = "ad-classify-badge ad-badge-duplicate";
              classifyBadge.innerHTML = "\u2139\uFE0F Already Saved (Use \u21BB to Classify)";
              classifyBadge.title = "Page is already saved in App Directory. Auto AI tagging skipped to save quota. Click \u21BB (reload button) to classify anyway.";
            }
            if (reasoningCard) {
              reasoningCard.textContent = "\u2139\uFE0F Auto-classification skipped because this page is already in your database. Click the reload button (\u21BB) to run AI classification anyway.";
              reasoningCard.classList.add("ad-show");
            }
          } else if (s.autoClassify !== false) {
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
        if (!isExtensionContextValid2()) {
          alert("The extension was reloaded. Please refresh this page to save bookmarks.");
          return;
        }
      } catch (_) {
        return;
      }
      const nameInput = shadow.getElementById("ad-name-input");
      const urlInput = shadow.getElementById("ad-url-input");
      const descInput = shadow.getElementById("ad-desc-input");
      if (tagInput && tagInput.value.trim()) {
        const val = tagInput.value.trim();
        addCategoryChip(val, !availableCategories.includes(val));
      }
      const name = nameInput?.value.trim() || initialTitle;
      const url = urlInput?.value.trim() || initialUrl;
      const cleanFolderIds = [...selectedFolderIds];
      const description = descInput?.value.trim() || "";
      const newBookmark = {
        id: "entry_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9),
        name,
        url,
        iconUrl: initialIcon,
        folderIds: cleanFolderIds,
        folderId: cleanFolderIds[0] || null,
        hiddenFromMain: cleanFolderIds.length > 0 && hiddenFromMain,
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
            if (!isExtensionContextValid2()) return;
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
  function escapeHtml2(str) {
    return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  window.__APP_DIRECTORY_CLEANUP__ = () => {
    try {
      window.removeEventListener("keydown", handlePageShortcut, true);
      document.querySelectorAll("#app-directory-modal-host").forEach((node) => node.remove());
      document.querySelectorAll("#app-directory-palette-host").forEach((node) => node.remove());
    } catch (_) {
    }
  };
  function handlePageShortcut(e) {
    if (!isExtensionContextValid2()) {
      if (typeof window.__APP_DIRECTORY_CLEANUP__ === "function") {
        window.__APP_DIRECTORY_CLEANUP__();
      }
      return;
    }
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const isK = e.code === "KeyK" || e.key === "k" || e.key === "K";
    if (isK) {
      e.preventDefault();
      e.stopPropagation();
      togglePaletteModal();
      return;
    }
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
    if (isExtensionContextValid2() && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        try {
          if (!isExtensionContextValid2()) return;
          if (message && message.type === "TOGGLE_INJECTED_MODAL") {
            toggleModal();
            sendResponse({ success: true });
          } else if (message && message.type === "TOGGLE_PALETTE_MODAL") {
            togglePaletteModal();
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
