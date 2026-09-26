(() => {
  "use strict";

  const HOME_URL = new URL("../../", window.location.href).href;
  const LABEL = "Math Things.";

  const compact = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/\u00a0/g, "");

  const looksLikeMathThings = (el) => {
    const aria = compact(el.getAttribute && el.getAttribute("aria-label"));
    const text = compact(el.textContent);
    const cls = String(el.className && (el.className.baseVal || el.className) || "").toLowerCase();

    if (aria.includes("maththings")) return true;
    if (text === "maththings." || text === "maththings") return true;
    if ((cls.includes("brand") || cls.includes("logo") || cls.includes("math-things")) &&
        (text.startsWith("maththings.") || text.startsWith("maththings"))) return true;
    return false;
  };

  const scoreCandidate = (el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return Infinity;
    if (r.bottom < 0 || r.right < 0 || r.top > 180 || r.left > Math.max(360, innerWidth * 0.45)) {
      return Infinity;
    }

    const text = compact(el.textContent);
    const aria = compact(el.getAttribute && el.getAttribute("aria-label"));
    const cls = String(el.className && (el.className.baseVal || el.className) || "").toLowerCase();
    let score = Math.max(0, r.top) * 8 + Math.max(0, r.left) * 2 + (r.width * r.height) / 1500;

    if (text === "maththings." || text === "maththings" ||
        aria === "maththings." || aria === "maththings") score -= 1200;
    if (cls.includes("math-things")) score -= 900;
    if (cls.includes("brand") || cls.includes("logo")) score -= 400;

    return score;
  };

  const makeBrandHomeLink = (el) => {
    const existingAnchor = el.closest && el.closest("a");
    if (existingAnchor) {
      existingAnchor.href = HOME_URL;
      existingAnchor.setAttribute("aria-label", "Back to Math Things app menu");
      existingAnchor.title = "Back to Math Things.";
      return;
    }

    el.style.cursor = "pointer";
    el.style.pointerEvents = "auto";
    el.setAttribute("role", "link");
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    el.setAttribute("aria-label", "Back to Math Things app menu");
    el.title = "Back to Math Things.";

    const goHome = (event) => {
      if (event) event.preventDefault();
      window.location.href = HOME_URL;
    };

    el.addEventListener("click", goHome);
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") goHome(event);
    });
  };

  const injectBrand = () => {
    const a = document.createElement("a");
    a.href = HOME_URL;
    a.textContent = LABEL;
    a.setAttribute("aria-label", "Back to Math Things app menu");
    a.title = "Back to Math Things.";
    Object.assign(a.style, {
      position: "fixed",
      top: "10px",
      left: "12px",
      zIndex: "2147483646",
      fontFamily: "'Lexend', system-ui, sans-serif",
      fontSize: "15px",
      fontWeight: "800",
      letterSpacing: "-0.035em",
      lineHeight: "1",
      color: "#1e293b",
      textDecoration: "none",
      background: "rgba(245,245,247,0.88)",
      border: "1px solid rgba(30,41,59,0.10)",
      borderRadius: "8px",
      padding: "7px 9px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)"
    });
    document.body.appendChild(a);
  };


  const initNumberPad = () => {
    const isNumericInput = (el) => {
      if (!el || el.tagName !== "INPUT" || el.disabled || el.readOnly) return false;
      const type = String(el.getAttribute("type") || "text").toLowerCase();
      const mode = String(el.getAttribute("inputmode") || "").toLowerCase();
      return type === "number" || mode === "numeric" || mode === "decimal";
    };

    const host = document.createElement("div");
    host.id = "math-things-number-pad";
    host.hidden = true;
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          position: fixed;
          left: 50%;
          bottom: max(14px, env(safe-area-inset-bottom));
          transform: translateX(-50%);
          z-index: 2147483647;
          width: min(292px, calc(100vw - 24px));
          font-family: 'Lexend', system-ui, -apple-system, sans-serif;
          color: #1d1d1f;
          -webkit-tap-highlight-color: transparent;
        }
        :host([hidden]) { display: none !important; }
        .pad {
          background: rgba(250, 249, 246, 0.97);
          border: 1px solid rgba(0,0,0,0.13);
          border-radius: 20px;
          padding: 9px;
          box-shadow: 0 18px 50px rgba(0,0,0,0.24), 0 3px 10px rgba(0,0,0,0.12);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          user-select: none;
        }
        .readout {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 1px 4px 7px;
        }
        .value {
          flex: 1;
          min-width: 0;
          text-align: right;
          font-size: 20px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #3a3a3c;
        }
        .mini {
          border: 0;
          background: transparent;
          color: #737378;
          font: inherit;
          font-size: 16px;
          font-weight: 800;
          min-width: 34px;
          height: 30px;
          border-radius: 9px;
          touch-action: manipulation;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
        }
        .key {
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 13px;
          height: 52px;
          background: linear-gradient(#fff, #f0f0f2);
          color: #1d1d1f;
          font: inherit;
          font-size: 22px;
          font-weight: 700;
          box-shadow: 0 2px 0 rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.9);
          touch-action: manipulation;
        }
        .key:active, .mini:active {
          transform: translateY(1px);
          background: #e7e7e9;
        }
        .action {
          font-size: 18px;
          color: #55555a;
        }
        .done {
          background: linear-gradient(#eef4ff, #dce8ff);
          color: #244f92;
        }
      </style>
      <div class="pad" role="group" aria-label="Number keypad">
        <div class="readout">
          <button class="mini" data-action="sign" aria-label="Change sign">±</button>
          <div class="value" aria-live="polite"></div>
          <button class="mini" data-action="close" aria-label="Close keypad">×</button>
        </div>
        <div class="grid">
          <button class="key" data-key="7">7</button>
          <button class="key" data-key="8">8</button>
          <button class="key" data-key="9">9</button>
          <button class="key" data-key="4">4</button>
          <button class="key" data-key="5">5</button>
          <button class="key" data-key="6">6</button>
          <button class="key" data-key="1">1</button>
          <button class="key" data-key="2">2</button>
          <button class="key" data-key="3">3</button>
          <button class="key action" data-action="backspace" aria-label="Backspace">⌫</button>
          <button class="key" data-key="0">0</button>
          <button class="key action" data-action="decimal" aria-label="Decimal point">.</button>
          <button class="key action" data-action="clear" aria-label="Clear">C</button>
          <button class="key action" data-action="zeroes" aria-label="Add two zeroes">00</button>
          <button class="key action done" data-action="done" aria-label="Done">✓</button>
        </div>
      </div>
    `;
    document.body.appendChild(host);

    const valueEl = shadow.querySelector(".value");
    let target = null;
    let buffer = "";
    let fresh = true;
    let changed = false;

    const render = () => {
      valueEl.textContent = buffer || "0";
    };

    const commitBuffer = () => {
      if (!target) return;
      let next = buffer;
      if (next === "-" || next === "." || next === "-.") return;
      if (next.endsWith(".")) return;
      if (next === "-0") next = "0";
      target.value = next;
      changed = true;
      target.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const finish = (blur = false) => {
      if (!target) {
        host.hidden = true;
        return;
      }
      if (buffer.endsWith(".")) buffer = buffer.slice(0, -1);
      commitBuffer();
      if (changed) target.dispatchEvent(new Event("change", { bubbles: true }));
      const prior = target;
      target = null;
      host.hidden = true;
      if (blur) prior.blur();
    };

    const show = (input) => {
      if (!isNumericInput(input)) return;
      if (target !== input) {
        if (target && changed) target.dispatchEvent(new Event("change", { bubbles: true }));
        target = input;
        buffer = String(input.value || "");
        fresh = true;
        changed = false;
      }
      render();
      host.hidden = false;
    };

    const digit = (d) => {
      if (!target) return;
      if (fresh) {
        buffer = d;
        fresh = false;
      } else if (buffer === "0") {
        buffer = d;
      } else if (buffer === "-0") {
        buffer = "-" + d;
      } else {
        buffer += d;
      }
      commitBuffer();
      render();
    };

    shadow.addEventListener("pointerdown", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      event.preventDefault();

      const key = button.dataset.key;
      const action = button.dataset.action;
      if (key != null) {
        digit(key);
        return;
      }

      if (!target) return;
      fresh = false;

      if (action === "decimal") {
        if (!buffer.includes(".")) buffer = (buffer && buffer !== "-") ? buffer + "." : buffer + "0.";
      } else if (action === "backspace") {
        buffer = buffer.slice(0, -1);
        commitBuffer();
      } else if (action === "clear") {
        buffer = "";
        commitBuffer();
      } else if (action === "zeroes") {
        buffer = (buffer && buffer !== "-") ? buffer + "00" : "0";
        commitBuffer();
      } else if (action === "sign") {
        buffer = buffer.startsWith("-") ? buffer.slice(1) : "-" + buffer;
        commitBuffer();
      } else if (action === "done") {
        finish(true);
        return;
      } else if (action === "close") {
        finish(false);
        return;
      }
      render();
    });

    document.addEventListener("focusin", (event) => {
      if (isNumericInput(event.target)) show(event.target);
    });

    document.addEventListener("input", (event) => {
      if (event.target === target) {
        buffer = String(target.value || "");
        fresh = false;
        render();
      }
    });

    document.addEventListener("pointerdown", (event) => {
      const path = event.composedPath ? event.composedPath() : [];
      if (path.includes(host)) return;
      if (isNumericInput(event.target)) {
        show(event.target);
        return;
      }
      if (!host.hidden && target && event.target !== target) finish(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !host.hidden) finish(false);
    });
  };

  const init = () => {
    const pool = Array.from(document.querySelectorAll(
      ".math-things, .brand, .logo, [aria-label], header svg, #topBar svg, header div, header span"
    ));

    let best = null;
    let bestScore = Infinity;
    for (const el of pool) {
      if (!looksLikeMathThings(el)) continue;
      const score = scoreCandidate(el);
      if (score < bestScore) {
        best = el;
        bestScore = score;
      }
    }

    if (best && Number.isFinite(bestScore)) makeBrandHomeLink(best);
    else injectBrand();

    initNumberPad();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
